import React, { useState, useEffect, useMemo } from 'react'
import { orderService, Order, OrderStatus } from '../services/OrderService'
import { useSmartCache } from '../hooks/useSmartCache'
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor'

interface RealDataKDSProps {
  className?: string
}

interface KDSOrder {
  id: string
  orderNumber: string
  tableNumber?: number
  customerName?: string
  items: KDSOrderItem[]
  status: OrderStatus
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: Date
  estimatedCompletionTime?: Date
  actualCompletionTime?: Date
  preparationTime: number
  totalItems: number
  specialInstructions?: string
}

interface KDSOrderItem {
  id: string
  productName: string
  quantity: number
  status: OrderStatus
  preparationTime?: number
  specialInstructions?: string
  category?: string
}

const RealDataKDS: React.FC<RealDataKDSProps> = ({ className = '' }) => {
  const { setCache, getCache } = useSmartCache()
  const { measureRenderPerformance } = usePerformanceMonitor()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all')
  const [sortBy, setSortBy] = useState<'time' | 'priority' | 'table'>('priority')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [preparationTimes, setPreparationTimes] = useState<Map<string, number>>(new Map())

  // 載入訂單資料
  const loadOrders = async () => {
    try {
      setLoading(true)
      
      // Get orders
      const allOrders = await orderService.getOrders(100, 0)
      
      // Get order items for each order
      const ordersWithItems = await Promise.all(
        allOrders.map(async (order) => {
          try {
            const orderWithItems = await orderService.getOrderWithItems(order.id)
            return orderWithItems || order
          } catch (error) {
            console.error(`Failed to load items for order ${order.id}:`, error)
            return order
          }
        })
      )
      
      // Filter out orders that are already paid or cancelled
      const activeOrders = ordersWithItems.filter(order => 
        order.status !== OrderStatus.PAID && 
        order.status !== OrderStatus.CANCELLED
      )
      
      setOrders(activeOrders)
      setCache('kds-orders', activeOrders)
    } catch (error) {
      console.error('載入訂單失敗:', error)
      // 嘗試從快取載入
      const cachedOrders = getCache('kds-orders')
      if (cachedOrders && Array.isArray(cachedOrders)) {
        setOrders(cachedOrders as Order[])
      }
    } finally {
      setLoading(false)
    }
  }

  // 訂閱訂單變更
  useEffect(() => {
    loadOrders()
    
    const channel = orderService.subscribeToOrders((payload) => {
      console.log('Orders updated:', payload)
      // Reload orders when changes occur
      loadOrders()
    })

    return () => {
      channel.unsubscribe()
    }
  }, [])

  // 計算訂單優先級
  const calculatePriority = (order: Order): 'low' | 'medium' | 'high' | 'urgent' => {
    const waitingTime = Date.now() - new Date(order.created_at).getTime()
    const minutes = waitingTime / (1000 * 60)
    
    if (minutes > 30) return 'urgent'
    if (minutes > 20) return 'high'
    if (minutes > 10) return 'medium'
    return 'low'
  }

  // 格式化訂單項目
  const formatKDSOrder = (order: Order): KDSOrder => {
    const items: KDSOrderItem[] = order.items?.map(item => ({
      id: item.id,
      productName: item.product_name,
      quantity: item.quantity,
      status: order.status,
      preparationTime: preparationTimes.get(item.id),
      specialInstructions: item.special_instructions,
      category: undefined // category not available in OrderItem interface
    })) || []

    return {
      id: order.id,
      orderNumber: order.order_number,
      tableNumber: order.table_number,
      customerName: order.customer_name,
      items,
      status: order.status,
      priority: calculatePriority(order),
      createdAt: new Date(order.created_at),
      estimatedCompletionTime: undefined, // not available in Order interface
      actualCompletionTime: order.completed_at ? new Date(order.completed_at) : undefined,
      preparationTime: 0, // not available in Order interface
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      specialInstructions: order.notes
    }
  }

  // 過濾和排序訂單
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders

    // 過濾
    if (filter !== 'all') {
      filtered = orders.filter(order => {
        switch (filter) {
          case 'pending':
            return order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED
          case 'preparing':
            return order.status === OrderStatus.PREPARING
          case 'ready':
            return order.status === OrderStatus.READY
          default:
            return true
        }
      })
    }

    // 排序
    const kdsOrders = filtered.map(formatKDSOrder)
    
    return kdsOrders.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'time':
          return a.createdAt.getTime() - b.createdAt.getTime()
        case 'table':
          return (a.tableNumber || 0) - (b.tableNumber || 0)
        default:
          return 0
      }
    })
  }, [orders, filter, sortBy, preparationTimes])

  // 更新訂單狀態
  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus)
      
      if (newStatus === OrderStatus.READY) {
        // 記錄完成時間
        const completionTime = Date.now()
        const order = orders.find(o => o.id === orderId)
        if (order) {
          const preparationTime = completionTime - new Date(order.created_at).getTime()
          setPreparationTimes(prev => new Map(prev.set(orderId, preparationTime)))
        }
      }
    } catch (error) {
      console.error('更新訂單狀態失敗:', error)
    }
  }

  // 獲取等待時間
  const getWaitingTime = (createdAt: Date): string => {
    const waitingTime = Date.now() - createdAt.getTime()
    const minutes = Math.floor(waitingTime / (1000 * 60))
    
    if (minutes < 1) return '< 1分鐘'
    if (minutes < 60) return `${minutes}分鐘`
    
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}小時 ${remainingMinutes}分鐘`
  }

  // 優先級顏色
  const getPriorityColor = (priority: 'low' | 'medium' | 'high' | 'urgent'): string => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50'
      case 'high': return 'border-orange-500 bg-orange-50'
      case 'medium': return 'border-yellow-500 bg-yellow-50'
      case 'low': return 'border-green-500 bg-green-50'
      default: return 'border-gray-300 bg-white'
    }
  }

  // 狀態顏色
  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-gray-100 text-gray-800'
      case OrderStatus.CONFIRMED:
        return 'bg-blue-100 text-blue-800'
      case OrderStatus.PREPARING:
        return 'bg-yellow-100 text-yellow-800'
      case OrderStatus.READY:
        return 'bg-green-100 text-green-800'
      case OrderStatus.SERVED:
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入訂單中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-6 bg-gray-50 min-h-screen ${className}`}>
      {/* 標題和控制面板 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
            智能廚房顯示系統 (KDS)
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 過濾器 */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">過濾：</label>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部</option>
                <option value="pending">待處理</option>
                <option value="preparing">製作中</option>
                <option value="ready">已完成</option>
              </select>
            </div>

            {/* 排序 */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">排序：</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="priority">優先級</option>
                <option value="time">時間</option>
                <option value="table">桌號</option>
              </select>
            </div>
          </div>
        </div>

        {/* 統計信息 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {orders.filter(o => o.status === OrderStatus.PENDING || o.status === OrderStatus.CONFIRMED).length}
            </div>
            <div className="text-sm text-blue-800">待處理</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.status === OrderStatus.PREPARING).length}
            </div>
            <div className="text-sm text-yellow-800">製作中</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status === OrderStatus.READY).length}
            </div>
            <div className="text-sm text-green-800">已完成</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {orders.length}
            </div>
            <div className="text-sm text-purple-800">總訂單</div>
          </div>
        </div>
      </div>

      {/* 訂單列表 */}
      {filteredAndSortedOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-500 text-lg">暫無訂單</div>
          <p className="text-gray-400 mt-2">當有新訂單時會自動顯示在這裡</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedOrders.map((order) => (
            <div
              key={order.id}
              className={`bg-white rounded-lg shadow-md border-l-4 ${getPriorityColor(order.priority)} p-6 hover:shadow-lg transition-shadow cursor-pointer`}
              onClick={() => setSelectedOrderId(selectedOrderId === order.id ? null : order.id)}
            >
              {/* 訂單標題 */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    #{order.orderNumber}
                  </h3>
                  {order.tableNumber && (
                    <p className="text-sm text-gray-600">桌號: {order.tableNumber}</p>
                  )}
                  {order.customerName && (
                    <p className="text-sm text-gray-600">客戶: {order.customerName}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status === OrderStatus.PENDING && '待處理'}
                    {order.status === OrderStatus.CONFIRMED && '已確認'}
                    {order.status === OrderStatus.PREPARING && '製作中'}
                    {order.status === OrderStatus.READY && '已完成'}
                    {order.status === OrderStatus.SERVED && '已送達'}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    等待 {getWaitingTime(order.createdAt)}
                  </div>
                </div>
              </div>

              {/* 訂單項目 */}
              <div className="space-y-2 mb-4">
                {order.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <span className="font-medium text-gray-800">{item.productName}</span>
                      {item.specialInstructions && (
                        <p className="text-xs text-orange-600 mt-1">備註: {item.specialInstructions}</p>
                      )}
                    </div>
                    <span className="text-sm font-bold text-blue-600">x{item.quantity}</span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="text-xs text-gray-500 text-center py-2">
                    還有 {order.items.length - 3} 個項目...
                  </div>
                )}
              </div>

              {/* 特殊說明 */}
              {order.specialInstructions && (
                <div className="bg-yellow-50 rounded p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">特殊說明：</span>
                    {order.specialInstructions}
                  </p>
                </div>
              )}

              {/* 操作按鈕 */}
              <div className="flex gap-2">
                {(order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      updateOrderStatus(order.id, OrderStatus.PREPARING)
                    }}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
                  >
                    開始製作
                  </button>
                )}
                
                {order.status === OrderStatus.PREPARING && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      updateOrderStatus(order.id, OrderStatus.READY)
                    }}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
                  >
                    完成製作
                  </button>
                )}

                {order.status === OrderStatus.READY && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      updateOrderStatus(order.id, OrderStatus.SERVED)
                    }}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
                  >
                    標記送達
                  </button>
                )}
              </div>

              {/* 展開的詳細信息 */}
              {selectedOrderId === order.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">完整訂單詳情</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-1">
                        <div>
                          <span className="text-sm font-medium text-gray-700">{item.productName}</span>
                          {item.category && (
                            <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {item.category}
                            </span>
                          )}
                          {item.specialInstructions && (
                            <p className="text-xs text-orange-600 mt-1">備註: {item.specialInstructions}</p>
                          )}
                        </div>
                        <span className="text-sm font-bold text-blue-600">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>建立時間: {order.createdAt.toLocaleString()}</div>
                      {order.estimatedCompletionTime && (
                        <div>預計完成: {order.estimatedCompletionTime.toLocaleString()}</div>
                      )}
                      {order.actualCompletionTime && (
                        <div>實際完成: {order.actualCompletionTime.toLocaleString()}</div>
                      )}
                      <div>總項目數: {order.totalItems}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RealDataKDS

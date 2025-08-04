import React, { useState, useEffect } from 'react'
import { orderService, Order, OrderStatus, OrderPaymentStatus } from '../services/OrderService'

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all')
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('today')

  // 載入訂單
  const loadOrders = async () => {
    try {
      setLoading(true)
      const ordersData = await orderService.getOrders(100, 0)
      
      // 獲取詳細資料
      const ordersWithDetails = await Promise.all(
        ordersData.map(async (order) => {
          const fullOrder = await orderService.getOrderWithItems(order.id)
          return fullOrder || order
        })
      )
      
      setOrders(ordersWithDetails)
    } catch (error) {
      console.error('載入訂單失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  // 過濾訂單
  const filteredOrders = orders.filter(order => {
    // 搜尋過濾
    const matchesSearch = !searchTerm || 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.table_number?.toString().includes(searchTerm)

    // 狀態過濾
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter

    // 日期過濾
    const orderDate = new Date(order.created_at)
    const now = new Date()
    let matchesDate = true

    if (dateFilter === 'today') {
      matchesDate = orderDate.toDateString() === now.toDateString()
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      matchesDate = orderDate >= weekAgo
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      matchesDate = orderDate >= monthAgo
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  // 取消訂單
  const handleCancelOrder = async (orderId: string) => {
    if (confirm('確定要取消這個訂單嗎？')) {
      try {
        await orderService.cancelOrder(orderId)
        await loadOrders()
        alert('訂單已取消')
      } catch (error) {
        console.error('取消訂單失敗:', error)
        alert('取消訂單失敗')
      }
    }
  }

  // 處理支付
  const handleProcessPayment = async (order: Order) => {
    if (order.payment_status === OrderPaymentStatus.PAID) {
      alert('此訂單已經支付完成')
      return
    }

    try {
      const paymentMethod = prompt('請選擇支付方式 (cash/card/digital):') || 'cash'
      const result = await orderService.processPayment(
        order.id, 
        order.total_amount, 
        paymentMethod
      )

      if (result.success) {
        alert(`支付成功！交易ID: ${result.paymentId}`)
        await loadOrders()
      } else {
        alert(`支付失敗: ${result.error}`)
      }
    } catch (error) {
      console.error('處理支付失敗:', error)
      alert('處理支付失敗')
    }
  }

  // 狀態標籤
  const getStatusBadge = (status: OrderStatus) => {
    const colors = {
      [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-800',
      [OrderStatus.PREPARING]: 'bg-orange-100 text-orange-800',
      [OrderStatus.READY]: 'bg-green-100 text-green-800',
      [OrderStatus.SERVED]: 'bg-purple-100 text-purple-800',
      [OrderStatus.PAID]: 'bg-emerald-100 text-emerald-800',
      [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800'
    }

    const labels = {
      [OrderStatus.PENDING]: '待確認',
      [OrderStatus.CONFIRMED]: '已確認',
      [OrderStatus.PREPARING]: '製作中',
      [OrderStatus.READY]: '準備中',
      [OrderStatus.SERVED]: '已出餐',
      [OrderStatus.PAID]: '已付款',
      [OrderStatus.CANCELLED]: '已取消'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {labels[status]}
      </span>
    )
  }

  // 支付狀態標籤
  const getOrderPaymentStatusBadge = (status: OrderPaymentStatus) => {
    const colors = {
      [OrderPaymentStatus.UNPAID]: 'bg-red-100 text-red-800',
      [OrderPaymentStatus.PROCESSING]: 'bg-yellow-100 text-yellow-800',
      [OrderPaymentStatus.PAID]: 'bg-green-100 text-green-800',
      [OrderPaymentStatus.REFUNDED]: 'bg-blue-100 text-blue-800',
      [OrderPaymentStatus.FAILED]: 'bg-red-100 text-red-800'
    }

    const labels = {
      [OrderPaymentStatus.UNPAID]: '未付款',
      [OrderPaymentStatus.PROCESSING]: '處理中',
      [OrderPaymentStatus.PAID]: '已付款',
      [OrderPaymentStatus.REFUNDED]: '已退款',
      [OrderPaymentStatus.FAILED]: '失敗'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {labels[status]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入訂單資料中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 標題列 */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📋 訂單管理系統</h1>
            <p className="text-sm text-gray-600 mt-1">
              管理和追蹤所有訂單 • 共 {filteredOrders.length} 筆訂單
            </p>
          </div>
          
          <button
            onClick={loadOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>🔄</span>
            重新載入
          </button>
        </div>
      </div>

      {/* 過濾器 */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex flex-wrap gap-4">
          {/* 搜尋 */}
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="搜尋訂單號、客戶姓名或桌號..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 狀態過濾 */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">所有狀態</option>
            <option value={OrderStatus.PENDING}>待確認</option>
            <option value={OrderStatus.CONFIRMED}>已確認</option>
            <option value={OrderStatus.PREPARING}>製作中</option>
            <option value={OrderStatus.READY}>準備中</option>
            <option value={OrderStatus.SERVED}>已出餐</option>
            <option value={OrderStatus.PAID}>已付款</option>
            <option value={OrderStatus.CANCELLED}>已取消</option>
          </select>

          {/* 日期過濾 */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">今天</option>
            <option value="week">本週</option>
            <option value="month">本月</option>
            <option value="all">全部</option>
          </select>
        </div>
      </div>

      <div className="flex">
        {/* 訂單列表 */}
        <div className="flex-1 p-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">沒有找到訂單</h3>
              <p className="text-gray-600">調整搜尋條件或建立新訂單</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <div
                  key={order.id}
                  className={`bg-white rounded-lg shadow border transition-all duration-200 cursor-pointer hover:shadow-lg ${
                    selectedOrder?.id === order.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.order_number}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleString('zh-TW')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(order.status as OrderStatus)}
                        {getOrderPaymentStatusBadge(order.payment_status as OrderPaymentStatus)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">桌號</p>
                        <p className="text-sm text-gray-900">
                          {order.table_number ? `${order.table_number} 號桌` : '外帶'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">客戶</p>
                        <p className="text-sm text-gray-900">
                          {order.customer_name || '匿名'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">總金額</p>
                        <p className="text-sm text-gray-900 font-semibold">
                          NT$ {order.total_amount}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {order.payment_status !== OrderPaymentStatus.PAID && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleProcessPayment(order)
                          }}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          處理支付
                        </button>
                      )}
                      
                      {order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.PAID && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCancelOrder(order.id)
                          }}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                        >
                          取消訂單
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 訂單詳情 */}
        {selectedOrder && (
          <div className="w-96 bg-white border-l shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">訂單詳情</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">基本資訊</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">訂單號：</span>
                      <span className="font-medium">{selectedOrder.order_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">桌號：</span>
                      <span className="font-medium">
                        {selectedOrder.table_number ? `${selectedOrder.table_number} 號桌` : '外帶'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">客戶：</span>
                      <span className="font-medium">{selectedOrder.customer_name || '匿名'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">建立時間：</span>
                      <span className="font-medium">
                        {new Date(selectedOrder.created_at).toLocaleString('zh-TW')}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">訂單項目</h3>
                  <div className="space-y-2">
                    {selectedOrder.items?.map(item => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b">
                        <div>
                          <p className="font-medium text-gray-900">{item.product_name}</p>
                          {item.special_instructions && (
                            <p className="text-xs text-gray-600">備註: {item.special_instructions}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">x{item.quantity}</p>
                          <p className="text-sm text-gray-600">NT$ {item.total_price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">金額明細</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">小計：</span>
                      <span>NT$ {selectedOrder.subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">稅額：</span>
                      <span>NT$ {selectedOrder.tax_amount}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>總計：</span>
                      <span>NT$ {selectedOrder.total_amount}</span>
                    </div>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">備註</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderManagement

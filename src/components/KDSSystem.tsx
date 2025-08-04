import React, { useState, useEffect } from 'react'
import { orderStore } from '../store/orderStore'
import { Order, OrderItem } from '../types'
import { useSound } from '../hooks/useSound'

const KDSSystem: React.FC = () => {
  const { playSound } = useSound()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    // 初始訂單
    setOrders(orderStore.getOrders())

    // 監聽訂單變化
    const unsubscribe = orderStore.subscribe((updatedOrders) => {
      setOrders(updatedOrders)
    })

    return unsubscribe
  }, [])

  // 區域分類邏輯
  const hasKitchenItems = (items: OrderItem[]) => {
    return items.some(item => {
      if (item.category === '主餐' || item.category === '沙拉') return true
      if (item.type === 'combo' && item.comboItems) {
        return item.comboItems.main || item.comboItems.salad
      }
      return false
    })
  }

  const hasBarItems = (items: OrderItem[]) => {
    return items.some(item => {
      if (item.category === '飲料' || item.category === '甜點') return true
      if (item.type === 'combo' && item.comboItems) {
        return item.comboItems.drink || item.comboItems.dessert
      }
      return false
    })
  }

  const hasDessertItems = (items: OrderItem[]) => {
    return items.some(item => {
      if (item.category === '甜點') return true
      if (item.type === 'combo' && item.comboItems?.dessert) return true
      return false
    })
  }

  // 項目分類
  const categorizeItems = (items: OrderItem[]) => {
    const categorized: {
      套餐: Array<{item: OrderItem, index: number}>
      主餐: Array<{item: OrderItem, index: number}>
      沙拉: Array<{item: OrderItem, index: number}>
      飲料: Array<{item: OrderItem, index: number}>
      甜點: Array<{item: OrderItem, index: number}>
    } = {
      套餐: [],
      主餐: [],
      沙拉: [],
      飲料: [],
      甜點: []
    }

    items.forEach((item, index) => {
      if (item.type === 'combo') {
        categorized.套餐.push({item, index})
      } else {
        const category = item.category as keyof typeof categorized
        if (categorized[category]) {
          categorized[category].push({item, index})
        }
      }
    })

    return categorized
  }

  // 篩選訂單
  const filteredOrders = orders.filter(order => {
    if (filterStatus !== 'all' && order.status !== filterStatus) return false
    // 顯示所有狀態的訂單，包括已完成的
    return true
  })

  // 按工作區域對訂單進行分組
  const getOrdersByArea = (area: 'kitchen' | 'bar' | 'dessert') => {
    return filteredOrders.filter(order => {
      if (area === 'kitchen') {
        return hasKitchenItems(order.items)
      } else if (area === 'bar') {
        return hasBarItems(order.items)
      } else if (area === 'dessert') {
        // 甜點區域：顯示有甜點且主餐已完成的訂單
        return hasDessertItems(order.items) && (order.kitchenStatus === 'ready' || order.status === 'ready')
      }
      return false
    })
  }

  // 渲染訂單卡片
  const renderOrderCard = (order: Order) => {
    const elapsed = getElapsedTime(order.orderTime)
    
    return (
      <div
        key={order.id}
        style={getOrderCardStyle(order)}
        onClick={() => setSelectedOrder(order.id === selectedOrder ? null : order.id)}
      >

        {/* 訂單標題 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0
            }}>
              {order.orderNumber} - {order.tableNumber}
            </h3>
            {order.customerName && (
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
                {order.customerName}
              </p>
            )}
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{
              color: elapsed > 15 ? '#ef4444' : '#6b7280',
              fontSize: '0.875rem',
              fontWeight: 'bold'
            }}>
              {elapsed}分鐘前
            </div>
            {order.priority !== 'normal' && (
              <div style={{
                color: getPriorityColor(order.priority),
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {getPriorityText(order.priority)}
              </div>
            )}
          </div>
        </div>

        {/* 訂單項目 - 顯示所有項目 */}
        <div style={{ marginBottom: '1rem' }}>
          {renderAllItems(order)}
        </div>

        {/* 特殊說明 */}
        {order.specialInstructions && (
          <div style={{
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '0.5rem',
            padding: '0.5rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 'bold',
              color: '#92400e',
              marginBottom: '0.25rem'
            }}>
              📝 特殊說明：
            </div>
            <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
              {order.specialInstructions}
            </div>
          </div>
        )}

        {/* 狀態和操作按鈕 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* 狀態顯示 */}
          <div style={{
            background: getStatusColor(order.status),
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '1rem',
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}>
            {getStatusText(order.status)}
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {renderOrderButtons(order)}
          </div>
        </div>

        {/* 總金額 */}
        <div style={{
          marginTop: '1rem',
          textAlign: 'right',
          fontSize: '1rem',
          fontWeight: 'bold',
          color: '#059669'
        }}>
          總計: ${order.totalAmount}
        </div>
      </div>
    )
  }

  // 渲染所有項目（不分區域）
  const renderAllItems = (order: Order) => {
    const categorizedItems = categorizeItems(order.items)
    
    // 顯示所有類別
    const categoryOrder: string[] = ['套餐', '主餐', '沙拉', '飲料', '甜點']
    
    const categoryEmojis = {
      '套餐': '🍱',
      '主餐': '🍽️', 
      '沙拉': '🥗',
      '飲料': '🥤',
      '甜點': '🍰'
    }
    const categoryColors = {
      '套餐': '#8b5cf6',
      '主餐': '#ef4444',
      '沙拉': '#10b981', 
      '飲料': '#3b82f6',
      '甜點': '#f59e0b'
    }

    return categoryOrder.map(category => {
      const categoryItems = categorizedItems[category as keyof typeof categorizedItems]
      if (categoryItems.length === 0) return null

      return (
        <div key={category} style={{ marginBottom: '1rem' }}>
          {/* 分類標題 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem',
            padding: '0.25rem 0.5rem',
            background: categoryColors[category as keyof typeof categoryColors],
            color: 'white',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 'bold'
          }}>
            <span>{categoryEmojis[category as keyof typeof categoryEmojis]}</span>
            <span>{category}</span>
            {category === '甜點' && (
              <span style={{ 
                fontSize: '0.75rem', 
                background: 'rgba(255,255,255,0.2)', 
                padding: '0.125rem 0.25rem',
                borderRadius: '0.25rem'
              }}>
                餐後
              </span>
            )}
          </div>

          {/* 分類項目 */}
          {categoryItems.map(({item, index}) => {
            const isCompleted = order.itemCompletionStatus?.[index.toString()] || false
            
            return (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem',
                background: isCompleted ? '#f0fdf4' : '#f8fafc',
                borderRadius: '0.5rem',
                marginBottom: '0.5rem',
                border: isCompleted ? '2px solid #10b981' : '1px solid transparent',
                opacity: isCompleted ? 0.7 : 1
              }}>
                {/* 完成狀態 checkbox */}
                <div>
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={(e) => orderStore.updateItemCompletion(order.id, index, e.target.checked)}
                    style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                <div style={{ fontSize: '1.5rem' }}>{item.image}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    color: isCompleted ? '#6b7280' : '#1f2937',
                    textDecoration: isCompleted ? 'line-through' : 'none'
                  }}>
                    {item.name} x{item.quantity}
                  </div>
                  {item.type === 'combo' && item.comboItems && (
                    <div style={{ marginTop: '0.5rem' }}>
                      {renderComboItems(order, item, index)}
                    </div>
                  )}
                  {item.notes && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#7c3aed',
                      marginTop: '0.25rem',
                      background: '#f3f4f6',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      borderLeft: '3px solid #7c3aed'
                    }}>
                      📝 備註: {item.notes}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )
    }).filter(Boolean)
  }

  // 渲染套餐組件（顯示所有組件）
  const renderComboItems = (order: Order, item: OrderItem, itemIndex: number) => {
    const comboComponents = [
      { key: 'main', name: '主餐', item: item.comboItems?.main, emoji: '🍽️', category: '主餐' },
      { key: 'salad', name: '沙拉', item: item.comboItems?.salad, emoji: '🥗', category: '沙拉' },
      { key: 'drink', name: '飲料', item: item.comboItems?.drink, emoji: '🥤', category: '飲料' },
      { key: 'dessert', name: '甜點', item: item.comboItems?.dessert, emoji: '🍰', category: '甜點' }
    ]

    return comboComponents
      .filter(comboItem => comboItem.item)
      .map((comboItem) => {
        const comboItemCompleted = order.comboItemCompletionStatus?.[itemIndex.toString()]?.[comboItem.key] || false
        return (
          <div key={comboItem.key} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem',
            background: comboItemCompleted ? '#f0fdf4' : '#ffffff',
            borderRadius: '0.375rem',
            marginBottom: '0.25rem',
            border: comboItemCompleted ? '1px solid #10b981' : '1px solid #e5e7eb',
            marginLeft: '1rem'
          }}>
            {/* 套餐組件 checkbox */}
            <input
              type="checkbox"
              checked={comboItemCompleted}
              onChange={(e) => orderStore.updateComboItemCompletion(order.id, itemIndex, comboItem.key, e.target.checked)}
              style={{
                width: '1rem',
                height: '1rem',
                cursor: 'pointer'
              }}
            />
            <span style={{ fontSize: '1rem' }}>{comboItem.emoji}</span>
            <div style={{
              fontSize: '0.75rem',
              color: comboItemCompleted ? '#6b7280' : '#374151',
              textDecoration: comboItemCompleted ? 'line-through' : 'none',
              flex: 1
            }}>
              {comboItem.name}: {comboItem.item?.name}
            </div>
            {comboItem.category === '甜點' && (
              <span style={{
                fontSize: '0.625rem',
                background: '#f59e0b',
                color: 'white',
                padding: '0.125rem 0.25rem',
                borderRadius: '0.25rem'
              }}>
                餐後
              </span>
            )}
          </div>
        )
      })
  }

  // 獲取區域狀態文字
  const getAreaStatusText = (order: Order, area: 'kitchen' | 'bar' | 'dessert') => {
    if (area === 'kitchen') {
      if (order.kitchenStatus === 'pending') return '等待處理'
      if (order.kitchenStatus === 'preparing') return '廚房製作中'
      if (order.kitchenStatus === 'ready') return '廚房完成'
      return getStatusText(order.status)
    } else if (area === 'bar') {
      if (order.barStatus === 'pending') return '等待處理'
      if (order.barStatus === 'preparing') return '吧台製作中'
      if (order.barStatus === 'ready') return '吧台完成'
      return getStatusText(order.status)
    } else if (area === 'dessert') {
      if (order.dessertAfterMealStatus === 'waiting') return '等餐後甜點'
      if (order.dessertAfterMealStatus === 'ready') return '甜點可上'
      if (order.dessertAfterMealStatus === 'served') return '甜點已送'
      return '等餐後甜點'
    }
    return getStatusText(order.status)
  }

  // 渲染訂單按鈕（統一版本）
  const renderOrderButtons = (order: Order) => {
    return (
      <>
        {order.status === 'pending' && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              playSound('click')
              orderStore.updateOrderStatus(order.id, 'preparing')
            }}
            style={getButtonStyle('#3b82f6')}
          >
            開始製作
          </button>
        )}
        
        {order.status === 'preparing' && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              playSound('orderReady')
              orderStore.updateOrderStatus(order.id, 'ready')
            }}
            style={getButtonStyle('#10b981')}
          >
            製作完成
          </button>
        )}
        
        {order.status === 'ready' && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              playSound('success')
              orderStore.updateOrderStatus(order.id, 'completed')
            }}
            style={getButtonStyle('#059669')}
          >
            訂單完成
          </button>
        )}
      </>
    )
  }

  // 渲染區域按鈕
  const renderAreaButtons = (order: Order, area: 'kitchen' | 'bar' | 'dessert') => {
    if (area === 'kitchen') {
      return (
        <>
          {(!order.kitchenStatus || order.kitchenStatus === 'pending') && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                orderStore.updateKitchenStatus(order.id, 'preparing')
              }}
              style={getButtonStyle('#3b82f6')}
            >
              開始製作
            </button>
          )}
          
          {order.kitchenStatus === 'preparing' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                orderStore.updateKitchenStatus(order.id, 'ready')
              }}
              style={getButtonStyle('#10b981')}
            >
              廚房完成
            </button>
          )}
        </>
      )
    } else if (area === 'bar') {
      return (
        <>
          {(!order.barStatus || order.barStatus === 'pending') && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                orderStore.updateBarStatus(order.id, 'preparing')
              }}
              style={getButtonStyle('#3b82f6')}
            >
              開始調製
            </button>
          )}
          
          {order.barStatus === 'preparing' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                orderStore.updateBarStatus(order.id, 'ready')
              }}
              style={getButtonStyle('#10b981')}
            >
              飲料完成
            </button>
          )}
        </>
      )
    } else if (area === 'dessert') {
      return (
        <>
          {(!order.dessertAfterMealStatus || order.dessertAfterMealStatus === 'waiting') && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                orderStore.updateDessertAfterMealStatus(order.id, 'ready')
              }}
              style={getButtonStyle('#f59e0b')}
            >
              甜點可上
            </button>
          )}
          
          {order.dessertAfterMealStatus === 'ready' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                orderStore.updateDessertAfterMealStatus(order.id, 'served')
              }}
              style={getButtonStyle('#10b981')}
            >
              甜點已送
            </button>
          )}
        </>
      )
    }
    return null
  }

  // 輔助函數
  const getElapsedTime = (orderTime: Date): number => {
    return Math.floor((Date.now() - new Date(orderTime).getTime()) / (1000 * 60))
  }

  const getOrderCardStyle = (order: Order) => ({
    width: '320px',
    minHeight: '200px',
    background: 'white',
    border: `2px solid ${order.priority === 'urgent' ? '#ef4444' : '#e5e7eb'}`,
    borderRadius: '0.75rem',
    padding: '1rem',
    margin: '0.5rem',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s'
  })

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: '#6b7280',
      preparing: '#f59e0b',
      ready: '#10b981',
      completed: '#059669',
      urgent: '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  const getStatusText = (status: string): string => {
    const texts: Record<string, string> = {
      pending: '等待處理',
      preparing: '製作中',
      ready: '準備完成',
      completed: '已完成',
      urgent: '緊急'
    }
    return texts[status] || status
  }

  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      low: '#10b981',
      normal: '#6b7280',
      high: '#f59e0b',
      urgent: '#ef4444'
    }
    return colors[priority] || '#6b7280'
  }

  const getPriorityText = (priority: string): string => {
    const texts: Record<string, string> = {
      low: '低優先級',
      normal: '一般',
      high: '高優先級',
      urgent: '緊急'
    }
    return texts[priority] || priority
  }

  const getButtonStyle = (background: string) => ({
    padding: '0.5rem 1rem',
    background,
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 'bold'
  })

  const statusOptions = ['all', 'pending', 'preparing', 'ready', 'completed']

  // 計算每個狀態的訂單數量
  const getStatusCount = (status: string): number => {
    if (status === 'all') {
      return orders.length
    }
    return orders.filter(order => order.status === status).length
  }

  // 獲取狀態按鈕顯示文字（包含數量）
  const getStatusButtonText = (status: string): string => {
    const count = getStatusCount(status)
    const baseText = status === 'all' ? '全部' : getStatusText(status as any)
    return `${baseText}(${count})`
  }

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: '#f9fafb',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 標題和篩選器 */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}>
            🍳 廚房顯示系統
          </h2>
          
          {/* 狀態篩選器 */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {statusOptions.map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '2px solid',
                  borderRadius: '0.5rem',
                  borderColor: filterStatus === status ? '#4f46e5' : '#e5e7eb',
                  background: filterStatus === status ? '#4f46e5' : '#e5e7eb',
                  color: filterStatus === status ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}
              >
                {getStatusButtonText(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 區域分組訂單列表 */}
      <div style={{
        flex: 1,
        padding: '1rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* 所有訂單統一顯示 */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {filteredOrders.map(order => renderOrderCard(order))}
        </div>

        {/* 無訂單提示 */}
        {filteredOrders.length === 0 && (
          <div style={{
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280',
            fontSize: '1.125rem'
          }}>
            沒有{filterStatus === 'all' ? '' : getStatusText(filterStatus as any)}的訂單
          </div>
        )}
      </div>
    </div>
  )
}

export default KDSSystem

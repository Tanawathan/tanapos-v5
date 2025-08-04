import React, { useState, useEffect } from 'react'
import { EnhancedOrder, KDSWorkstation, KDSNotification } from '../types/enhanced-order'
import { EnhancedTable } from '../types/enhanced-table'
import ServicePriorityEngine from '../services/ServicePriorityEngine'
import { orderStore } from '../store/orderStore'
import { Order } from '../types'
import { useSound } from '../hooks/useSound'

const EnhancedKDSSystem: React.FC = () => {
  const { playSound } = useSound()
  const [orders, setOrders] = useState<EnhancedOrder[]>([])
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [currentWorkstation, setCurrentWorkstation] = useState<KDSWorkstation>({
    id: 'main-kitchen',
    name: '主廚房',
    type: 'kitchen',
    zones: ['A區', 'B區', 'C區', 'VIP區'],
    priorityCategories: ['主餐', '沙拉'],
    displaySettings: {
      maxOrders: 12,
      sortBy: 'priority',
      showTableInfo: true,
      showWaitTime: true,
      showPriority: true
    }
  })
  const [notifications, setNotifications] = useState<KDSNotification[]>([])
  const [priorityEngine] = useState(new ServicePriorityEngine())
  
  // 模擬桌位數據 (實際應該從桌位管理系統獲取)
  const [mockTables] = useState<EnhancedTable[]>([
    { id: 'A1', table_number: 'A1', capacity: 2, status: 'dining', location_zone: 'A區', service_priority: 'normal' },
    { id: 'A2', table_number: 'A2', capacity: 2, status: 'available', location_zone: 'A區', service_priority: 'normal' },
    { id: 'B1', table_number: 'B1', capacity: 4, status: 'ordered', location_zone: 'B區', service_priority: 'normal' },
    { id: 'B2', table_number: 'B2', capacity: 4, status: 'waiting_food', location_zone: 'B區', service_priority: 'high' },
    { id: 'C1', table_number: 'C1', capacity: 6, status: 'dining', location_zone: 'C區', service_priority: 'normal' },
    { id: 'VIP1', table_number: 'VIP1', capacity: 8, status: 'seated', location_zone: 'VIP區', service_priority: 'high' }
  ])

  useEffect(() => {
    // 獲取訂單並增強
    const baseOrders = orderStore.getOrders()
    const enhancedOrders = enhanceOrders(baseOrders)
    setOrders(enhancedOrders)

    // 訂閱訂單變化
    const unsubscribe = orderStore.subscribe((updatedOrders) => {
      const enhanced = enhanceOrders(updatedOrders)
      setOrders(enhanced)
      
      // 檢查新的高優先級訂單
      checkForUrgentOrders(enhanced)
    })

    return unsubscribe
  }, [])

  /**
   * 將普通訂單轉換為增強訂單
   */
  const enhanceOrders = (baseOrders: Order[]): EnhancedOrder[] => {
    return baseOrders.map(order => {
      // 尋找對應的桌位信息
      const tableInfo = mockTables.find(table => 
        table.table_number === order.tableNumber || table.id === order.tableNumber
      )
      
      const enhancedOrder: EnhancedOrder = {
        ...order,
        tableInfo: tableInfo ? {
          tableId: tableInfo.id,
          tableName: tableInfo.table_number,
          capacity: tableInfo.capacity,
          zone: tableInfo.location_zone,
          partySize: tableInfo.current_party_size || 2,
          priority: tableInfo.service_priority === 'urgent' ? 10 : 
                   tableInfo.service_priority === 'high' ? 8 : 5
        } : undefined
      }
      
      // 計算服務優先級
      enhancedOrder.servicePriority = priorityEngine.calculateServicePriority(enhancedOrder, tableInfo)
      
      return enhancedOrder
    })
  }

  /**
   * 檢查是否有緊急訂單需要通知
   */
  const checkForUrgentOrders = (orders: EnhancedOrder[]) => {
    orders.forEach(order => {
      if (order.servicePriority?.level === 'urgent') {
        const existingNotification = notifications.find(n => n.orderId === order.id)
        if (!existingNotification) {
          addNotification({
            id: `urgent_${order.id}`,
            type: 'urgent',
            title: '🚨 緊急訂單',
            message: `${order.orderNumber} - ${order.tableNumber} 需要立即處理`,
            orderId: order.id,
            tableId: order.tableInfo?.tableId,
            timestamp: new Date(),
            acknowledged: false,
            autoHide: false
          })
          playSound('error')
        }
      }
    })
  }

  /**
   * 添加通知
   */
  const addNotification = (notification: KDSNotification) => {
    setNotifications(prev => [...prev, notification])
  }

  /**
   * 確認通知
   */
  const acknowledgeNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, acknowledged: true } : n)
    )
  }

  /**
   * 過濾並排序訂單
   */
  const getFilteredAndSortedOrders = (): EnhancedOrder[] => {
    let filtered = orders.filter(order => {
      // 只顯示相關工作站的訂單
      if (currentWorkstation.type === 'kitchen') {
        return hasKitchenItems(order.items)
      } else if (currentWorkstation.type === 'bar') {
        return hasBarItems(order.items)
      } else if (currentWorkstation.type === 'dessert') {
        return hasDessertItems(order.items)
      }
      return true
    })

    // 排序
    if (currentWorkstation.displaySettings.sortBy === 'priority') {
      filtered.sort((a, b) => (b.servicePriority?.score || 0) - (a.servicePriority?.score || 0))
    } else if (currentWorkstation.displaySettings.sortBy === 'time') {
      filtered.sort((a, b) => a.orderTime.getTime() - b.orderTime.getTime())
    } else if (currentWorkstation.displaySettings.sortBy === 'table') {
      filtered.sort((a, b) => (a.tableNumber || '').localeCompare(b.tableNumber || ''))
    }

    return filtered.slice(0, currentWorkstation.displaySettings.maxOrders)
  }

  // 檢查是否包含廚房項目
  const hasKitchenItems = (items: any[]) => {
    return items.some(item => 
      item.category === '主餐' || item.category === '沙拉' ||
      (item.type === 'combo' && (item.comboItems?.main || item.comboItems?.salad))
    )
  }

  // 檢查是否包含吧台項目
  const hasBarItems = (items: any[]) => {
    return items.some(item => 
      item.category === '飲料' ||
      (item.type === 'combo' && item.comboItems?.drink)
    )
  }

  // 檢查是否包含甜點項目
  const hasDessertItems = (items: any[]) => {
    return items.some(item => 
      item.category === '甜點' ||
      (item.type === 'combo' && item.comboItems?.dessert)
    )
  }

  /**
   * 獲取優先級顏色
   */
  const getPriorityColor = (level?: string): string => {
    switch (level) {
      case 'urgent': return '#dc2626'  // 紅色
      case 'high': return '#ea580c'    // 橙色
      case 'normal': return '#2563eb'  // 藍色
      case 'low': return '#6b7280'     // 灰色
      default: return '#6b7280'
    }
  }

  /**
   * 獲取優先級標籤
   */
  const getPriorityLabel = (level?: string): string => {
    switch (level) {
      case 'urgent': return '🚨 緊急'
      case 'high': return '🔥 優先'
      case 'normal': return '⭐ 正常'
      case 'low': return '⚪ 一般'
      default: return '⚪ 一般'
    }
  }

  /**
   * 獲取等待時間
   */
  const getWaitTime = (orderTime: Date): number => {
    return Math.floor((Date.now() - orderTime.getTime()) / (1000 * 60))
  }

  /**
   * 渲染桌位信息卡片
   */
  const renderTableInfo = (order: EnhancedOrder) => {
    if (!currentWorkstation.displaySettings.showTableInfo || !order.tableInfo) {
      return null
    }

    return (
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
        padding: '0.75rem',
        marginBottom: '0.75rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{
              fontSize: '1.125rem',
              fontWeight: 'bold',
              color: '#1f2937'
            }}>
              🪑 {order.tableInfo.tableName}
            </span>
            <span style={{
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              ({order.tableInfo.capacity}人桌)
            </span>
          </div>
          <span style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            backgroundColor: '#e5e7eb',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem'
          }}>
            {order.tableInfo.zone}
          </span>
        </div>
        
        {order.tableInfo.partySize && (
          <div style={{
            fontSize: '0.875rem',
            color: '#374151'
          }}>
            👥 用餐人數: {order.tableInfo.partySize}人
          </div>
        )}
      </div>
    )
  }

  /**
   * 渲染優先級信息
   */
  const renderPriorityInfo = (order: EnhancedOrder) => {
    if (!currentWorkstation.displaySettings.showPriority || !order.servicePriority) {
      return null
    }

    return (
      <div style={{
        background: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '0.5rem',
        padding: '0.75rem',
        marginBottom: '0.75rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <span style={{
            fontSize: '0.875rem',
            fontWeight: 'bold',
            color: getPriorityColor(order.servicePriority.level)
          }}>
            {getPriorityLabel(order.servicePriority.level)}
          </span>
          <span style={{
            fontSize: '0.875rem',
            fontWeight: 'bold',
            color: '#374151'
          }}>
            評分: {order.servicePriority.score}
          </span>
        </div>
        
        {order.servicePriority.reason.length > 0 && (
          <div style={{
            fontSize: '0.75rem',
            color: '#6b7280'
          }}>
            {order.servicePriority.reason.join(' • ')}
          </div>
        )}
      </div>
    )
  }

  /**
   * 渲染訂單卡片
   */
  const renderOrderCard = (order: EnhancedOrder) => {
    const waitTime = getWaitTime(order.orderTime)
    const isSelected = selectedOrder === order.id
    
    return (
      <div
        key={order.id}
        style={{
          background: 'white',
          border: `2px solid ${
            order.servicePriority?.level === 'urgent' ? '#dc2626' :
            order.servicePriority?.level === 'high' ? '#ea580c' :
            isSelected ? '#3b82f6' : '#e5e7eb'
          }`,
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isSelected ? '0 10px 25px -3px rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
        onClick={() => setSelectedOrder(isSelected ? null : order.id)}
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
              {order.orderNumber}
            </h3>
            {order.customerName && (
              <p style={{
                color: '#6b7280',
                margin: 0,
                fontSize: '0.875rem'
              }}>
                {order.customerName}
              </p>
            )}
          </div>
          
          {currentWorkstation.displaySettings.showWaitTime && (
            <div style={{
              textAlign: 'right'
            }}>
              <div style={{
                color: waitTime > 15 ? '#dc2626' : waitTime > 10 ? '#ea580c' : '#6b7280',
                fontSize: '0.875rem',
                fontWeight: 'bold'
              }}>
                ⏱️ {waitTime}分鐘
              </div>
            </div>
          )}
        </div>

        {/* 桌位信息 */}
        {renderTableInfo(order)}

        {/* 優先級信息 */}
        {renderPriorityInfo(order)}

        {/* 訂單項目 */}
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '0.75rem'
        }}>
          {order.items.map((item, index) => (
            <div
              key={index}
              style={{
                padding: '0.5rem 0',
                borderBottom: index < order.items.length - 1 ? '1px solid #f3f4f6' : 'none'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  fontWeight: '500',
                  color: '#1f2937'
                }}>
                  {item.name}
                </span>
                <span style={{
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}>
                  x{item.quantity}
                </span>
              </div>
              
              {item.notes && (
                <div style={{
                  fontSize: '0.75rem',
                  color: '#7c3aed',
                  marginTop: '0.25rem'
                }}>
                  📝 {item.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const filteredOrders = getFilteredAndSortedOrders()

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#f8fafc'
    }}>
      {/* 標題欄 */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}>
            🧑‍🍳 {currentWorkstation.name} - 智能KDS
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            margin: 0
          }}>
            {filteredOrders.length} 個訂單 • 按{
              currentWorkstation.displaySettings.sortBy === 'priority' ? '優先級' :
              currentWorkstation.displaySettings.sortBy === 'time' ? '時間' : '桌號'
            }排序
          </p>
        </div>

        {/* 通知區域 */}
        {notifications.filter(n => !n.acknowledged).length > 0 && (
          <div style={{
            display: 'flex',
            gap: '0.5rem'
          }}>
            {notifications.filter(n => !n.acknowledged).slice(0, 3).map(notification => (
              <div
                key={notification.id}
                style={{
                  background: notification.type === 'urgent' ? '#fef2f2' : '#fef9c3',
                  border: `1px solid ${notification.type === 'urgent' ? '#fca5a5' : '#fcd34d'}`,
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  maxWidth: '200px',
                  cursor: 'pointer'
                }}
                onClick={() => acknowledgeNotification(notification.id)}
              >
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  color: notification.type === 'urgent' ? '#dc2626' : '#d97706'
                }}>
                  {notification.title}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>
                  {notification.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 訂單列表 */}
      <div style={{
        flex: 1,
        padding: '1rem 2rem',
        overflowY: 'auto'
      }}>
        {filteredOrders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#6b7280',
            padding: '4rem',
            fontSize: '1.125rem'
          }}>
            🎉 目前沒有待處理的訂單
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '1rem'
          }}>
            {filteredOrders.map(renderOrderCard)}
          </div>
        )}
      </div>
    </div>
  )
}

export default EnhancedKDSSystem

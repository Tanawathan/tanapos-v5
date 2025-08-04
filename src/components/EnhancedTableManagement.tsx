import React, { useState, useEffect } from 'react'
import { EnhancedTable, ExtendedTableStatus } from '../types/enhanced-table'
import { EnhancedOrder, TableStatusUpdate } from '../types/enhanced-order'
import { tableStatusSyncService } from '../services/TableStatusSyncService'
import ServicePriorityEngine from '../services/ServicePriorityEngine'
import { orderStore } from '../store/orderStore'
import { useSound } from '../hooks/useSound'

interface TableReservation {
  id: string
  tableId: string
  customerName: string
  partySize: number
  reservationTime: Date
  expectedDuration: number
  phoneNumber?: string
  specialRequests?: string
  status: 'confirmed' | 'seated' | 'cancelled' | 'no_show'
  priority: 'normal' | 'high' | 'vip'
}

interface ServiceAction {
  id: string
  tableId: string
  orderId?: string
  type: 'clean_table' | 'seat_guests' | 'take_order' | 'serve_food' | 'clear_table' | 'check_needs'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  description: string
  estimatedMinutes: number
  assignedStaff?: string
  status: 'pending' | 'in_progress' | 'completed'
  createdAt: Date
  completedAt?: Date
}

const EnhancedTableManagement: React.FC = () => {
  const { playSound } = useSound()
  const [tables, setTables] = useState<EnhancedTable[]>([])
  const [orders, setOrders] = useState<EnhancedOrder[]>([])
  const [reservations, setReservations] = useState<TableReservation[]>([])
  const [serviceActions, setServiceActions] = useState<ServiceAction[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [priorityEngine] = useState(new ServicePriorityEngine())
  
  // 模擬桌位數據
  const initializeTables = (): EnhancedTable[] => {
    return [
      { id: 'A1', table_number: 'A1', capacity: 2, status: 'available', location_zone: 'A區', service_priority: 'normal' },
      { id: 'A2', table_number: 'A2', capacity: 2, status: 'dining', location_zone: 'A區', service_priority: 'normal', current_party_size: 2, dining_start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
      { id: 'B1', table_number: 'B1', capacity: 4, status: 'seated', location_zone: 'B區', service_priority: 'normal', current_party_size: 4 },
      { id: 'B2', table_number: 'B2', capacity: 4, status: 'reserved', location_zone: 'B區', service_priority: 'high', reserved_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() },
      { id: 'C1', table_number: 'C1', capacity: 6, status: 'cleaning', location_zone: 'C區', service_priority: 'normal' },
      { id: 'C2', table_number: 'C2', capacity: 6, status: 'needs_service', location_zone: 'C區', service_priority: 'high', current_party_size: 5 },
      { id: 'VIP1', table_number: 'VIP1', capacity: 8, status: 'available', location_zone: 'VIP區', service_priority: 'high' },
      { id: 'VIP2', table_number: 'VIP2', capacity: 8, status: 'waiting_food', location_zone: 'VIP區', service_priority: 'urgent', current_party_size: 6 }
    ]
  }

  useEffect(() => {
    // 初始化桌位
    setTables(initializeTables())
    
    // 訂閱訂單變化
    const orderUnsubscribe = orderStore.subscribe((updatedOrders) => {
      const enhanced = enhanceOrders(updatedOrders)
      setOrders(enhanced)
    })

    // 訂閱桌位狀態同步
    const syncUnsubscribe = tableStatusSyncService.subscribe(
      'table-management',
      handleStatusUpdate,
      { sources: ['pos', 'kds'] }
    )

    return () => {
      orderUnsubscribe()
      syncUnsubscribe()
    }
  }, [])

  /**
   * 處理來自POS和KDS的狀態更新
   */
  const handleStatusUpdate = (update: TableStatusUpdate) => {
    setTables(prev => prev.map(table => {
      if (table.id === update.tableId) {
        const newStatus = update.newStatus as ExtendedTableStatus
        
        // 更新桌位狀態
        const updatedTable: EnhancedTable = {
          ...table,
          status: newStatus,
          current_order_id: update.orderId
        }

        // 根據狀態更新添加服務動作
        addServiceActionsForStatusChange(table, newStatus, update.orderId)
        
        // 播放提示音
        playSound('tableStatus')
        
        return updatedTable
      }
      return table
    }))
  }

  /**
   * 根據狀態變更添加服務動作
   */
  const addServiceActionsForStatusChange = (
    table: EnhancedTable, 
    newStatus: ExtendedTableStatus, 
    orderId?: string
  ) => {
    const actions: ServiceAction[] = []
    
    switch (newStatus) {
      case 'seated':
        actions.push({
          id: `action_${Date.now()}_1`,
          tableId: table.id,
          orderId,
          type: 'take_order',
          priority: table.location_zone.includes('VIP') ? 'high' : 'normal',
          description: '為客人點餐',
          estimatedMinutes: 5,
          status: 'pending',
          createdAt: new Date()
        })
        break
        
      case 'waiting_food':
        actions.push({
          id: `action_${Date.now()}_2`,
          tableId: table.id,
          orderId,
          type: 'serve_food',
          priority: 'high',
          description: '上菜服務',
          estimatedMinutes: 3,
          status: 'pending',
          createdAt: new Date()
        })
        break
        
      case 'needs_service':
        actions.push({
          id: `action_${Date.now()}_3`,
          tableId: table.id,
          orderId,
          type: 'check_needs',
          priority: 'urgent',
          description: '檢查客人需求',
          estimatedMinutes: 2,
          status: 'pending',
          createdAt: new Date()
        })
        break
        
      case 'cleaning':
        actions.push({
          id: `action_${Date.now()}_4`,
          tableId: table.id,
          type: 'clean_table',
          priority: 'normal',
          description: '清理桌面',
          estimatedMinutes: 5,
          status: 'pending',
          createdAt: new Date()
        })
        break
    }
    
    if (actions.length > 0) {
      setServiceActions(prev => [...prev, ...actions])
    }
  }

  /**
   * 增強訂單信息
   */
  const enhanceOrders = (baseOrders: any[]): EnhancedOrder[] => {
    return baseOrders.map(order => {
      const tableInfo = tables.find(table => 
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
   * 手動更新桌位狀態
   */
  const updateTableStatus = (tableId: string, newStatus: ExtendedTableStatus) => {
    const table = tables.find(t => t.id === tableId)
    if (!table) return

    // 發布狀態更新
    tableStatusSyncService.updateFromTableManagement(
      table.current_order_id || `manual_${Date.now()}`,
      tableId,
      newStatus,
      { source: 'table_management', timestamp: new Date() }
    )

    // 本地更新
    setTables(prev => prev.map(t => 
      t.id === tableId ? { ...t, status: newStatus } : t
    ))
  }

  /**
   * 獲取狀態顏色
   */
  const getStatusColor = (status: ExtendedTableStatus): string => {
    switch (status) {
      case 'available': return '#10b981'     // 綠色
      case 'seated': return '#f59e0b'        // 琥珀色
      case 'reserved': return '#3b82f6'      // 藍色
      case 'ordered': return '#8b5cf6'       // 紫色
      case 'waiting_food': return '#f97316'  // 橙色
      case 'dining': return '#ef4444'        // 紅色
      case 'needs_service': return '#dc2626' // 深紅色
      case 'cleaning': return '#6b7280'      // 灰色
      default: return '#6b7280'
    }
  }

  /**
   * 獲取狀態標籤
   */
  const getStatusLabel = (status: ExtendedTableStatus): string => {
    switch (status) {
      case 'available': return '✅ 空桌'
      case 'seated': return '🪑 已入座'
      case 'reserved': return '📅 預約中'
      case 'ordered': return '📝 已點餐'
      case 'waiting_food': return '⏳ 等待上菜'
      case 'dining': return '🍽️ 用餐中'
      case 'needs_service': return '🔔 需要服務'
      case 'cleaning': return '🧽 清理中'
      default: return '❓ 未知'
    }
  }

  /**
   * 獲取桌位的待處理動作
   */
  const getPendingActions = (tableId: string): ServiceAction[] => {
    return serviceActions.filter(action => 
      action.tableId === tableId && action.status === 'pending'
    ).sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  /**
   * 完成服務動作
   */
  const completeServiceAction = (actionId: string) => {
    setServiceActions(prev => prev.map(action => 
      action.id === actionId 
        ? { ...action, status: 'completed', completedAt: new Date() }
        : action
    ))
    playSound('success')
  }

  /**
   * 渲染桌位卡片
   */
  const renderTableCard = (table: EnhancedTable) => {
    const pendingActions = getPendingActions(table.id)
    const relatedOrder = orders.find(order => order.tableInfo?.tableId === table.id)
    const isSelected = selectedTable === table.id

    return (
      <div
        key={table.id}
        style={{
          border: `3px solid ${getStatusColor(table.status)}`,
          borderRadius: '1rem',
          padding: '1rem',
          backgroundColor: isSelected ? '#f0f9ff' : 'white',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isSelected ? '0 10px 25px -3px rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          position: 'relative'
        }}
        onClick={() => setSelectedTable(isSelected ? null : table.id)}
      >
        {/* 桌位標題 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}>
            🪑 {table.table_number}
          </h3>
          <span style={{
            fontSize: '0.875rem',
            color: getStatusColor(table.status),
            fontWeight: 'bold'
          }}>
            {getStatusLabel(table.status)}
          </span>
        </div>

        {/* 桌位信息 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <span>容量: {table.capacity}人</span>
          <span>{table.location_zone}</span>
        </div>

        {/* 當前用餐信息 */}
        {table.current_party_size && (
          <div style={{
            backgroundColor: '#f3f4f6',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            marginBottom: '0.75rem',
            fontSize: '0.875rem'
          }}>
            👥 當前: {table.current_party_size}人
            {table.dining_start_time && (
              <div style={{ color: '#6b7280' }}>
                用餐時間: {new Date(table.dining_start_time).toLocaleTimeString()}
              </div>
            )}
          </div>
        )}

        {/* 相關訂單信息 */}
        {relatedOrder && (
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #dbeafe',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            marginBottom: '0.75rem',
            fontSize: '0.875rem'
          }}>
            📋 訂單: {relatedOrder.orderNumber}
            {relatedOrder.servicePriority && (
              <div style={{
                color: relatedOrder.servicePriority.level === 'urgent' ? '#dc2626' : 
                      relatedOrder.servicePriority.level === 'high' ? '#ea580c' : '#6b7280'
              }}>
                優先級: {relatedOrder.servicePriority.score}分
              </div>
            )}
          </div>
        )}

        {/* 待處理動作 */}
        {pendingActions.length > 0 && (
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
              📋 待處理動作 ({pendingActions.length})
            </div>
            {pendingActions.slice(0, 2).map(action => (
              <div
                key={action.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.25rem'
                }}
              >
                <span>{action.description}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    completeServiceAction(action.id)
                  }}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer'
                  }}
                >
                  完成
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 快速動作按鈕 */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginTop: '0.75rem'
        }}>
          {table.status === 'available' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                updateTableStatus(table.id, 'seated')
              }}
              style={{
                padding: '0.5rem',
                fontSize: '0.75rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                flex: 1
              }}
            >
              入座
            </button>
          )}
          
          {table.status === 'cleaning' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                updateTableStatus(table.id, 'available')
              }}
              style={{
                padding: '0.5rem',
                fontSize: '0.75rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                flex: 1
              }}
            >
              清理完成
            </button>
          )}
          
          {(table.status === 'dining' || table.status === 'needs_service') && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                updateTableStatus(table.id, 'cleaning')
              }}
              style={{
                padding: '0.5rem',
                fontSize: '0.75rem',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                flex: 1
              }}
            >
              結帳離桌
            </button>
          )}
        </div>
      </div>
    )
  }

  const totalTables = tables.length
  const availableTables = tables.filter(t => t.status === 'available').length
  const occupiedTables = tables.filter(t => ['seated', 'dining', 'ordered', 'waiting_food'].includes(t.status)).length
  const pendingServiceActions = serviceActions.filter(a => a.status === 'pending').length

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
            🏢 智能桌位管理系統
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            margin: 0
          }}>
            實時同步 • 智能優先級 • 服務流程自動化
          </p>
        </div>

        {/* 統計信息 */}
        <div style={{
          display: 'flex',
          gap: '1rem'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '0.75rem',
            backgroundColor: '#f0f9ff',
            borderRadius: '0.5rem'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
              {availableTables}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              空桌
            </div>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '0.75rem',
            backgroundColor: '#fef3c7',
            borderRadius: '0.5rem'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
              {occupiedTables}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              使用中
            </div>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '0.75rem',
            backgroundColor: '#fef2f2',
            borderRadius: '0.5rem'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
              {pendingServiceActions}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              待處理
            </div>
          </div>
        </div>
      </div>

      {/* 桌位網格 */}
      <div style={{
        flex: 1,
        padding: '2rem',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {tables.map(renderTableCard)}
        </div>
      </div>
    </div>
  )
}

export default EnhancedTableManagement

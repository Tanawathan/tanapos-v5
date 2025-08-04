import React, { useState, useEffect, useMemo } from 'react'
import type { 
  EnhancedTable, 
  TableRecommendation, 
  SmartTableSelector,
  ExtendedTableStatus 
} from '../types/enhanced-table'
import { SmartTableRecommendation } from '../services/SmartTableRecommendation'
import { TableAvailabilityChecker } from '../services/TableAvailabilityChecker'

interface SmartTableSelectorProps {
  partySize: number
  selectedTableId: string | null
  onTableSelect: (tableId: string, tableNumber: string) => void
  preferences?: {
    zone?: string
    maxWaitTime?: number
    serviceLevel?: 'standard' | 'priority' | 'vip'
  }
}

// 模擬桌位數據（實際應該從API獲取）
const mockTables: EnhancedTable[] = [
  {
    id: 'table-a1',
    table_number: 'A1',
    capacity: 2,
    status: 'available',
    service_priority: 'normal',
    location_zone: 'window',
    notes: '靠窗座位'
  },
  {
    id: 'table-a2',
    table_number: 'A2',
    capacity: 2,
    status: 'cleaning',
    service_priority: 'normal',
    location_zone: 'window'
  },
  {
    id: 'table-b1',
    table_number: 'B1',
    capacity: 4,
    status: 'available',
    service_priority: 'high',
    location_zone: 'center',
    notes: '中央位置，環境佳'
  },
  {
    id: 'table-b2',
    table_number: 'B2',
    capacity: 4,
    status: 'dining',
    service_priority: 'normal',
    location_zone: 'center',
    dining_start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'table-c1',
    table_number: 'C1',
    capacity: 6,
    status: 'available',
    service_priority: 'normal',
    location_zone: 'private'
  },
  {
    id: 'table-c2',
    table_number: 'C2',
    capacity: 6,
    status: 'reserved',
    service_priority: 'urgent',
    location_zone: 'private',
    reserved_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    reserved_by: '預約客戶'
  },
  {
    id: 'table-vip1',
    table_number: 'VIP1',
    capacity: 8,
    status: 'available',
    service_priority: 'urgent',
    location_zone: 'vip',
    notes: 'VIP包廂'
  },
  {
    id: 'table-takeout',
    table_number: '外帶',
    capacity: 999,
    status: 'available',
    service_priority: 'normal',
    location_zone: 'takeout'
  },
  {
    id: 'table-delivery',
    table_number: '外送',
    capacity: 999,
    status: 'available',
    service_priority: 'normal',
    location_zone: 'delivery'
  }
]

export const SmartTableSelectorComponent: React.FC<SmartTableSelectorProps> = ({
  partySize,
  selectedTableId,
  onTableSelect,
  preferences
}) => {
  const [recommendations, setRecommendations] = useState<SmartTableSelector | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'available' | 'recommended'>('recommended')
  const [showDetails, setShowDetails] = useState<string | null>(null)

  const smartRecommendation = useMemo(() => {
    return new SmartTableRecommendation(mockTables)
  }, [])

  // 獲取推薦
  useEffect(() => {
    if (partySize > 0) {
      setLoading(true)
      smartRecommendation.getSmartRecommendations(partySize, preferences)
        .then(setRecommendations)
        .finally(() => setLoading(false))
    }
  }, [partySize, preferences, smartRecommendation])

  // 獲取狀態顏色
  const getStatusColor = (status: ExtendedTableStatus): string => {
    const colors = {
      available: '#10b981',     // 綠色
      cleaning: '#f59e0b',      // 橙色  
      dining: '#ef4444',        // 紅色
      reserved: '#3b82f6',      // 藍色
      seated: '#8b5cf6',        // 紫色
      ordered: '#06b6d4',       // 青色
      waiting_food: '#f97316',  // 深橙
      needs_service: '#dc2626'  // 深紅
    }
    return colors[status] || '#6b7280'
  }

  // 獲取狀態標籤
  const getStatusLabel = (status: ExtendedTableStatus): string => {
    const labels = {
      available: '可用',
      cleaning: '清理中',
      dining: '用餐中',
      reserved: '已預約',
      seated: '已入座',
      ordered: '已點餐',
      waiting_food: '等待上菜',
      needs_service: '需要服務'
    }
    return labels[status] || status
  }

  // 獲取適合度顏色
  const getSuitabilityColor = (suitability: string): string => {
    const colors = {
      perfect: '#10b981',
      good: '#f59e0b', 
      acceptable: '#6b7280'
    }
    return colors[suitability] || '#6b7280'
  }

  // 獲取適合度標籤
  const getSuitabilityLabel = (suitability: string): string => {
    const labels = {
      perfect: '完美匹配',
      good: '良好',
      acceptable: '可接受'
    }
    return labels[suitability] || suitability
  }

  // 渲染桌位卡片
  const renderTableCard = (recommendation: TableRecommendation) => {
    const { table, score, reasons, estimatedWaitTime, suitability } = recommendation
    const isSelected = selectedTableId === table.id
    const isRecommended = score >= 0.7

    return (
      <div
        key={table.id}
        onClick={() => onTableSelect(table.id, table.table_number)}
        style={{
          border: `2px solid ${isSelected ? '#4f46e5' : isRecommended ? '#10b981' : '#e5e7eb'}`,
          borderRadius: '0.75rem',
          padding: '1rem',
          cursor: 'pointer',
          background: isSelected ? '#f8fafc' : '#ffffff',
          transition: 'all 0.2s ease',
          position: 'relative',
          boxShadow: isRecommended ? '0 4px 12px rgba(16, 185, 129, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
        onMouseEnter={() => setShowDetails(table.id)}
        onMouseLeave={() => setShowDetails(null)}
      >
        {/* 推薦標誌 */}
        {isRecommended && (
          <div style={{
            position: 'absolute',
            top: '-8px',
            right: '16px',
            background: '#10b981',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}>
            ⭐ 推薦
          </div>
        )}

        {/* 桌號和容量 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#1f2937'
          }}>
            {table.table_number}
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            👥 {table.capacity === 999 ? '無限' : `${table.capacity}人`}
          </div>
        </div>

        {/* 狀態和等待時間 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <div style={{
            background: getStatusColor(table.status),
            color: 'white',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.375rem',
            fontSize: '0.75rem',
            fontWeight: '500'
          }}>
            {getStatusLabel(table.status)}
          </div>
          {estimatedWaitTime > 0 && (
            <div style={{
              fontSize: '0.75rem',
              color: '#f59e0b',
              fontWeight: '500'
            }}>
              等待 {estimatedWaitTime}分鐘
            </div>
          )}
        </div>

        {/* 適合度和分數 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <div style={{
            background: getSuitabilityColor(suitability),
            color: 'white',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.375rem',
            fontSize: '0.75rem'
          }}>
            {getSuitabilityLabel(suitability)}
          </div>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: 'bold',
            color: score >= 0.8 ? '#10b981' : score >= 0.6 ? '#f59e0b' : '#6b7280'
          }}>
            {Math.round(score * 100)}分
          </div>
        </div>

        {/* 區域和備註 */}
        {table.location_zone && (
          <div style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            marginBottom: '0.25rem'
          }}>
            📍 {table.location_zone}
          </div>
        )}

        {table.notes && (
          <div style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            fontStyle: 'italic'
          }}>
            💡 {table.notes}
          </div>
        )}

        {/* 推薦原因（懸停顯示） */}
        {showDetails === table.id && reasons.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            right: '0',
            background: '#1f2937',
            color: 'white',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            zIndex: 10,
            marginTop: '0.5rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>推薦原因：</div>
            {reasons.map((reason, index) => (
              <div key={index} style={{ marginBottom: '0.25rem' }}>
                {reason}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        color: '#6b7280'
      }}>
        <div style={{ marginRight: '0.5rem' }}>🔄</div>
        載入智能推薦中...
      </div>
    )
  }

  if (!recommendations) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        color: '#6b7280'
      }}>
        請先選擇用餐人數以獲取智能推薦
      </div>
    )
  }

  const filteredRecommendations = recommendations.recommendations.filter(rec => {
    switch (selectedFilter) {
      case 'available':
        return rec.table.status === 'available'
      case 'recommended':
        return rec.score >= 0.6
      default:
        return true
    }
  })

  return (
    <div style={{ padding: '1rem' }}>
      {/* 標題和摘要 */}
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '0.5rem'
        }}>
          🎯 智能桌位推薦 ({partySize}人用餐)
        </h3>
        
        {recommendations.waitTime > 0 && (
          <div style={{
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div style={{ color: '#92400e', fontSize: '0.875rem' }}>
              ⏰ 預計等待時間：{recommendations.waitTime}分鐘
            </div>
          </div>
        )}

        {/* 建議操作 */}
        {recommendations.suggestedActions.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            {recommendations.suggestedActions.map((action, index) => (
              <div key={index} style={{
                background: '#ecfdf5',
                border: '1px solid #10b981',
                borderRadius: '0.375rem',
                padding: '0.5rem',
                fontSize: '0.875rem',
                color: '#065f46',
                marginBottom: '0.25rem'
              }}>
                {action}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 篩選器 */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        {[
          { key: 'recommended', label: '推薦桌位', count: recommendations.recommendations.filter(r => r.score >= 0.6).length },
          { key: 'available', label: '立即可用', count: recommendations.availableTables.length },
          { key: 'all', label: '全部', count: recommendations.recommendations.length }
        ].map(filter => (
          <button
            key={filter.key}
            onClick={() => setSelectedFilter(filter.key as any)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: selectedFilter === filter.key ? '#4f46e5' : '#f3f4f6',
              color: selectedFilter === filter.key ? 'white' : '#374151',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>

      {/* 桌位網格 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1rem',
        position: 'relative'
      }}>
        {filteredRecommendations.length > 0 ? (
          filteredRecommendations.map(renderTableCard)
        ) : (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '2rem',
            color: '#6b7280'
          }}>
            沒有符合條件的桌位
          </div>
        )}
      </div>
    </div>
  )
}

export default SmartTableSelectorComponent

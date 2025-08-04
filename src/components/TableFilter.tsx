import React from 'react'
import { TableStatus, TABLE_STATUS_MAP, TABLE_STATUS_COLORS } from '../types'
import { useTableStore } from '../stores/tableStore'

interface TableFilterProps {
  selectedStatus: TableStatus | 'all'
  onStatusChange: (status: TableStatus | 'all') => void
  selectedArea: string
  onAreaChange: (area: string) => void
  selectedCapacity: number | null
  onCapacityChange: (capacity: number | null) => void
}

export const TableFilter: React.FC<TableFilterProps> = ({
  selectedStatus,
  onStatusChange,
  selectedArea,
  onAreaChange,
  selectedCapacity,
  onCapacityChange
}) => {
  const { tables } = useTableStore()

  // 獲取狀態圖標
  const getStatusIcon = (status: TableStatus) => {
    switch (status) {
      case 'available': return '🟢'
      case 'seated': return '🟡'
      case 'dining': return '🔴'
      case 'cleaning': return '🟠'
      case 'reserved': return '🔵'
      default: return '⚪'
    }
  }

  // 計算每個狀態的桌位數量
  const getStatusCount = (status: TableStatus | 'all') => {
    if (status === 'all') {
      return tables.length
    }
    return tables.filter(table => table.status === status).length
  }

  // 獲取所有可用的區域
  const getAvailableAreas = () => {
    const areas = Array.from(new Set(tables.map(table => table.area).filter(Boolean)))
    return areas.sort()
  }

  // 獲取所有可用的容量
  const getAvailableCapacities = () => {
    const capacities = Array.from(new Set(tables.map(table => table.capacity)))
    return capacities.sort((a, b) => a - b)
  }

  const statusOptions: Array<{ key: TableStatus | 'all', label: string, color?: string }> = [
    { key: 'all', label: '全部' },
    { key: 'available', label: TABLE_STATUS_MAP.available, color: TABLE_STATUS_COLORS.available },
    { key: 'seated', label: TABLE_STATUS_MAP.seated, color: TABLE_STATUS_COLORS.seated },
    { key: 'dining', label: TABLE_STATUS_MAP.dining, color: TABLE_STATUS_COLORS.dining },
    { key: 'cleaning', label: TABLE_STATUS_MAP.cleaning, color: TABLE_STATUS_COLORS.cleaning },
    { key: 'reserved', label: TABLE_STATUS_MAP.reserved, color: TABLE_STATUS_COLORS.reserved }
  ]

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* 狀態篩選 */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-slate-700 self-center mr-2">狀態:</span>
        {statusOptions.map(({ key, label, color }) => {
          const count = getStatusCount(key)
          const isSelected = selectedStatus === key
          
          return (
            <button
              key={key}
              className={`
                flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isSelected
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }
              `}
              onClick={() => onStatusChange(key)}
              style={isSelected && color ? { backgroundColor: color } : {}}
            >
              {key !== 'all' && (
                <span>{getStatusIcon(key as TableStatus)}</span>
              )}
              <span>{label}</span>
              <span className={`
                text-xs px-1.5 py-0.5 rounded-full
                ${isSelected ? 'bg-white/20' : 'bg-slate-100'}
              `}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* 區域篩選 */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-700">區域:</span>
        <select
          value={selectedArea}
          onChange={(e) => onAreaChange(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
        >
          <option value="">全部區域</option>
          {getAvailableAreas().map((area) => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>
      </div>

      {/* 容量篩選 */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-700">容量:</span>
        <select
          value={selectedCapacity || ''}
          onChange={(e) => onCapacityChange(e.target.value ? Number(e.target.value) : null)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
        >
          <option value="">全部容量</option>
          {getAvailableCapacities().map((capacity) => (
            <option key={capacity} value={capacity}>{capacity}人桌</option>
          ))}
        </select>
      </div>
    </div>
  )
}

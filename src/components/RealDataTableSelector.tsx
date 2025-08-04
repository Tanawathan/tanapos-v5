import React, { useState, useEffect, useMemo } from 'react'
import { useRealData } from '../services/RealDataService'
import { useSmartCache } from '../hooks/useSmartCache'
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor'

interface RealDataTableSelectorProps {
  onTableSelect: (tableId: string) => void
  selectedTableId?: string
  className?: string
  partySize?: number
}

interface TableStats {
  tableId: string
  avgOrderValue: number
  avgDuration: number
  totalOrders: number
  popularProducts: string[]
  lastUsed: Date | null
  efficiency: number
}

const RealDataTableSelector: React.FC<RealDataTableSelectorProps> = ({ 
  onTableSelect, 
  selectedTableId, 
  className = '',
  partySize = 2
}) => {
  const { useTables, useOrders, service } = useRealData()
  const { tables, loading: tablesLoading } = useTables()
  const { orders, loading: ordersLoading } = useOrders()
  const { setCache, getCache } = useSmartCache()
  const { measureRenderPerformance } = usePerformanceMonitor()

  const [tableStats, setTableStats] = useState<Map<string, TableStats>>(new Map())
  const [smartRecommendations, setSmartRecommendations] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'number' | 'status' | 'efficiency' | 'recommendation'>('recommendation')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // 計算桌位統計數據
  const calculateTableStats = useMemo(() => {
    const statsMap = new Map<string, TableStats>()
    
    tables.forEach(table => {
      const tableOrders = orders.filter(order => order.table_id === table.id)
      
      if (tableOrders.length === 0) {
        statsMap.set(table.id, {
          tableId: table.id,
          avgOrderValue: 0,
          avgDuration: 0,
          totalOrders: 0,
          popularProducts: [],
          lastUsed: null,
          efficiency: table.capacity >= partySize ? 70 : 40 // 基礎效率
        })
        return
      }

      const avgOrderValue = tableOrders.reduce((sum, order) => sum + order.total_amount, 0) / tableOrders.length
      const completedOrders = tableOrders.filter(order => order.status === 'completed')
      
      // 計算平均用餐時間（估算）
      const avgDuration = completedOrders.length > 0 
        ? 60 + Math.random() * 30 // 60-90分鐘估算
        : 60

      // 熱門產品
      const productCounts = new Map<string, number>()
      tableOrders.forEach(order => {
        order.order_items?.forEach(item => {
          const count = productCounts.get(item.product_name) || 0
          productCounts.set(item.product_name, count + item.quantity)
        })
      })
      
      const popularProducts = Array.from(productCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([product]) => product)

      // 最後使用時間
      const lastUsed = tableOrders.length > 0 
        ? new Date(Math.max(...tableOrders.map(order => new Date(order.created_at).getTime())))
        : null

      // 效率評分 (基於翻桌率、客單價、容量適配)
      const capacityMatch = table.capacity >= partySize && table.capacity <= partySize + 2 ? 1 : 0.7
      const efficiency = Math.min(100, 
        (avgOrderValue / 1000) * 30 + 
        (tableOrders.length / Math.max(1, tableOrders.length / 10)) * 40 + 
        capacityMatch * 30
      )

      statsMap.set(table.id, {
        tableId: table.id,
        avgOrderValue,
        avgDuration,
        totalOrders: tableOrders.length,
        popularProducts,
        lastUsed,
        efficiency
      })
    })

    return statsMap
  }, [tables, orders, partySize])

  // 智能推薦算法
  const generateSmartRecommendations = useMemo(() => {
    const availableTables = tables.filter(table => table.status === 'available')
    
    if (availableTables.length === 0) return []

    const recommendations = availableTables
      .map(table => {
        const stats = calculateTableStats.get(table.id)
        let score = 0

        // 效率分數 (30%)
        score += (stats?.efficiency || 50) * 0.3

        // 容量適配分數 (40%) - 重要的是適合人數
        const capacityUtilization = partySize / table.capacity
        let capacityScore = 0
        if (capacityUtilization >= 0.5 && capacityUtilization <= 1) {
          capacityScore = 100 // 理想容量
        } else if (capacityUtilization > 1) {
          capacityScore = 0 // 容量不足
        } else {
          capacityScore = 60 // 容量過大但可用
        }
        score += capacityScore * 0.4

        // 位置分散性分數 (20%)
        const nearbyOccupiedTables = tables.filter(t => 
          t.status === 'occupied' && 
          Math.abs(t.table_number - table.table_number) <= 2
        ).length
        const dispersionScore = Math.max(0, 100 - nearbyOccupiedTables * 30)
        score += dispersionScore * 0.2

        // 使用頻率平衡分數 (10%)
        const daysSinceLastUse = stats?.lastUsed 
          ? (Date.now() - stats.lastUsed.getTime()) / (1000 * 60 * 60 * 24)
          : 30
        const balanceScore = Math.min(100, daysSinceLastUse * 5)
        score += balanceScore * 0.1

        return { tableId: table.id, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(rec => rec.tableId)

    return recommendations
  }, [tables, calculateTableStats, partySize])

  // 更新統計數據和推薦
  useEffect(() => {
    setTableStats(calculateTableStats)
    setSmartRecommendations(generateSmartRecommendations)
  }, [calculateTableStats, generateSmartRecommendations])

  // 桌位排序
  const sortedTables = useMemo(() => {
    const sorted = [...tables]
    
    switch (sortBy) {
      case 'number':
        return sorted.sort((a, b) => a.table_number - b.table_number)
      case 'status':
        return sorted.sort((a, b) => {
          const statusOrder = { available: 0, reserved: 1, occupied: 2, cleaning: 3, maintenance: 4 }
          return statusOrder[a.status] - statusOrder[b.status]
        })
      case 'efficiency':
        return sorted.sort((a, b) => {
          const statsA = tableStats.get(a.id)
          const statsB = tableStats.get(b.id)
          return (statsB?.efficiency || 0) - (statsA?.efficiency || 0)
        })
      case 'recommendation':
        return sorted.sort((a, b) => {
          const aIsRecommended = smartRecommendations.includes(a.id)
          const bIsRecommended = smartRecommendations.includes(b.id)
          if (aIsRecommended && !bIsRecommended) return -1
          if (!aIsRecommended && bIsRecommended) return 1
          if (aIsRecommended && bIsRecommended) {
            return smartRecommendations.indexOf(a.id) - smartRecommendations.indexOf(b.id)
          }
          return a.table_number - b.table_number
        })
      default:
        return sorted
    }
  }, [tables, sortBy, tableStats, smartRecommendations])

  // 桌位過濾
  const filteredTables = useMemo(() => {
    if (filterStatus === 'all') return sortedTables
    return sortedTables.filter(table => table.status === filterStatus)
  }, [sortedTables, filterStatus])

  // 桌位狀態顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 border-green-400 text-green-800'
      case 'occupied': return 'bg-red-100 border-red-400 text-red-800'
      case 'reserved': return 'bg-yellow-100 border-yellow-400 text-yellow-800'
      case 'cleaning': return 'bg-blue-100 border-blue-400 text-blue-800'
      case 'maintenance': return 'bg-gray-100 border-gray-400 text-gray-800'
      default: return 'bg-gray-100 border-gray-400 text-gray-800'
    }
  }

  // 狀態中文顯示
  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return '可用'
      case 'occupied': return '使用中'
      case 'reserved': return '已預約'
      case 'cleaning': return '清潔中'
      case 'maintenance': return '維護中'
      default: return status
    }
  }

  // 容量適配度評估
  const getCapacityFit = (tableCapacity: number) => {
    if (tableCapacity < partySize) return { text: '容量不足', color: 'text-red-600' }
    if (tableCapacity === partySize) return { text: '完美適配', color: 'text-green-600' }
    if (tableCapacity <= partySize + 2) return { text: '適合', color: 'text-blue-600' }
    return { text: '容量過大', color: 'text-yellow-600' }
  }

  if (tablesLoading || ordersLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 控制面板 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">用餐人數:</label>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                {partySize} 人
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">排序:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="recommendation">智能推薦</option>
                <option value="number">桌號</option>
                <option value="status">狀態</option>
                <option value="efficiency">效率</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">過濾:</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部</option>
                <option value="available">可用</option>
                <option value="occupied">使用中</option>
                <option value="reserved">已預約</option>
                <option value="cleaning">清潔中</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            總計 {tables.length} 桌，可用 {tables.filter(t => t.status === 'available').length} 桌
          </div>
        </div>
      </div>

      {/* 智能推薦提示 */}
      {smartRecommendations.length > 0 && filterStatus === 'all' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <h3 className="text-sm font-semibold text-blue-800">智能推薦桌位 ({partySize} 人用餐)</h3>
          </div>
          <p className="text-sm text-blue-700">
            基於容量適配、效率分析和位置分散性，推薦以下桌位：
            {smartRecommendations.map((tableId, index) => {
              const table = tables.find(t => t.id === tableId)
              return table ? (
                <span key={tableId} className="font-medium">
                  {index > 0 ? ', ' : ' '}
                  {table.table_number}號桌 ({table.capacity}人座)
                </span>
              ) : null
            })}
          </p>
        </div>
      )}

      {/* 桌位網格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredTables.map((table) => {
          const stats = tableStats.get(table.id)
          const isRecommended = smartRecommendations.includes(table.id)
          const isSelected = selectedTableId === table.id
          const capacityFit = getCapacityFit(table.capacity)
          
          return (
            <div
              key={table.id}
              onClick={() => table.status === 'available' && onTableSelect(table.id)}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
                ${isSelected ? 'ring-4 ring-blue-300' : ''}
                ${table.status === 'available' ? 'hover:shadow-lg hover:scale-105' : 'cursor-not-allowed opacity-75'}
                ${isRecommended ? 'ring-2 ring-blue-400 shadow-lg' : ''}
                ${getStatusColor(table.status)}
              `}
            >
              {/* 推薦標記 */}
              {isRecommended && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <span>⭐</span>
                  <span>推薦</span>
                </div>
              )}

              {/* 桌位信息 */}
              <div className="text-center space-y-2">
                <div className="text-xl font-bold">
                  {table.table_number}號桌
                </div>
                
                <div className="text-sm space-y-1">
                  {table.name && <div className="font-medium">{table.name}</div>}
                  <div>容量: {table.capacity}人</div>
                  <div className={`text-xs font-medium ${capacityFit.color}`}>
                    {capacityFit.text}
                  </div>
                  <div className="px-2 py-1 rounded text-xs font-medium">
                    {getStatusText(table.status)}
                  </div>
                </div>

                {/* 統計信息 */}
                {stats && stats.totalOrders > 0 && (
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>效率: {stats.efficiency.toFixed(0)}%</div>
                    <div>歷史訂單: {stats.totalOrders}</div>
                    <div>平均客單: NT${stats.avgOrderValue.toFixed(0)}</div>
                    {stats.popularProducts.length > 0 && (
                      <div className="text-xs truncate" title={stats.popularProducts[0]}>
                        熱門: {stats.popularProducts[0]}
                      </div>
                    )}
                  </div>
                )}

                {/* 新桌位標記 */}
                {(!stats || stats.totalOrders === 0) && (
                  <div className="text-xs text-gray-500">
                    新桌位
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 無資料提示 */}
      {filteredTables.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-2xl mb-2">🍽️</div>
          <div>沒有符合條件的桌位</div>
        </div>
      )}
    </div>
  )
}

export default RealDataTableSelector

import React, { useState, useEffect } from 'react'
import { useTableStore } from '../stores/tableStore'
import { orderStore } from '../store/orderStore'
import { TableStatus as TableStatusType, Table, TABLE_STATUS_MAP, TABLE_STATUS_COLORS } from '../types'
import { formatCurrency } from '../utils/formatters'

// 現代化桌位卡片組件
const TableCard: React.FC<{
  table: Table
  onStatusChange: (tableId: string, status: TableStatusType) => void
  onQuickOrder: (table: Table) => void
}> = ({ table, onStatusChange, onQuickOrder }) => {
  const [showActions, setShowActions] = useState(false)

  const getStatusInfo = (status: TableStatusType) => {
    switch (status) {
      case 'available': 
        return { icon: '✨', color: 'emerald', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' }
      case 'seated': 
        return { icon: '�', color: 'amber', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' }
      case 'dining': 
        return { icon: '🍽️', color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' }
      case 'cleaning': 
        return { icon: '🧹', color: 'orange', bgColor: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-200' }
      case 'reserved': 
        return { icon: '�', color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' }
      default: 
        return { icon: '❓', color: 'gray', bgColor: 'bg-gray-50', textColor: 'text-gray-700', borderColor: 'border-gray-200' }
    }
  }

  const getDiningDuration = () => {
    if (!table.seatedTime) return null
    const duration = Math.floor((Date.now() - table.seatedTime.getTime()) / (1000 * 60))
    return duration
  }

  const statusInfo = getStatusInfo(table.status)
  const diningDuration = getDiningDuration()

  return (
    <div className="group relative">
      <div
        className={`
          relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 
          cursor-pointer transform hover:-translate-y-1 overflow-hidden
          ${statusInfo.borderColor} border-2 ${statusInfo.bgColor}
        `}
        onClick={() => setShowActions(!showActions)}
      >
        {/* 頂部狀態條 */}
        <div className={`h-2 w-full bg-gradient-to-r from-${statusInfo.color}-400 to-${statusInfo.color}-600`} />
        
        {/* 主要內容區 */}
        <div className="p-4">
          {/* 桌號和狀態 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full bg-${statusInfo.color}-100 flex items-center justify-center`}>
                <span className="text-lg">{statusInfo.icon}</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{table.number}</h3>
                <p className="text-xs text-gray-500">{table.capacity}人桌</p>
              </div>
            </div>
            
            {/* 狀態標籤 */}
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.textColor} ${statusInfo.bgColor} border ${statusInfo.borderColor}`}>
              {TABLE_STATUS_MAP[table.status]}
            </div>
          </div>

          {/* 詳細資訊 */}
          <div className="space-y-2 mb-4">
            {table.customersCount && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">當前人數</span>
                <span className="font-semibold text-gray-900">{table.customersCount}/{table.capacity}</span>
              </div>
            )}
            
            {diningDuration !== null && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">用餐時間</span>
                <span className="font-semibold text-gray-900">{diningDuration}分鐘</span>
              </div>
            )}
            
            {table.totalAmount && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">消費金額</span>
                <span className="font-bold text-green-600">${table.totalAmount}</span>
              </div>
            )}
          </div>

          {/* 操作按鈕 */}
          {(table.status === 'seated' || table.status === 'dining') && (
            <button
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2.5 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg"
              onClick={(e) => {
                e.stopPropagation()
                onQuickOrder(table)
              }}
            >
              <span className="mr-2">🍽️</span>
              快速點餐
            </button>
          )}
        </div>

        {/* Hover效果光暈 */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* 快速操作彈窗 */}
      {showActions && (
        <div className="absolute top-full left-0 right-0 mt-3 z-30 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 backdrop-blur-sm">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">更改桌位狀態</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              className="flex items-center justify-center space-x-1 py-2.5 px-3 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors text-sm font-medium"
              onClick={() => onStatusChange(table.id, 'available')}
            >
              <span>✨</span>
              <span>空桌</span>
            </button>
            <button
              className="flex items-center justify-center space-x-1 py-2.5 px-3 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors text-sm font-medium"
              onClick={() => onStatusChange(table.id, 'seated')}
            >
              <span>�</span>
              <span>入座</span>
            </button>
            <button
              className="flex items-center justify-center space-x-1 py-2.5 px-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium"
              onClick={() => onStatusChange(table.id, 'dining')}
            >
              <span>🍽️</span>
              <span>用餐</span>
            </button>
            <button
              className="flex items-center justify-center space-x-1 py-2.5 px-3 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors text-sm font-medium"
              onClick={() => onStatusChange(table.id, 'cleaning')}
            >
              <span>🧹</span>
              <span>清理</span>
            </button>
          </div>
        </div>
      )}
      
      {/* 點擊外部關閉 */}
      {showActions && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  )
}

// 現代化統計面板組件
const TableStatisticsSidebar: React.FC<{ statistics: any }> = ({ statistics }) => {
  const {
    totalTables,
    usedTables,
    availableRate,
    averageDiningTime,
    cleaningTables
  } = statistics

  const availableTables = totalTables - usedTables
  const usageRate = 100 - availableRate

  const stats = [
    { 
      label: '總桌數', 
      value: totalTables, 
      icon: '🏬', 
      color: 'slate',
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-700',
      valueColor: 'text-slate-900'
    },
    { 
      label: '可用桌', 
      value: availableTables, 
      icon: '✨', 
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      valueColor: 'text-emerald-700'
    },
    { 
      label: '使用中', 
      value: usedTables, 
      icon: '🍽️', 
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      valueColor: 'text-red-700'
    },
    { 
      label: '空桌率', 
      value: `${availableRate}%`, 
      icon: '📊', 
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      valueColor: 'text-blue-700'
    }
  ]

  if (cleaningTables > 0) {
    stats.push({ 
      label: '待清理', 
      value: cleaningTables, 
      icon: '🧹', 
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      valueColor: 'text-orange-700'
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <span className="text-white text-lg">📊</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">即時統計</h3>
          <p className="text-sm text-gray-500">桌位使用情況</p>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-xl p-4 border border-${stat.color}-100`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <span className="text-lg">{stat.icon}</span>
                </div>
                <span className={`font-medium ${stat.textColor}`}>{stat.label}</span>
              </div>
              <span className={`text-2xl font-bold ${stat.valueColor}`}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 使用率進度條 */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-gray-700">桌位使用率</span>
          <span className="text-lg font-bold text-gray-900">{usageRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${usageRate}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  )
}

export const TableStatus: React.FC = () => {
  const {
    tables,
    filteredTables,
    statistics,
    filterStatus,
    initializeTables,
    setFilterStatus,
    updateTableStatus
  } = useTableStore()
  
  const [searchTerm, setSearchTerm] = useState('')

  // 初始化桌位資料
  useEffect(() => {
    initializeTables()
  }, [initializeTables])

  // 處理桌位狀態變更
  const handleStatusChange = (tableId: string, newStatus: TableStatusType) => {
    updateTableStatus(tableId, newStatus)
  }

  // 處理快速點餐
  const handleQuickOrder = (table: Table) => {
    console.log('快速點餐:', table.number)
    // TODO: 開啟點餐界面
    alert(`為 ${table.number} 桌開始點餐`)
  }

  // 過濾桌位（加入搜尋功能）
  const searchFilteredTables = filteredTables.filter((table) => {
    if (!searchTerm) return true
    return table.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
           table.area.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // 按區域分組
  const groupedTables = searchFilteredTables.reduce((acc, table) => {
    if (!acc[table.area]) {
      acc[table.area] = []
    }
    acc[table.area].push(table)
    return acc
  }, {} as Record<string, Table[]>)

  const statusOptions = [
    { key: 'all' as const, label: '全部', icon: '�', color: 'slate' },
    { key: 'available' as const, label: '空桌', icon: '✨', color: 'emerald' },
    { key: 'seated' as const, label: '已入座', icon: '�', color: 'amber' },
    { key: 'dining' as const, label: '用餐中', icon: '🍽️', color: 'red' },
    { key: 'cleaning' as const, label: '待清理', icon: '🧹', color: 'orange' },
    { key: 'reserved' as const, label: '預約中', icon: '�', color: 'blue' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 現代化頂部導航 */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* 左側標題 */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">🪑</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  桌況管理系統
                </h1>
                <p className="text-sm text-gray-500">即時監控・智能管理</p>
              </div>
            </div>
            
            {/* 右側搜尋和工具 */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜尋桌號或區域..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 w-80 bg-white/50 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-200 text-sm"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <button className="p-3 bg-white/50 backdrop-blur-sm border border-white/30 rounded-2xl hover:bg-white/70 transition-all duration-200">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-4">
          {/* 左側主要內容區 */}
          <div className="flex-1">
            {/* 狀態篩選標籤 */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-3 bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                {statusOptions.map(({ key, label, icon, color }) => {
                  const count = key === 'all' ? tables.length : tables.filter(t => t.status === key).length
                  const isSelected = filterStatus === key
                  
                  return (
                    <button
                      key={key}
                      onClick={() => setFilterStatus(key)}
                      className={`
                        flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200
                        ${isSelected
                          ? `bg-${color}-500 text-white shadow-lg shadow-${color}-500/25 transform scale-105`
                          : 'bg-white/70 text-gray-700 hover:bg-white/90 hover:shadow-md'
                        }
                      `}
                    >
                      <span className="text-lg">{icon}</span>
                      <span>{label}</span>
                      <span className={`
                        text-xs px-2 py-1 rounded-full font-semibold
                        ${isSelected ? 'bg-white/20' : 'bg-gray-100'}
                      `}>
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 桌位網格 */}
            <div className="space-y-8">
              {Object.entries(groupedTables).map(([area, tables]) => (
                <div key={area} className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/30">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">📍</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{area}</h2>
                      <p className="text-sm text-gray-500">{tables.length} 桌位</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {tables.map((table) => (
                      <TableCard
                        key={table.id}
                        table={table}
                        onStatusChange={handleStatusChange}
                        onQuickOrder={handleQuickOrder}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 空狀態 */}
            {searchFilteredTables.length === 0 && (
              <div className="text-center py-16 bg-white/40 backdrop-blur-md rounded-2xl border border-white/30">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-gray-400 text-4xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">沒有找到符合條件的桌位</h3>
                <p className="text-gray-500">請調整篩選條件或搜尋關鍵字</p>
              </div>
            )}
          </div>

          {/* 右側統計面板 */}
          <div className="w-72 space-y-4">
            <TableStatisticsSidebar statistics={statistics} />
            
            {/* 快速操作面板 */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">🚀</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">快速操作</h3>
                  <p className="text-sm text-gray-500">一鍵管理功能</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3.5 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                  <span>🧹</span>
                  <span>全部清台</span>
                </button>
                <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3.5 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                  <span>📊</span>
                  <span>生成報表</span>
                </button>
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3.5 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                  <span>⚙️</span>
                  <span>桌位設定</span>
                </button>
              </div>
            </div>

            {/* 最近活動面板 */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">📝</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">最近活動</h3>
                  <p className="text-sm text-gray-500">即時狀態更新</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl border border-white/30">
                  <span className="text-xl">🟡</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">A-01 客人入座</p>
                    <p className="text-xs text-gray-500">2分前</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl border border-white/30">
                  <span className="text-xl">🔴</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">B-05 開始用餐</p>
                    <p className="text-xs text-gray-500">5分前</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl border border-white/30">
                  <span className="text-xl">🟢</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">A-03 清台完成</p>
                    <p className="text-xs text-gray-500">8分前</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { TableStatistics } from '../types'
import { formatPercentage } from '../utils/formatters'

interface TableStatisticsPanelProps {
  statistics: TableStatistics
}

export const TableStatisticsPanel: React.FC<TableStatisticsPanelProps> = ({
  statistics
}) => {
  const {
    totalTables,
    usedTables,
    availableRate,
    averageDiningTime,
    turnoverRate,
    cleaningTables
  } = statistics

  const availableTables = totalTables - usedTables

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* 總桌數 */}
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-800">{totalTables}</div>
          <div className="text-xs text-slate-600">總桌數</div>
        </div>

        {/* 可用桌數 */}
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{availableTables}</div>
          <div className="text-xs text-slate-600">可用桌</div>
        </div>

        {/* 使用中桌數 */}
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{usedTables}</div>
          <div className="text-xs text-slate-600">使用中</div>
        </div>

        {/* 空桌率 */}
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatPercentage(availableRate, 0)}
          </div>
          <div className="text-xs text-slate-600">空桌率</div>
        </div>

        {/* 平均用餐時間 */}
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{averageDiningTime}</div>
          <div className="text-xs text-slate-600">平均用餐(分)</div>
        </div>

        {/* 待清理桌數 */}
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{cleaningTables}</div>
          <div className="text-xs text-slate-600">待清理</div>
        </div>
      </div>

      {/* 使用率進度條 */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
          <span>桌位使用率</span>
          <span>{formatPercentage(100 - availableRate, 0)}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${100 - availableRate}%` }}
          />
        </div>
      </div>
    </div>
  )
}

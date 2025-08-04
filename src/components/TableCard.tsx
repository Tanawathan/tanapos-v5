import React, { useState } from 'react'
import { Table, TableStatus, TABLE_STATUS_MAP, TABLE_STATUS_COLORS } from '../types'
import { formatTime, formatCurrency } from '../utils/formatters'

interface TableCardProps {
  table: Table
  onStatusChange: (tableId: string, status: TableStatus) => void
  onQuickOrder: (table: Table) => void
  onAddNote: (tableId: string, note: string) => void
  onSetEstimatedTime: (tableId: string, time: Date) => void
}

export const TableCard: React.FC<TableCardProps> = ({
  table,
  onStatusChange,
  onQuickOrder,
  onAddNote,
  onSetEstimatedTime
}) => {
  const [showActions, setShowActions] = useState(false)
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [noteText, setNoteText] = useState(table.notes || '')

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

  // 獲取用餐時長
  const getDiningDuration = () => {
    if (!table.seatedTime) return null
    const duration = Math.floor((Date.now() - table.seatedTime.getTime()) / (1000 * 60))
    return duration
  }

  // 處理狀態切換
  const handleStatusChange = (newStatus: TableStatus) => {
    onStatusChange(table.id, newStatus)
    setShowActions(false)
  }

  // 處理備註保存
  const handleSaveNote = () => {
    onAddNote(table.id, noteText)
    setShowNoteInput(false)
  }

  // 獲取可用的狀態選項
  const getAvailableStatusOptions = (): TableStatus[] => {
    switch (table.status) {
      case 'available':
        return ['seated', 'reserved']
      case 'seated':
        return ['dining', 'available']
      case 'dining':
        return ['cleaning', 'available']
      case 'cleaning':
        return ['available']
      case 'reserved':
        return ['seated', 'available']
      default:
        return []
    }
  }

  const diningDuration = getDiningDuration()
  const statusColor = TABLE_STATUS_COLORS[table.status]

  return (
    <div className="relative group">
      {/* 主要桌位卡片 */}
      <div
        className={`
          bg-white rounded-xl shadow-sm border-2 transition-all duration-200 cursor-pointer
          hover:shadow-md hover:scale-105 active:scale-95
          ${showActions ? 'ring-2 ring-blue-500 shadow-lg' : ''}
        `}
        style={{ borderColor: statusColor }}
        onClick={() => setShowActions(!showActions)}
      >
        {/* 狀態指示器 */}
        <div className="absolute -top-2 -right-2 z-10">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md"
            style={{ backgroundColor: statusColor }}
          >
            {getStatusIcon(table.status)}
          </div>
        </div>

        {/* 卡片內容 */}
        <div className="p-4">
          {/* 桌號和容量 */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-slate-800">{table.number}</h3>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
              {table.capacity}人桌
            </span>
          </div>

          {/* 狀態標籤 */}
          <div className="mb-3">
            <span
              className="text-xs font-medium px-2 py-1 rounded-full text-white"
              style={{ backgroundColor: statusColor }}
            >
              {TABLE_STATUS_MAP[table.status]}
            </span>
          </div>

          {/* 詳細資訊 */}
          <div className="space-y-1 text-xs text-slate-600">
            {/* 人數資訊 */}
            {table.customersCount && (
              <div className="flex items-center justify-between">
                <span>當前人數:</span>
                <span className="font-medium">{table.customersCount}/{table.capacity}</span>
              </div>
            )}

            {/* 用餐時長 */}
            {diningDuration !== null && (
              <div className="flex items-center justify-between">
                <span>用餐時長:</span>
                <span className="font-medium">{diningDuration}分鐘</span>
              </div>
            )}

            {/* 消費金額 */}
            {table.totalAmount && (
              <div className="flex items-center justify-between">
                <span>消費金額:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(table.totalAmount)}
                </span>
              </div>
            )}

            {/* 備註 */}
            {table.notes && (
              <div className="mt-2 p-2 bg-slate-50 rounded text-xs">
                💬 {table.notes}
              </div>
            )}
          </div>

          {/* 快速點餐按鈕 */}
          {(table.status === 'seated' || table.status === 'dining') && (
            <button
              className="w-full mt-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium py-2 rounded-lg hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation()
                onQuickOrder(table)
              }}
            >
              🍽️ 快速點餐
            </button>
          )}
        </div>
      </div>

      {/* 操作面板 */}
      {showActions && (
        <div className="absolute top-full left-0 right-0 mt-2 z-20">
          <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-4">
            {/* 狀態切換按鈕 */}
            <div className="mb-3">
              <p className="text-xs font-medium text-slate-700 mb-2">切換狀態:</p>
              <div className="grid grid-cols-2 gap-2">
                {getAvailableStatusOptions().map((status) => (
                  <button
                    key={status}
                    className="text-xs py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    onClick={() => handleStatusChange(status)}
                  >
                    {getStatusIcon(status)} {TABLE_STATUS_MAP[status]}
                  </button>
                ))}
              </div>
            </div>

            {/* 備註功能 */}
            <div className="border-t border-slate-200 pt-3">
              {!showNoteInput ? (
                <button
                  className="text-xs text-blue-600 hover:text-blue-700"
                  onClick={() => setShowNoteInput(true)}
                >
                  💬 {table.notes ? '編輯備註' : '添加備註'}
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="輸入備註..."
                    className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      className="flex-1 text-xs py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={handleSaveNote}
                    >
                      保存
                    </button>
                    <button
                      className="flex-1 text-xs py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                      onClick={() => {
                        setShowNoteInput(false)
                        setNoteText(table.notes || '')
                      }}
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 點擊外部關閉操作面板 */}
      {showActions && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  )
}

import React, { useState } from 'react'
import { Table } from '../types'
import { orderStore } from '../store/orderStore'
import { useTableStore } from '../stores/tableStore'

interface QuickOrderModalProps {
  table: Table
  onClose: () => void
}

export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({
  table,
  onClose
}) => {
  const { updateTableStatus } = useTableStore()
  const [customerName, setCustomerName] = useState('')
  const [customersCount, setCustomersCount] = useState(table.customersCount || 1)
  const [notes, setNotes] = useState('')

  // 處理建立訂單
  const handleCreateOrder = () => {
    // 建立新訂單的基本資料
    const newOrder = {
      id: `order_${Date.now()}`,
      orderNumber: `${table.number}-${Date.now().toString().slice(-4)}`,
      tableNumber: table.number,
      customerName: customerName || undefined,
      items: [], // 空的項目列表，稍後在點餐頁面添加
      totalAmount: 0,
      status: 'pending' as const,
      orderTime: new Date(),
      priority: 'normal' as const,
      specialInstructions: notes || undefined
    }

    // 添加到訂單系統
    orderStore.addOrder(newOrder)

    // 更新桌位狀態
    if (table.status === 'seated') {
      updateTableStatus(table.id, 'dining')
    }

    // 關閉彈窗並導向點餐頁面
    onClose()
    
    // TODO: 導向點餐頁面，傳入桌號和訂單資訊
    console.log('Created order for table:', table.number, newOrder)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl p-6 shadow-xl max-w-md w-full mx-4">
        {/* 標題 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">快速點餐</h3>
            <p className="text-slate-600">桌號: {table.number}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 表單 */}
        <div className="space-y-4">
          {/* 客戶姓名 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              客戶姓名 (選填)
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="輸入客戶姓名..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* 用餐人數 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              用餐人數
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCustomersCount(Math.max(1, customersCount - 1))}
                className="w-8 h-8 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 flex items-center justify-center"
              >
                -
              </button>
              <span className="w-12 text-center font-medium">{customersCount}</span>
              <button
                onClick={() => setCustomersCount(Math.min(table.capacity, customersCount + 1))}
                className="w-8 h-8 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 flex items-center justify-center"
              >
                +
              </button>
              <span className="text-sm text-slate-500">/ {table.capacity}人</span>
            </div>
          </div>

          {/* 備註 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              特殊需求 (選填)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="過敏資訊、特殊要求等..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            取消
          </button>
          <button
            onClick={handleCreateOrder}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-md transition-all duration-200"
          >
            開始點餐
          </button>
        </div>

        {/* 桌位資訊 */}
        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">桌位容量:</span>
            <span className="font-medium">{table.capacity}人桌</span>
          </div>
          {table.area && (
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-slate-600">所在區域:</span>
              <span className="font-medium">{table.area}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { useTableStore } from '../stores/tableStore'
import { useSound } from '../hooks/useSound'

export const TableManagement: React.FC = () => {
  const { playSound } = useSound()
  const { tables, updateTableStatus } = useTableStore()
  const [showBatchActions, setShowBatchActions] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // 批次清理所有待清理桌位
  const handleBatchClean = () => {
    playSound('tableStatus')
    const cleaningTables = tables.filter(table => table.status === 'cleaning')
    cleaningTables.forEach(table => {
      updateTableStatus(table.id, 'available')
    })
    setShowBatchActions(false)
  }

  // 獲取待清理桌位數量
  const cleaningTablesCount = tables.filter(table => table.status === 'cleaning').length

  return (
    <>
      {/* 浮動操作按鈕 */}
      <div className="fixed bottom-6 right-6 z-30">
        <div className="flex flex-col gap-3">
          {/* 批次操作按鈕 */}
          {cleaningTablesCount > 0 && (
            <button
              onClick={() => setShowBatchActions(!showBatchActions)}
              className="w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-all duration-200 flex items-center justify-center group"
            >
              <span className="text-xl">🧹</span>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {cleaningTablesCount}
              </div>
            </button>
          )}

          {/* 設定按鈕 */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-14 h-14 bg-slate-600 text-white rounded-full shadow-lg hover:bg-slate-700 transition-all duration-200 flex items-center justify-center"
          >
            <span className="text-xl">⚙️</span>
          </button>
        </div>
      </div>

      {/* 批次操作面板 */}
      {showBatchActions && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowBatchActions(false)}
          />
          <div className="relative bg-white rounded-xl p-6 shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4">批次操作</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div>
                  <p className="font-medium text-slate-800">清理完成</p>
                  <p className="text-sm text-slate-600">
                    將所有待清理桌位標記為可用
                  </p>
                </div>
                <button
                  onClick={handleBatchClean}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  執行 ({cleaningTablesCount})
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowBatchActions(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 設定面板 */}
      {showSettings && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowSettings(false)}
          />
          <div className="relative bg-white rounded-xl p-6 shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4">桌位設定</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="font-medium text-slate-800 mb-2">顯示選項</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">顯示用餐時長</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">顯示消費金額</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">顯示客人數量</span>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="font-medium text-slate-800 mb-2">自動功能</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">自動清理提醒</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">用餐時間警告</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                取消
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

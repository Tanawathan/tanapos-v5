import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface DatabaseStatus {
  connected: boolean
  loading: boolean
  error: string | null
  stats: {
    restaurants: number
    categories: number
    products: number
    tables: number
    orders: number
  } | null
}

const DatabaseStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<DatabaseStatus>({
    connected: false,
    loading: true,
    error: null,
    stats: null
  })

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const checkDatabaseStatus = async () => {
    setStatus(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      // 測試基本連接
      const { count: restaurantCount, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*', { count: 'exact', head: true })
      
      if (restaurantError) throw restaurantError

      // 取得各表統計
      const [categoriesResult, productsResult, tablesResult, ordersResult] = await Promise.all([
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('tables').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true })
      ])

      setStatus({
        connected: true,
        loading: false,
        error: null,
        stats: {
          restaurants: restaurantCount || 0,
          categories: categoriesResult.count || 0,
          products: productsResult.count || 0,
          tables: tablesResult.count || 0,
          orders: ordersResult.count || 0
        }
      })
    } catch (error: any) {
      setStatus({
        connected: false,
        loading: false,
        error: error.message,
        stats: null
      })
    }
  }

  if (status.loading) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
          <span>檢查資料庫連接...</span>
        </div>
      </div>
    )
  }

  if (!status.connected) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-800 px-4 py-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <span>❌</span>
          <div>
            <div className="font-medium">資料庫連接失敗</div>
            <div className="text-sm">{status.error}</div>
            <button
              onClick={checkDatabaseStatus}
              className="text-xs underline hover:no-underline mt-1"
            >
              重新檢查
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-800 px-4 py-2 rounded-lg shadow-lg">
      <div className="flex items-center gap-2">
        <span>✅</span>
        <div>
          <div className="font-medium">Supabase 已連接</div>
          {status.stats && (
            <div className="text-xs mt-1 grid grid-cols-2 gap-1">
              <span>分類: {status.stats.categories}</span>
              <span>產品: {status.stats.products}</span>
              <span>桌位: {status.stats.tables}</span>
              <span>訂單: {status.stats.orders}</span>
            </div>
          )}
          <button
            onClick={checkDatabaseStatus}
            className="text-xs underline hover:no-underline mt-1"
          >
            重新檢查
          </button>
        </div>
      </div>
    </div>
  )
}

export default DatabaseStatusIndicator

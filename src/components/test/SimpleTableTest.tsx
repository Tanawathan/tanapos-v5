import React, { useState, useEffect } from 'react'
import { useTableStore } from '../../stores/tableStore'

// 簡化的桌台管理組件用於測試
const SimpleTableTest: React.FC = () => {
  const { tables, initializeTables } = useTableStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('🔧 SimpleTableTest: 開始初始化')
    
    const timer = setTimeout(() => {
      try {
        initializeTables()
        console.log('✅ SimpleTableTest: 初始化完成，桌台數量:', tables.length)
        setLoading(false)
      } catch (error) {
        console.error('❌ SimpleTableTest: 初始化失敗', error)
        setError(error instanceof Error ? error.message : '初始化失敗')
        setLoading(false)
      }
    }, 1000) // 延遲1秒確保store完全載入

    return () => clearTimeout(timer)
  }, [initializeTables])

  // 監聽 tables 變化
  useEffect(() => {
    console.log('📊 Tables 數據變化:', tables.length)
    if (tables.length > 0 && loading) {
      setLoading(false)
    }
  }, [tables, loading])

  if (error) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        color: 'red'
      }}>
        <h2>❌ 載入錯誤</h2>
        <p>{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <h2 style={{ color: '#059669', marginBottom: '1rem' }}>載入桌台管理系統...</h2>
        <div className="loading-spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #059669',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '1rem auto'
        }} />
        <p style={{ color: '#6b7280' }}>正在初始化桌台數據 (當前: {tables.length} 個桌台)</p>
        <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '0.5rem' }}>
          載入時間: {Math.floor((Date.now() % 60000) / 1000)} 秒
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🏢 桌台管理系統測試</h1>
      <p>桌台數量: {tables.length}</p>
      
      {tables.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '1rem',
          marginTop: '1rem'
        }}>
          {tables.slice(0, 12).map((table) => (
            <div 
              key={table.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1rem',
                backgroundColor: '#f9f9f9'
              }}
            >
              <h3>桌號 {table.number}</h3>
              <p>區域: {table.area}</p>
              <p>容量: {table.capacity} 人</p>
              <p>狀態: {table.status}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>沒有桌台數據</p>
      )}
    </div>
  )
}

export default SimpleTableTest

import React from 'react'

const TestPage: React.FC = () => {
  return (
    <div style={{
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ color: '#059669', marginBottom: '2rem' }}>
        🎉 TanaPOS V4-Mini 系統測試
      </h1>
      
      <div style={{
        backgroundColor: '#f0f9ff',
        border: '1px solid #0ea5e9',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h2>✅ 系統狀態正常</h2>
        <p>所有主要錯誤已修復：</p>
        <ul>
          <li>✅ ModernTableManagement 組件正常載入</li>
          <li>✅ TableStatusNew 導入問題已修復</li>
          <li>✅ Manifest 圖標問題已解決</li>
          <li>✅ 桌台數據初始化正常</li>
        </ul>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {[
          { path: '/', title: '🏠 首頁', desc: '系統主頁面' },
          { path: '/tables', title: '🏢 現代桌台管理', desc: '最佳視覺效果的桌台管理系統' },
          { path: '/tables-test', title: '🧪 桌台測試', desc: '簡化版測試界面' },
          { path: '/pos', title: '🍽️ POS點餐', desc: '點餐管理系統' },
          { path: '/kds', title: '🍳 廚房顯示', desc: '廚房出餐管理' },
          { path: '/analytics', title: '📊 數據分析', desc: '營運數據分析' }
        ].map((item) => (
          <div key={item.path} style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>
              {item.title}
            </h3>
            <p style={{ margin: '0 0 1rem 0', fontSize: '14px', color: '#6b7280' }}>
              {item.desc}
            </p>
            <a 
              href={item.path}
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                backgroundColor: '#059669',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#047857'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#059669'
              }}
            >
              訪問 →
            </a>
          </div>
        ))}
      </div>

      <div style={{
        backgroundColor: '#f9fafb',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '1.5rem'
      }}>
        <h3>🔧 開發信息</h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
          <li>React + TypeScript</li>
          <li>Vite 開發服務器</li>
          <li>Zustand 狀態管理</li>
          <li>多主題 UI 系統</li>
          <li>響應式設計</li>
        </ul>
      </div>
    </div>
  )
}

export default TestPage

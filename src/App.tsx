import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import SimpleAnalyticsDashboard from './components/analytics/SimpleAnalyticsDashboard'
import POSSystem from './components/POSSystem'
import KDSSystem from './components/KDSSystem'
import EnhancedKDSSystem from './components/EnhancedKDSSystem'
import EnhancedTableManagement from './components/EnhancedTableManagement'
import SystemPerformanceOptimizer from './components/SystemPerformanceOptimizer'
import { TableStatus } from './pages/TableStatus'
import ModernTableManagement from './components/modern/ModernTableManagement'
import SimpleTableTest from './components/test/SimpleTableTest'
import TestPage from './pages/TestPage'
import PaymentPage from './pages/PaymentPage'
import OrderManagement from './pages/OrderManagement'
import { UITestPage } from './pages/UITestPage'
import { UIStyleProvider } from './contexts/UIStyleProvider'
import { SystemPerformanceProvider } from './contexts/SystemPerformanceContext'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import { PWAUtils } from './hooks/usePWA'

// 真實資料組件
import RealDataPOS from './components/RealDataPOS'
import RealDataKDS from './components/RealDataKDS'
import RealDataTableSelector from './components/RealDataTableSelector'
import DatabaseStatusIndicator from './components/DatabaseStatusIndicator'
import ComponentsOverview from './pages/ComponentsOverview'

// 待清理組件 - 臨時路由用（只導入可用的）
import NewPOSSystem from './components/NewPOSSystem'
// import ModernPOS from './components/ModernPOS' // 已損壞，移除載入
import KDSSystem_new from './components/KDSSystem_new'
import { TableManagement } from './components/TableManagement'
import SmartTableSelector from './components/SmartTableSelector'
import IntegratedPayment from './components/IntegratedPayment'
import { QuickOrderModal } from './components/QuickOrderModal'

console.log('🚀 App component loaded!')

// 簡單導航組件
const SimpleNav = () => {
  const navigate = useNavigate()
  
  return (
    <nav style={{
      padding: '1rem',
      borderBottom: '1px solid #ddd',
      display: 'flex',
      gap: '1rem',
      backgroundColor: '#f8f9fa'
    }}>
      <button 
        onClick={() => navigate('/')}
        style={{
          padding: '0.5rem 1rem',
          border: '1px solid #ddd',
          borderRadius: '4px',
          background: '#fff',
          color: '#333',
          cursor: 'pointer'
        }}
      >
        首頁
      </button>
      <button 
        onClick={() => navigate('/pos')}
        style={{
          padding: '0.5rem 1rem',
          border: '1px solid #ddd',
          borderRadius: '4px',
          background: '#fff',
          color: '#333',
          cursor: 'pointer'
        }}
      >
        🍽️ POS點餐
      </button>
      <button 
        onClick={() => navigate('/kds')}
        style={{
          padding: '0.5rem 1rem',
          border: '1px solid #ddd',
          borderRadius: '4px',
          background: '#fff',
          color: '#333',
          cursor: 'pointer'
        }}
      >
        🍳 廚房顯示
      </button>
      <button 
        onClick={() => navigate('/kds-enhanced')}
        style={{
          padding: '0.5rem 1rem',
          border: '1px solid #ddd',
          borderRadius: '4px',
          background: '#fff',
          color: '#333',
          cursor: 'pointer'
        }}
      >
        🧑‍🍳 智能KDS
      </button>
      <button 
        onClick={() => navigate('/analytics')}
        style={{
          padding: '0.5rem 1rem',
          border: '1px solid #ddd',
          borderRadius: '4px',
          background: '#fff',
          color: '#333',
          cursor: 'pointer'
        }}
      >
        📊 數據分析
      </button>
      <button 
        onClick={() => navigate('/tables')}
        style={{
          padding: '0.5rem 1rem',
          border: '1px solid #ddd',
          borderRadius: '4px',
          background: '#fff',
          color: '#333',
          cursor: 'pointer'
        }}
      >
        🏢 桌位管理
      </button>
      <button 
        onClick={() => navigate('/tables-enhanced')}
        style={{
          padding: '0.5rem 1rem',
          border: '1px solid #ddd',
          borderRadius: '4px',
          background: '#fff',
          color: '#333',
          cursor: 'pointer'
        }}
      >
        🤖 智能桌位
      </button>
      <button 
        onClick={() => navigate('/performance')}
        style={{
          padding: '0.5rem 1rem',
          border: '1px solid #ddd',
          borderRadius: '4px',
          background: '#fff',
          color: '#333',
          cursor: 'pointer'
        }}
      >
        ⚡ 性能優化
      </button>
      <button 
        onClick={() => navigate('/payment')}
        style={{
          padding: '0.5rem 1rem',
          border: '1px solid #ddd',
          borderRadius: '4px',
          background: '#fff',
          color: '#333',
          cursor: 'pointer'
        }}
      >
        💳 支付系統
      </button>
      <button 
        onClick={() => navigate('/orders')}
        style={{
          padding: '0.5rem 1rem',
          border: '1px solid #ddd',
          borderRadius: '4px',
          background: '#fff',
          color: '#333',
          cursor: 'pointer'
        }}
      >
        📋 訂單管理
      </button>
      <button 
        onClick={() => navigate('/ui-test')}
        style={{
          padding: '0.5rem 1rem',
          border: '1px solid #ddd',
          borderRadius: '4px',
          background: '#fff',
          color: '#333',
          cursor: 'pointer'
        }}
      >
        🎨 UI 樣式測試
      </button>
    </nav>
  )
}

// 主頁組件
const HomePage = () => {
  const navigate = useNavigate()
  
  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      minHeight: 'calc(100vh - 60px)',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        🍽️ TanaPOS V4-Mini
      </h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '1rem', opacity: 0.9 }}>
        現代化餐廳管理系統 - 真實資料庫整合版本
      </p>
      <p style={{ fontSize: '1rem', marginBottom: '2rem', opacity: 0.8, backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '1rem', display: 'inline-block' }}>
        🔗 已連接 Supabase PostgreSQL 資料庫
      </p>
      
      <div style={{
        display: 'flex',
        gap: '2rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* POS系統卡片 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '2rem',
          borderRadius: '1rem',
          flex: '1',
          minWidth: '280px',
          maxWidth: '350px',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🍽️ POS點餐系統</h2>
          <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
            真實資料庫整合的餐廳點餐系統，支援即時庫存、智能桌位推薦和訂單管理
          </p>
          <button
            onClick={() => navigate('/pos')}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              width: '100%'
            }}
          >
            開始點餐
          </button>
        </div>

        {/* 廚房顯示系統卡片 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '2rem',
          borderRadius: '1rem',
          flex: '1',
          minWidth: '280px',
          maxWidth: '350px',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🍳 廚房顯示系統</h2>
          <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
            真實資料庫整合的廚房管理系統，即時訂單同步，智能優先級排序和製作時間追蹤
          </p>
          <button
            onClick={() => navigate('/kds')}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              width: '100%'
            }}
          >
            進入廚房
          </button>
        </div>

        {/* 智能KDS系統卡片 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '2rem',
          borderRadius: '1rem',
          flex: '1',
          minWidth: '280px',
          maxWidth: '350px',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(16, 185, 129, 0.3)'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🧑‍🍳 智能KDS系統</h2>
          <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
            <strong>新功能!</strong> 桌位整合KDS，智能優先級排序，服務提醒通知
          </p>
          <button
            onClick={() => navigate('/kds-enhanced')}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              width: '100%'
            }}
          >
            體驗智能KDS
          </button>
        </div>

        {/* 桌位管理系統卡片 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '2rem',
          borderRadius: '1rem',
          flex: '1',
          minWidth: '280px',
          maxWidth: '350px',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🏢 智能桌位管理</h2>
          <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
            基於真實資料的智能桌位推薦系統，容量適配分析，效率統計和即時狀態同步
          </p>
          <button
            onClick={() => navigate('/tables')}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              width: '100%'
            }}
          >
            管理桌位
          </button>
        </div>

        {/* 智能桌位管理系統卡片 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '2rem',
          borderRadius: '1rem',
          flex: '1',
          minWidth: '280px',
          maxWidth: '350px',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(236, 72, 153, 0.3)'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🤖 智能桌位管理</h2>
          <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
            <strong>第三階段!</strong> POS-KDS-桌位三方聯動，智能服務流程自動化
          </p>
          <button
            onClick={() => navigate('/tables-enhanced')}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              background: '#ec4899',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              width: '100%'
            }}
          >
            體驗智能桌位
          </button>
        </div>

        {/* 性能優化系統卡片 - 第四階段 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '2rem',
          borderRadius: '1rem',
          flex: '1',
          minWidth: '280px',
          maxWidth: '350px',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⚡ 性能優化中心</h2>
          <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
            第四階段：智能性能監控、系統優化與整合服務架構
          </p>
          <button
            onClick={() => navigate('/performance')}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              width: '100%'
            }}
          >
            系統優化
          </button>
        </div>

        {/* 支付系統卡片 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '2rem',
          borderRadius: '1rem',
          flex: '1',
          minWidth: '280px',
          maxWidth: '350px',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>💳 支付系統</h2>
          <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
            多元支付方式支援，現金、信用卡、電子錢包一應俱全
          </p>
          <button
            onClick={() => navigate('/payment')}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              width: '100%'
            }}
          >
            體驗支付
          </button>
        </div>

        {/* 訂單管理卡片 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '2rem',
          borderRadius: '1rem',
          flex: '1',
          minWidth: '280px',
          maxWidth: '350px',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>📋 訂單管理</h2>
          <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
            完整的訂單追蹤和管理系統，即時同步 POS、KDS 和支付
          </p>
          <button
            onClick={() => navigate('/orders')}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              width: '100%'
            }}
          >
            收款管理
          </button>
        </div>

        {/* 數據分析系統卡片 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '2rem',
          borderRadius: '1rem',
          flex: '1',
          minWidth: '280px',
          maxWidth: '350px',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>📊 數據分析</h2>
          <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
            全方位營運分析報表，追蹤銷售數據、客戶偏好和營收統計
          </p>
          <button
            onClick={() => navigate('/analytics')}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              width: '100%'
            }}
          >
            查看報表
          </button>
        </div>

        {/* 功能總覽卡片 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.15)',
          padding: '2rem',
          borderRadius: '1rem',
          flex: '1',
          minWidth: '280px',
          maxWidth: '350px',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(251, 191, 36, 0.4)'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🔍 功能總覽</h2>
          <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
            <strong>開發專用!</strong> 查看所有功能組件的實際呈現效果，進行版本比較和篩選
          </p>
          <button
            onClick={() => navigate('/components-overview')}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              width: '100%'
            }}
          >
            查看所有功能
          </button>
        </div>
      </div>
    </div>
  )
}

// 主應用組件
const App = () => {
  console.log('✅ App rendering...')
  
  // 初始化 PWA 功能
  useEffect(() => {
    const initializePWA = async () => {
      try {
        // 檢查 PWA 支援度
        const support = PWAUtils.checkPWASupport()
        console.log('📱 PWA 支援狀況:', support)
        
        // 註冊 Service Worker
        if (support.serviceWorker) {
          const registration = await PWAUtils.registerServiceWorker()
          if (registration) {
            console.log('✅ PWA 初始化完成')
            
            // 監聽 Service Worker 更新
            registration.addEventListener('updatefound', () => {
              console.log('🔄 Service Worker 更新可用')
            })
          }
        } else {
          console.warn('⚠️ 此瀏覽器不支援 Service Worker')
        }
        
        // 檢查安裝狀態
        const installStatus = PWAUtils.getInstallStatus()
        if (installStatus.isPWA) {
          console.log('🎉 應用程式以 PWA 模式運行')
          
          // 設置 PWA 專用樣式
          document.body.classList.add('pwa-mode')
        }
        
        // 檢查網路狀態
        if (!navigator.onLine) {
          console.log('📴 離線模式啟動')
        }
        
      } catch (error) {
        console.error('❌ PWA 初始化失敗:', error)
      }
    }
    
    initializePWA()
  }, [])
  
  return (
    <SystemPerformanceProvider>
      <UIStyleProvider>
        <Router future={{ 
          v7_startTransition: true, 
          v7_relativeSplatPath: true 
        }}>
          <div className="app">
            <SimpleNav />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/components-overview" element={<ComponentsOverview />} />
              {/* 真實資料組件 - 主要功能 */}
              <Route path="/pos" element={<RealDataPOS />} />
              <Route path="/kds" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-6">廚房顯示系統</h1>
                  <RealDataKDS />
                </div>
              } />
              <Route path="/tables" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-6">桌位管理系統</h1>
                  <RealDataTableSelector 
                    onTableSelect={(tableId) => console.log('選擇桌位:', tableId)}
                    partySize={2}
                  />
                </div>
              } />
              
              {/* 舊版組件 - 供參考和測試 */}
              <Route path="/pos-legacy" element={<POSSystem />} />
              <Route path="/kds-legacy" element={<KDSSystem />} />
              <Route path="/kds-enhanced" element={<EnhancedKDSSystem />} />
              <Route path="/tables-modern" element={<ModernTableManagement />} />
              <Route path="/tables-enhanced" element={<EnhancedTableManagement />} />
              
              {/* 待清理組件 - 臨時查看用 */}
              <Route path="/cleanup/new-pos" element={
                <div className="p-6">
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    ⚠️ 這是待清理的組件 - NewPOSSystem
                  </div>
                  <NewPOSSystem />
                </div>
              } />
              <Route path="/cleanup/modern-pos" element={
                <div className="p-6">
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    ⚠️ 這是待清理的組件 - ModernPOS (已損壞，無法載入)
                  </div>
                  <div className="bg-gray-100 p-4 rounded">
                    <p className="text-red-600 font-semibold">❌ 此組件已損壞，無法預覽</p>
                    <p className="text-sm text-gray-600 mt-2">文件位置: src/components/ModernPOS.tsx</p>
                    <p className="text-sm text-gray-600">建議狀態: 立即刪除</p>
                  </div>
                </div>
              } />
              <Route path="/cleanup/kds-new" element={
                <div className="p-6">
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    ⚠️ 這是待清理的組件 - KDSSystem_new
                  </div>
                  <KDSSystem_new />
                </div>
              } />
              <Route path="/cleanup/table-management" element={
                <div className="p-6">
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    ⚠️ 這是待清理的組件 - TableManagement
                  </div>
                  <TableManagement />
                </div>
              } />
              <Route path="/cleanup/smart-table" element={
                <div className="p-6">
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    ⚠️ 這是待清理的組件 - SmartTableSelector
                  </div>
                  <SmartTableSelector 
                    partySize={4} 
                    selectedTableId={null} 
                    onTableSelect={(tableId) => console.log('Selected table:', tableId)} 
                  />
                </div>
              } />
              <Route path="/cleanup/integrated-payment" element={
                <div className="p-6">
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    ⚠️ 這是待清理的組件 - IntegratedPayment (需要修正props才能正常顯示)
                  </div>
                  <div className="bg-gray-100 p-4 rounded">
                    <p>此組件需要特定的 order props，暫時無法預覽</p>
                    <p className="text-sm text-gray-600 mt-2">文件位置: src/components/IntegratedPayment.tsx</p>
                  </div>
                </div>
              } />
              <Route path="/cleanup/quick-order" element={
                <div className="p-6">
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    ⚠️ 這是待清理的組件 - QuickOrderModal (需要修正props才能正常顯示)
                  </div>
                  <div className="bg-gray-100 p-4 rounded">
                    <p>此組件需要特定的 table props，暫時無法預覽</p>
                    <p className="text-sm text-gray-600 mt-2">文件位置: src/components/QuickOrderModal.tsx</p>
                  </div>
                </div>
              } />
              
              {/* 其他功能 */}
              <Route path="/analytics" element={<SimpleAnalyticsDashboard />} />
              <Route path="/performance" element={<SystemPerformanceOptimizer />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/orders" element={<OrderManagement />} />
              <Route path="/tables-test" element={<SimpleTableTest />} />
              <Route path="/tables-old" element={<TableStatus />} />
              <Route path="/test" element={<TestPage />} />
              <Route path="/ui-test" element={<UITestPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            {/* PWA 安裝提示和狀態指示器 */}
            <PWAInstallPrompt />
            
            {/* 資料庫狀態指示器 */}
            <DatabaseStatusIndicator />
          </div>
        </Router>
      </UIStyleProvider>
    </SystemPerformanceProvider>
  )
}

export default App
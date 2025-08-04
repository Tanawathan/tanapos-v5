import React from 'react'
import { usePWA } from '../hooks/usePWA'

const PWAInstallPrompt: React.FC = () => {
  const { 
    showInstallPrompt, 
    isOnline, 
    updateAvailable,
    installApp, 
    dismissInstallPrompt, 
    reloadApp 
  } = usePWA()

  // 安裝提示
  if (showInstallPrompt) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '1rem',
        left: '1rem',
        right: '1rem',
        zIndex: 9999,
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        color: 'white',
        padding: '1rem',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
        animation: 'slideUp 0.3s ease-out'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>📱</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ 
              margin: '0 0 0.5rem 0', 
              fontSize: '1.1rem', 
              fontWeight: '600' 
            }}>
              安裝 TanaPOS 應用程式
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: '0.9rem', 
              opacity: 0.9,
              lineHeight: '1.4'
            }}>
              安裝到主畫面，享受更好的使用體驗
            </p>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '0.75rem', 
          marginTop: '1rem' 
        }}>
          <button
            onClick={installApp}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            }}
          >
            ⬇️ 立即安裝
          </button>
          
          <button
            onClick={dismissInstallPrompt}
            style={{
              background: 'transparent',
              color: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = 'white'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
            }}
          >
            ✖️ 關閉
          </button>
        </div>
        
        <style>{`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    )
  }

  // 更新提示
  if (updateAvailable) {
    return (
      <div style={{
        position: 'fixed',
        top: '1rem',
        left: '1rem',
        right: '1rem',
        zIndex: 9999,
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        padding: '1rem',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
        animation: 'slideDown 0.3s ease-out'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '1.5rem' }}>🔄</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ 
              margin: '0 0 0.5rem 0', 
              fontSize: '1.1rem', 
              fontWeight: '600' 
            }}>
              應用程式更新可用
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: '0.9rem', 
              opacity: 0.9 
            }}>
              點擊重新載入以獲取最新功能
            </p>
          </div>
          <button
            onClick={reloadApp}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            }}
          >
            🔄 更新
          </button>
        </div>
        
        <style>{`
          @keyframes slideDown {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    )
  }

  // 離線狀態指示器
  if (!isOnline) {
    return (
      <div style={{
        position: 'fixed',
        top: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        color: 'white',
        padding: '0.75rem 1.5rem',
        borderRadius: '25px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        fontSize: '0.9rem',
        fontWeight: '600',
        animation: 'pulse 2s infinite'
      }}>
        📴 離線模式 - 功能有限
        
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}</style>
      </div>
    )
  }

  return null
}

export default PWAInstallPrompt

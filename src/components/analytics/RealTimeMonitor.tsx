import React, { useState, useEffect } from 'react'

// 實時監控組件
const RealTimeMonitor: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isOnline, setIsOnline] = useState(true)
  const [activeOrders, setActiveOrders] = useState(8)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      // 模擬實時數據更新
      setActiveOrders(prev => prev + Math.floor(Math.random() * 3) - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '1.5rem',
      borderRadius: '1rem',
      marginBottom: '2rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>🔴 實時監控中心</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>
            {currentTime.toLocaleTimeString('zh-TW')} | 
            <span style={{ color: isOnline ? '#4ade80' : '#ef4444', marginLeft: '0.5rem' }}>
              {isOnline ? '● 系統正常' : '● 系統異常'}
            </span>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{activeOrders}</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>活躍訂單</div>
        </div>
      </div>
    </div>
  )
}

export default RealTimeMonitor

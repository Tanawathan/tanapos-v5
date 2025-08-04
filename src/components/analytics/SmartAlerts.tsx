import React, { useState, useEffect } from 'react'
import { useSound } from '../../hooks/useSound'

interface AlertItem {
  id: number
  type: 'warning' | 'error' | 'info' | 'success'
  message: string
  time: string
  priority: 'high' | 'medium' | 'low'
  category?: 'order' | 'inventory' | 'payment' | 'table' | 'system'
  isNew?: boolean
  soundEnabled?: boolean
}

// 通知設定介面
interface NotificationSettings {
  browserNotifications: boolean
  soundEnabled: boolean
  autoAlert: boolean
  volume: number
}

// 智能預警系統
const SmartAlerts: React.FC = () => {
  const { playSound } = useSound()
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 1,
      type: 'warning',
      message: '廚房出餐時間比平均慢了15%',
      time: '2分鐘前',
      priority: 'high',
      category: 'order',
      isNew: true,
      soundEnabled: true
    },
    {
      id: 2,
      type: 'info',
      message: '午餐高峰期即將到來（預計30分鐘）',
      time: '5分鐘前',
      priority: 'medium',
      category: 'system',
      isNew: false,
      soundEnabled: true
    },
    {
      id: 3,
      type: 'success',
      message: '今日營收已達到目標的85%',
      time: '10分鐘前',
      priority: 'low',
      category: 'system',
      isNew: false,
      soundEnabled: false
    },
    {
      id: 4,
      type: 'error',
      message: '桌號12的客戶等候時間超過20分鐘',
      time: '1分鐘前',
      priority: 'high',
      category: 'table',
      isNew: true,
      soundEnabled: true
    },
    {
      id: 5,
      type: 'warning',
      message: '牛肉庫存不足，僅剩5份',
      time: '3分鐘前',
      priority: 'high',
      category: 'inventory',
      isNew: true,
      soundEnabled: true
    }
  ])

  const [settings, setSettings] = useState<NotificationSettings>({
    browserNotifications: false,
    soundEnabled: true,
    autoAlert: true,
    volume: 0.7
  })

  const [showSettings, setShowSettings] = useState(false)

  // 請求瀏覽器通知權限
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setSettings(prev => ({ ...prev, browserNotifications: permission === 'granted' }))
      return permission === 'granted'
    }
    return false
  }

  // 發送瀏覽器原生通知
  const sendBrowserNotification = (alert: AlertItem) => {
    if (!settings.browserNotifications || !('Notification' in window)) return
    
    const notification = new Notification(`TanaPOS - ${alert.type.toUpperCase()}`, {
      body: alert.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `alert-${alert.id}`,
      requireInteraction: alert.priority === 'high'
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    setTimeout(() => notification.close(), 5000)
  }

  // 播放警告音效
  const playAlertSound = (alert: AlertItem) => {
    if (!settings.soundEnabled || !alert.soundEnabled) return

    switch (alert.type) {
      case 'error':
        playSound('error')
        break
      case 'warning':
        playSound('inventoryAlert')
        break
      case 'success':
        playSound('success')
        break
      case 'info':
        playSound('click')
        break
    }
  }

  // 處理新警告
  const handleNewAlert = (alert: AlertItem) => {
    if (alert.isNew) {
      // 播放音效
      playAlertSound(alert)
      
      // 發送瀏覽器通知
      sendBrowserNotification(alert)
      
      // 標記為已讀
      setTimeout(() => {
        setAlerts(prev => prev.map(a => 
          a.id === alert.id ? { ...a, isNew: false } : a
        ))
      }, 3000)
    }
  }

  // 模擬新警告到達
  const simulateNewAlert = () => {
    const newAlert: AlertItem = {
      id: Date.now(),
      type: Math.random() > 0.5 ? 'warning' : 'error',
      message: `新訂單 #${Math.floor(Math.random() * 1000)} 已建立 - 桌號 ${Math.floor(Math.random() * 20) + 1}`,
      time: '剛剛',
      priority: 'high',
      category: 'order',
      isNew: true,
      soundEnabled: true
    }
    
    setAlerts(prev => [newAlert, ...prev])
    handleNewAlert(newAlert)
  }

  // 組件掛載時檢查權限
  useEffect(() => {
    if ('Notification' in window) {
      setSettings(prev => ({ 
        ...prev, 
        browserNotifications: Notification.permission === 'granted' 
      }))
    }
  }, [])

  // 監聽新警告
  useEffect(() => {
    alerts.forEach(alert => {
      if (alert.isNew) {
        handleNewAlert(alert)
      }
    })
  }, [alerts])

  const getAlertColor = (type: AlertItem['type']) => {
    switch (type) {
      case 'error': return '#ef4444'
      case 'warning': return '#f59e0b'
      case 'success': return '#10b981'
      case 'info': return '#3b82f6'
      default: return '#6b7280'
    }
  }

  const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'error': return '🚨'
      case 'warning': return '⚠️'
      case 'success': return '✅'
      case 'info': return 'ℹ️'
      default: return '📝'
    }
  }

  const getCategoryIcon = (category?: AlertItem['category']) => {
    switch (category) {
      case 'order': return '🍽️'
      case 'inventory': return '📦'
      case 'payment': return '💳'
      case 'table': return '🪑'
      case 'system': return '⚙️'
      default: return '📝'
    }
  }

  const getPriorityBadge = (priority: AlertItem['priority']) => {
    const colors = {
      high: '#dc2626',
      medium: '#d97706',
      low: '#059669'
    }
    
    return (
      <span style={{
        background: colors[priority],
        color: 'white',
        padding: '0.2rem 0.5rem',
        borderRadius: '0.25rem',
        fontSize: '0.75rem',
        fontWeight: 'bold'
      }}>
        {priority.toUpperCase()}
      </span>
    )
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: '#1f2937', fontSize: '1.2rem' }}>
          🔔 智能預警中心
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            {alerts.filter(a => a.priority === 'high').length} 高優先級
          </div>
          {alerts.some(a => a.isNew) && (
            <div style={{
              background: '#ef4444',
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '50%',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              minWidth: '20px',
              textAlign: 'center',
              animation: 'pulse 2s infinite'
            }}>
              {alerts.filter(a => a.isNew).length}
            </div>
          )}
          <button 
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: 'transparent',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              padding: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* 通知設定面板 */}
      {showSettings && (
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <h4 style={{ margin: '0 0 0.75rem 0', color: '#374151' }}>🔧 通知設定</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <input 
                type="checkbox" 
                checked={settings.browserNotifications}
                onChange={() => {
                  if (!settings.browserNotifications) {
                    requestNotificationPermission()
                  } else {
                    setSettings(prev => ({ ...prev, browserNotifications: false }))
                  }
                }}
              />
              瀏覽器通知
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <input 
                type="checkbox" 
                checked={settings.soundEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
              />
              音效提醒
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <input 
                type="checkbox" 
                checked={settings.autoAlert}
                onChange={(e) => setSettings(prev => ({ ...prev, autoAlert: e.target.checked }))}
              />
              自動警告
            </label>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <span>音量:</span>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1"
                value={settings.volume}
                onChange={(e) => setSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                style={{ flex: 1 }}
              />
              <span>{Math.round(settings.volume * 100)}%</span>
            </div>
          </div>
          
          <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
            <button 
              onClick={simulateNewAlert}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              🧪 測試新警告
            </button>
          </div>
        </div>
      )}

      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {alerts.map((alert) => (
          <div
            key={alert.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              padding: '0.75rem',
              marginBottom: '0.5rem',
              borderRadius: '0.5rem',
              border: `1px solid ${getAlertColor(alert.type)}20`,
              background: `${getAlertColor(alert.type)}05`
            }}
          >
            <div style={{ fontSize: '1.25rem', marginRight: '0.75rem' }}>
              {getAlertIcon(alert.type)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{
                  margin: '0 0 0.25rem 0',
                  color: '#374151',
                  fontSize: '0.875rem',
                  lineHeight: '1.25rem'
                }}>
                  {alert.message}
                </p>
                {getPriorityBadge(alert.priority)}
              </div>
              <p style={{
                margin: 0,
                color: '#6b7280',
                fontSize: '0.75rem'
              }}>
                {alert.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        background: '#f9fafb',
        borderRadius: '0.5rem',
        textAlign: 'center'
      }}>
        <button style={{
          background: '#4f46e5',
          color: 'white',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          cursor: 'pointer',
          marginRight: '0.5rem'
        }}>
          查看全部預警
        </button>
        <button style={{
          background: 'transparent',
          color: '#6b7280',
          border: '1px solid #d1d5db',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          cursor: 'pointer'
        }}>
          設定規則
        </button>
      </div>
    </div>
  )
}

export default SmartAlerts

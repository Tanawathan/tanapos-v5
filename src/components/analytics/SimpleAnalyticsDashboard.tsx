import React, { useState } from 'react'
import AdvancedAnalytics from './AdvancedAnalytics'

const SimpleAnalyticsDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState('overview') // 添加分頁狀態

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', minHeight: 'calc(100vh - 60px)' }}>
      {/* 實時監控條 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '1rem',
        marginBottom: '2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>🔴 實時監控中心</h3>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
            {currentTime.toLocaleTimeString('zh-TW')} | 
            <span style={{ color: '#4ade80', marginLeft: '0.5rem' }}>● 系統正常運行</span>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>8</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>活躍訂單</div>
        </div>
      </div>

      {/* 分頁導航 */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '1rem 1.5rem',
            border: 'none',
            background: activeTab === 'overview' ? '#4f46e5' : 'transparent',
            color: activeTab === 'overview' ? 'white' : '#6b7280',
            borderRadius: '0.5rem 0.5rem 0 0',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          📊 概覽儀表板
        </button>
        
        <button
          onClick={() => setActiveTab('advanced')}
          style={{
            padding: '1rem 1.5rem',
            border: 'none',
            background: activeTab === 'advanced' ? '#4f46e5' : 'transparent',
            color: activeTab === 'advanced' ? 'white' : '#6b7280',
            borderRadius: '0.5rem 0.5rem 0 0',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          📈 進階分析
        </button>
      </div>

      {/* 條件渲染內容 */}
      {activeTab === 'advanced' ? (
        <AdvancedAnalytics />
      ) : (
        <>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: '#1e293b' }}>
        📊 營業分析儀表板
      </h1>
      
      {/* 核心指標卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {[
          { title: '今日營收', value: '$12,480', change: '+8.5%', icon: '💰', positive: true },
          { title: '訂單數量', value: '89', change: '+12%', icon: '📝', positive: true },
          { title: '平均客單價', value: '$140', change: '+2.1%', icon: '👥', positive: true },
          { title: '桌位周轉率', value: '2.3x', change: '-0.1x', icon: '🪑', positive: false }
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
              border: '1px solid #e5e7eb',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                  {stat.title}
                </p>
                <p style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold', 
                  color: '#1f2937', 
                  margin: '0 0 0.25rem 0' 
                }}>
                  {stat.value}
                </p>
                <p style={{
                  fontSize: '0.875rem',
                  color: stat.positive ? '#10b981' : '#ef4444',
                  margin: 0,
                  fontWeight: '600'
                }}>
                  {stat.change} 與昨日比較
                </p>
              </div>
              <div style={{ fontSize: '2rem' }}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 銷售趨勢圖表 */}
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>📈 過去7天銷售趨勢</h3>
        <div style={{ 
          height: '200px', 
          background: '#f8fafc', 
          borderRadius: '0.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📊</div>
            <p style={{ color: '#6b7280', margin: 0 }}>趨勢圖表區域</p>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
              整體趨勢：穩定上升 📈
            </p>
          </div>
        </div>
      </div>

      {/* 智能洞察 */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        borderRadius: '1rem',
        padding: '1.5rem',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>🧠 AI 智能洞察</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '0.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>💡 營收優化建議</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>
              建議在 11:30-12:30 增加服務人員，可提升15%的翻桌率
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '0.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>🎯 客群分析</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>
              今日午餐時段商務客群比例增加25%，建議調整菜單推薦
            </p>
          </div>
        </div>
      </div>

      {/* 性能監控 */}
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>⚡ 系統性能監控</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { label: '系統響應時間', value: '0.8s', status: 'good' },
            { label: '訂單處理速度', value: '45s', status: 'good' },
            { label: '廚房效率', value: '78%', status: 'good' },
            { label: '客戶滿意度', value: '4.6/5', status: 'excellent' }
          ].map((metric, index) => (
            <div key={index} style={{
              background: '#f8fafc',
              padding: '1rem',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>
                {metric.label}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>
                {metric.value}
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: metric.status === 'excellent' ? '#10b981' : '#3b82f6',
                fontWeight: '600' 
              }}>
                {metric.status === 'excellent' ? '🎯 優秀' : '✅ 良好'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 預警中心 */}
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>🔔 智能預警中心</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { type: 'warning', message: '廚房出餐時間比平均慢了15%', time: '2分鐘前' },
            { type: 'info', message: '午餐高峰期即將到來（預計30分鐘）', time: '5分鐘前' },
            { type: 'success', message: '今日營收已達到目標的85%', time: '10分鐘前' }
          ].map((alert, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              background: alert.type === 'warning' ? '#fef3c7' : 
                         alert.type === 'info' ? '#dbeafe' : '#d1fae5',
              border: `1px solid ${alert.type === 'warning' ? '#f59e0b' : 
                                  alert.type === 'info' ? '#3b82f6' : '#10b981'}30`
            }}>
              <div style={{ fontSize: '1.25rem', marginRight: '0.75rem' }}>
                {alert.type === 'warning' ? '⚠️' : alert.type === 'info' ? 'ℹ️' : '✅'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 0.25rem 0', color: '#374151', fontSize: '0.875rem' }}>
                  {alert.message}
                </p>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.75rem' }}>
                  {alert.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
        </>
      )}
    </div>
  )
}

export default SimpleAnalyticsDashboard

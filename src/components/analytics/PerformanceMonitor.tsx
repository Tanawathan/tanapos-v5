import React from 'react'

// 性能監控面板
const PerformanceMonitor: React.FC = () => {
  const performanceMetrics = [
    {
      label: '系統響應時間',
      value: '0.8s',
      target: '< 1.0s',
      status: 'good',
      trend: '+5%'
    },
    {
      label: '訂單處理速度',
      value: '45s',
      target: '< 60s',
      status: 'good',
      trend: '-8%'
    },
    {
      label: '廚房效率',
      value: '78%',
      target: '> 75%',
      status: 'good',
      trend: '+3%'
    },
    {
      label: '客戶滿意度',
      value: '4.6/5',
      target: '> 4.0',
      status: 'excellent',
      trend: '+0.2'
    },
    {
      label: '服務員效率',
      value: '92%',
      target: '> 85%',
      status: 'excellent',
      trend: '+7%'
    },
    {
      label: '庫存周轉率',
      value: '2.3x',
      target: '> 2.0x',
      status: 'good',
      trend: '+0.3'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return '#10b981'
      case 'good': return '#3b82f6'
      case 'warning': return '#f59e0b'
      case 'poor': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return '🎯'
      case 'good': return '✅'
      case 'warning': return '⚠️'
      case 'poor': return '❌'
      default: return '📊'
    }
  }

  const getTrendIcon = (trend: string) => {
    if (trend.startsWith('+')) return '📈'
    if (trend.startsWith('-')) return '📉'
    return '➡️'
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{ margin: '0 0 1.5rem 0', color: '#1f2937', fontSize: '1.2rem' }}>
        ⚡ 性能監控面板
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1rem'
      }}>
        {performanceMetrics.map((metric, index) => (
          <div
            key={index}
            style={{
              background: '#f8fafc',
              borderRadius: '0.75rem',
              padding: '1rem',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>
                  {metric.label}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
                  {metric.value}
                </div>
              </div>
              <div style={{ fontSize: '1.5rem' }}>
                {getStatusIcon(metric.status)}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                目標: {metric.target}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.75rem',
                color: getStatusColor(metric.status),
                fontWeight: '600'
              }}>
                <span style={{ marginRight: '0.25rem' }}>{getTrendIcon(metric.trend)}</span>
                {metric.trend}
              </div>
            </div>

            {/* 進度條 */}
            <div style={{
              marginTop: '0.75rem',
              background: '#e2e8f0',
              borderRadius: '9999px',
              height: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: getStatusColor(metric.status),
                height: '100%',
                width: metric.status === 'excellent' ? '100%' : metric.status === 'good' ? '80%' : '60%',
                borderRadius: '9999px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* 整體評分 */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        borderRadius: '0.75rem',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
          整體營運效率評分
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
          87.5
        </div>
        <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
          優秀水準 | 比昨日提升 +3.2%
        </div>
      </div>
    </div>
  )
}

export default PerformanceMonitor

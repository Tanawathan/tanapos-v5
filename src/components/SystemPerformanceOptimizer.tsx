import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { usePerformanceMonitor, useComponentPerformance } from '../hooks/usePerformanceMonitor'
import { useSmartCache, useAPICache } from '../hooks/useSmartCache'

// 性能優化配置介面
interface PerformanceConfig {
  enableCaching: boolean
  enableLazyLoading: boolean
  enableVirtualization: boolean
  cacheStrategy: 'aggressive' | 'conservative' | 'smart'
  performanceLevel: 'high' | 'medium' | 'low'
}

// 系統性能狀態
interface SystemPerformanceState {
  currentLoad: number
  memoryUsage: number
  renderPerformance: number
  cacheHitRate: number
  networkLatency: number
  isOptimized: boolean
}

// 性能優化建議
interface PerformanceRecommendation {
  type: 'cache' | 'memory' | 'network' | 'render'
  severity: 'critical' | 'warning' | 'info'
  message: string
  action: string
  impact: string
}

export const SystemPerformanceOptimizer: React.FC = () => {
  useComponentPerformance('SystemPerformanceOptimizer')

  // 性能監控
  const { 
    metrics, 
    measureMemoryUsage, 
    checkPerformanceThresholds, 
    exportPerformanceReport 
  } = usePerformanceMonitor()

  // 快取系統
  const { 
    getCacheMetrics, 
    getCacheStats 
  } = useSmartCache()

  const { 
    cacheAPICall, 
    invalidateCache 
  } = useAPICache()

  // 本地狀態
  const [config, setConfig] = useState<PerformanceConfig>({
    enableCaching: true,
    enableLazyLoading: true,
    enableVirtualization: true,
    cacheStrategy: 'smart',
    performanceLevel: 'high'
  })

  const [systemState, setSystemState] = useState<SystemPerformanceState>({
    currentLoad: 0,
    memoryUsage: 0,
    renderPerformance: 0,
    cacheHitRate: 0,
    networkLatency: 0,
    isOptimized: false
  })

  const [recommendations, setRecommendations] = useState<PerformanceRecommendation[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)

  // 性能數據計算
  const performanceMetrics = useMemo(() => {
    const cacheMetrics = getCacheMetrics()
    const currentMetrics = metrics

    return {
      loadTime: currentMetrics.loadTime || 0,
      renderTime: currentMetrics.renderTime || 0,
      memoryUsed: currentMetrics.memoryUsage?.used || 0,
      memoryTotal: currentMetrics.memoryUsage?.total || 0,
      cacheHits: cacheMetrics.hits,
      cacheMisses: cacheMetrics.misses,
      cacheHitRate: cacheMetrics.hitRate || 0,
      lcp: currentMetrics.lcp || 0,
      fid: currentMetrics.fid || 0,
      cls: currentMetrics.cls || 0
    }
  }, [metrics, getCacheMetrics])

  // 性能分析和建議生成
  const analyzePerformance = useCallback(() => {
    const newRecommendations: PerformanceRecommendation[] = []
    const warnings = checkPerformanceThresholds()

    // 記憶體使用分析
    if (performanceMetrics.memoryUsed > 100) {
      newRecommendations.push({
        type: 'memory',
        severity: performanceMetrics.memoryUsed > 150 ? 'critical' : 'warning',
        message: `記憶體使用過高: ${performanceMetrics.memoryUsed}MB`,
        action: '清理未使用的組件和快取',
        impact: '可能影響系統響應速度'
      })
    }

    // 快取效率分析
    if (performanceMetrics.cacheHitRate < 70) {
      newRecommendations.push({
        type: 'cache',
        severity: 'warning',
        message: `快取命中率偏低: ${performanceMetrics.cacheHitRate.toFixed(1)}%`,
        action: '調整快取策略或增加快取大小',
        impact: '增加快取命中率可減少API呼叫'
      })
    }

    // 渲染性能分析
    if (performanceMetrics.renderTime > 100) {
      newRecommendations.push({
        type: 'render',
        severity: 'warning',
        message: `渲染時間過長: ${performanceMetrics.renderTime}ms`,
        action: '使用虛擬化或組件懶加載',
        impact: '提升用戶界面響應速度'
      })
    }

    // Core Web Vitals 分析
    if (performanceMetrics.lcp > 2500) {
      newRecommendations.push({
        type: 'network',
        severity: 'critical',
        message: `LCP 過高: ${performanceMetrics.lcp}ms`,
        action: '優化關鍵資源載入',
        impact: '改善用戶首次體驗'
      })
    }

    setRecommendations(newRecommendations)

    // 更新系統狀態
    setSystemState(prev => ({
      ...prev,
      currentLoad: Math.min(100, (performanceMetrics.memoryUsed / 200) * 100),
      memoryUsage: performanceMetrics.memoryUsed,
      renderPerformance: Math.max(0, 100 - (performanceMetrics.renderTime / 10)),
      cacheHitRate: performanceMetrics.cacheHitRate,
      networkLatency: performanceMetrics.lcp / 10,
      isOptimized: newRecommendations.length === 0
    }))
  }, [performanceMetrics, checkPerformanceThresholds])

  // 性能優化執行
  const executeOptimization = useCallback(async (type: string) => {
    switch (type) {
      case 'memory':
        // 記憶體清理
        if ('gc' in window && typeof (window as any).gc === 'function') {
          (window as any).gc()
        }
        // 清理過期快取
        const cacheStats = getCacheStats()
        console.log('🧹 執行記憶體清理', cacheStats)
        break

      case 'cache':
        // 快取最佳化
        await invalidateCache('expired-*')
        console.log('🗑️ 清理過期快取')
        break

      case 'network':
        // 預載關鍵資源
        try {
          await cacheAPICall('preload-products', async () => {
            // 模擬預載產品數據
            return { preloaded: true }
          })
          console.log('🚀 預載關鍵資源完成')
        } catch (error) {
          console.error('❌ 預載失敗:', error)
        }
        break

      case 'render':
        // 觸發組件重新渲染優化
        console.log('🎨 觸發渲染優化')
        break
    }

    // 重新分析性能
    setTimeout(analyzePerformance, 1000)
  }, [getCacheStats, invalidateCache, cacheAPICall, analyzePerformance])

  // 自動性能監控
  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        measureMemoryUsage()
        analyzePerformance()
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [isMonitoring, measureMemoryUsage, analyzePerformance])

  // 初始化性能分析
  useEffect(() => {
    analyzePerformance()
  }, [analyzePerformance])

  // 性能等級顏色
  const getPerformanceColor = (value: number, reverse = false) => {
    if (reverse) {
      if (value < 30) return '#ef4444' // 紅色
      if (value < 60) return '#f59e0b' // 橙色
      return '#10b981' // 綠色
    } else {
      if (value > 70) return '#10b981' // 綠色
      if (value > 40) return '#f59e0b' // 橙色
      return '#ef4444' // 紅色
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444'
      case 'warning': return '#f59e0b'
      case 'info': return '#3b82f6'
      default: return '#6b7280'
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      {/* 標題區域 */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        color: 'white'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem'
        }}>
          ⚡ 系統性能優化中心
        </h1>
        <p style={{
          fontSize: '1.2rem',
          opacity: 0.9
        }}>
          第四階段：智能性能監控與優化
        </p>
      </div>

      {/* 性能儀表板 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* 系統負載 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '1.5rem',
          borderRadius: '1rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
            📊 系統負載
          </h3>
          <div style={{
            width: '100%',
            height: '10px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '5px',
            overflow: 'hidden',
            marginBottom: '0.5rem'
          }}>
            <div style={{
              width: `${systemState.currentLoad}%`,
              height: '100%',
              backgroundColor: getPerformanceColor(systemState.currentLoad, true),
              transition: 'width 0.3s ease'
            }} />
          </div>
          <p style={{ color: 'white', fontSize: '0.9rem' }}>
            {systemState.currentLoad.toFixed(1)}% 使用率
          </p>
        </div>

        {/* 記憶體使用 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '1.5rem',
          borderRadius: '1rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
            🧠 記憶體使用
          </h3>
          <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {systemState.memoryUsage.toFixed(1)} MB
          </div>
          <p style={{ color: 'white', fontSize: '0.9rem', opacity: 0.8 }}>
            當前使用量
          </p>
        </div>

        {/* 快取效率 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '1.5rem',
          borderRadius: '1rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
            🚀 快取效率
          </h3>
          <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {systemState.cacheHitRate.toFixed(1)}%
          </div>
          <p style={{ color: 'white', fontSize: '0.9rem', opacity: 0.8 }}>
            命中率
          </p>
        </div>

        {/* 渲染性能 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '1.5rem',
          borderRadius: '1rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
            🎨 渲染性能
          </h3>
          <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {systemState.renderPerformance.toFixed(1)}%
          </div>
          <p style={{ color: 'white', fontSize: '0.9rem', opacity: 0.8 }}>
            性能分數
          </p>
        </div>
      </div>

      {/* 控制面板 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* 監控控制 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '2rem',
          borderRadius: '1rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>🔧 監控控制</h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                background: isMonitoring ? '#ef4444' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                marginRight: '1rem',
                fontWeight: 'bold'
              }}
            >
              {isMonitoring ? '⏹️ 停止監控' : '▶️ 開始監控'}
            </button>

            <button
              onClick={exportPerformanceReport}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              📄 匯出報告
            </button>
          </div>

          <div>
            <label style={{ color: 'white', display: 'block', marginBottom: '0.5rem' }}>
              性能等級:
            </label>
            <select
              value={config.performanceLevel}
              onChange={(e) => setConfig(prev => ({ ...prev, performanceLevel: e.target.value as any }))}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontSize: '1rem'
              }}
            >
              <option value="high">高性能</option>
              <option value="medium">中等性能</option>
              <option value="low">節能模式</option>
            </select>
          </div>
        </div>

        {/* 詳細指標 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '2rem',
          borderRadius: '1rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>📈 詳細指標</h3>
          
          <div style={{ color: 'white', lineHeight: 1.6 }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>載入時間:</strong> {performanceMetrics.loadTime}ms
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>渲染時間:</strong> {performanceMetrics.renderTime}ms
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>LCP:</strong> {performanceMetrics.lcp}ms
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>FID:</strong> {performanceMetrics.fid}ms
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>CLS:</strong> {performanceMetrics.cls}
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>快取命中:</strong> {performanceMetrics.cacheHits}
            </div>
            <div>
              <strong>快取未命中:</strong> {performanceMetrics.cacheMisses}
            </div>
          </div>
        </div>
      </div>

      {/* 性能建議 */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: '2rem',
        borderRadius: '1rem',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>💡 性能建議</h3>
        
        {recommendations.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recommendations.map((rec, index) => (
              <div key={index} style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                padding: '1rem',
                borderRadius: '0.5rem',
                borderLeft: `4px solid ${getSeverityColor(rec.severity)}`
              }}>
                <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {rec.message}
                </div>
                <div style={{ color: 'white', opacity: 0.8, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  建議動作: {rec.action}
                </div>
                <div style={{ color: 'white', opacity: 0.7, fontSize: '0.85rem', marginBottom: '1rem' }}>
                  預期影響: {rec.impact}
                </div>
                <button
                  onClick={() => executeOptimization(rec.type)}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.9rem',
                    background: getSeverityColor(rec.severity),
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer'
                  }}
                >
                  執行優化
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            color: 'white',
            opacity: 0.8,
            padding: '2rem'
          }}>
            🎉 系統運行良好，無需優化建議
          </div>
        )}
      </div>

      {/* 系統狀態指示器 */}
      <div style={{
        position: 'fixed',
        top: '2rem',
        right: '2rem',
        backgroundColor: systemState.isOptimized ? '#10b981' : '#f59e0b',
        color: 'white',
        padding: '0.75rem 1rem',
        borderRadius: '2rem',
        fontWeight: 'bold',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        zIndex: 1000
      }}>
        {systemState.isOptimized ? '✅ 已優化' : '⚠️ 需優化'}
      </div>
    </div>
  )
}

export default SystemPerformanceOptimizer

import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react'
import { IntegratedSystemService } from '../services/IntegratedSystemService'

// 系統性能 Context 類型
interface SystemPerformanceContextType {
  service: IntegratedSystemService
  isOptimized: boolean
  performanceLevel: 'high' | 'medium' | 'low'
  setPerformanceLevel: (level: 'high' | 'medium' | 'low') => void
  systemHealth: {
    systems: string[]
    performance: number
    isHealthy: boolean
    recommendations: string[]
  }
}

const SystemPerformanceContext = createContext<SystemPerformanceContextType | null>(null)

// 系統性能優化的 Context Provider
export const SystemPerformanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [performanceLevel, setPerformanceLevel] = useState<'high' | 'medium' | 'low'>('high')
  const [isOptimized, setIsOptimized] = useState(true)
  const [systemHealth, setSystemHealth] = useState({
    systems: [],
    performance: 100,
    isHealthy: true,
    recommendations: []
  })

  // 創建集成服務實例
  const service = useMemo(() => {
    const config = {
      batchUpdateInterval: performanceLevel === 'high' ? 8 : performanceLevel === 'medium' ? 16 : 32,
      performanceThreshold: performanceLevel === 'high' ? 50 : performanceLevel === 'medium' ? 100 : 200
    }
    return IntegratedSystemService.getInstance(config)
  }, [performanceLevel])

  // 定期健康檢查
  useEffect(() => {
    const interval = setInterval(() => {
      const health = service.healthCheck()
      setSystemHealth(health)
      setIsOptimized(health.isHealthy)
      
      if (!health.isHealthy && health.recommendations.length > 0) {
        console.warn('🚨 系統性能警告:', health.recommendations)
      }
    }, 10000) // 每10秒檢查

    return () => clearInterval(interval)
  }, [service])

  // 初始健康檢查
  useEffect(() => {
    const health = service.healthCheck()
    setSystemHealth(health)
    setIsOptimized(health.isHealthy)
  }, [service])

  const value = useMemo(() => ({
    service,
    isOptimized,
    performanceLevel,
    setPerformanceLevel,
    systemHealth
  }), [service, isOptimized, performanceLevel, systemHealth])

  return (
    <SystemPerformanceContext.Provider value={value}>
      {children}
    </SystemPerformanceContext.Provider>
  )
}

// Hook for using system performance context
export const useSystemPerformance = () => {
  const context = useContext(SystemPerformanceContext)
  if (!context) {
    throw new Error('useSystemPerformance must be used within SystemPerformanceProvider')
  }
  return context
}

export default SystemPerformanceProvider

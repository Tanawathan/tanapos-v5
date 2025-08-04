import { useCallback, useEffect, useRef, useMemo } from 'react'
import { useSmartCache, useAPICache } from '../hooks/useSmartCache'
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor'

// 整合系統狀態
interface IntegratedSystemState {
  posSystem: {
    activeOrders: number
    selectedTable: string | null
    performance: number
  }
  kdsSystem: {
    pendingOrders: number
    averageCompletionTime: number
    priority: number
  }
  tableManagement: {
    activeServices: number
    utilizationRate: number
    efficiency: number
  }
}

// 系統同步配置
interface SystemSyncConfig {
  enableRealTimeSync: boolean
  batchUpdateInterval: number
  priorityThreshold: number
  performanceThreshold: number
}

// 性能優化的整合服務
export class IntegratedSystemService {
  private static instance: IntegratedSystemService
  private subscribers = new Map<string, Set<Function>>()
  private stateCache = new Map<string, any>()
  private performanceMetrics = new Map<string, number>()
  private batchQueue = new Set<() => void>()
  private batchTimeout: NodeJS.Timeout | null = null
  private config: SystemSyncConfig

  constructor(config: Partial<SystemSyncConfig> = {}) {
    this.config = {
      enableRealTimeSync: true,
      batchUpdateInterval: 16, // 60fps
      priorityThreshold: 0.8,
      performanceThreshold: 100,
      ...config
    }
  }

  static getInstance(config?: Partial<SystemSyncConfig>): IntegratedSystemService {
    if (!IntegratedSystemService.instance) {
      IntegratedSystemService.instance = new IntegratedSystemService(config)
    }
    return IntegratedSystemService.instance
  }

  // 訂閱系統狀態變更
  subscribe(system: string, callback: Function): () => void {
    if (!this.subscribers.has(system)) {
      this.subscribers.set(system, new Set())
    }
    this.subscribers.get(system)!.add(callback)

    return () => {
      this.subscribers.get(system)?.delete(callback)
    }
  }

  // 發布系統狀態變更（批次優化）
  publish(system: string, data: any): void {
    // 更新快取
    this.stateCache.set(system, { ...data, timestamp: Date.now() })

    // 添加到批次隊列
    this.batchQueue.add(() => {
      const subscribers = this.subscribers.get(system)
      if (subscribers) {
        subscribers.forEach(callback => {
          try {
            callback(data)
          } catch (error) {
            console.error(`❌ 系統 ${system} 回調錯誤:`, error)
          }
        })
      }
    })

    // 觸發批次處理
    this.processBatchUpdates()
  }

  // 批次處理更新（性能優化）
  private processBatchUpdates(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
    }

    this.batchTimeout = setTimeout(() => {
      const startTime = performance.now()
      
      // 執行所有批次更新
      this.batchQueue.forEach(update => update())
      this.batchQueue.clear()
      
      const duration = performance.now() - startTime
      this.performanceMetrics.set('batchUpdateTime', duration)
      
      if (duration > this.config.performanceThreshold) {
        console.warn(`⚠️ 批次更新耗時過長: ${duration}ms`)
      }
    }, this.config.batchUpdateInterval)
  }

  // 獲取系統狀態（快取優化）
  getSystemState(system: string): any {
    const cached = this.stateCache.get(system)
    if (cached) {
      // 檢查快取是否過期（5秒）
      if (Date.now() - cached.timestamp < 5000) {
        return cached
      }
    }
    return null
  }

  // 清理過期狀態
  cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.stateCache.entries()) {
      if (now - value.timestamp > 30000) { // 30秒過期
        this.stateCache.delete(key)
      }
    }
  }

  // 獲取性能指標
  getPerformanceMetrics(): Map<string, number> {
    return new Map(this.performanceMetrics)
  }

  // 系統健康檢查
  healthCheck(): {
    systems: string[]
    performance: number
    isHealthy: boolean
    recommendations: string[]
  } {
    const systems = Array.from(this.stateCache.keys())
    const avgPerformance = Array.from(this.performanceMetrics.values())
      .reduce((sum, val) => sum + val, 0) / Math.max(this.performanceMetrics.size, 1)
    
    const recommendations: string[] = []
    
    if (avgPerformance > 50) {
      recommendations.push('考慮減少批次處理間隔')
    }
    
    if (this.stateCache.size > 100) {
      recommendations.push('執行快取清理')
    }

    return {
      systems,
      performance: avgPerformance,
      isHealthy: avgPerformance < 100 && systems.length > 0,
      recommendations
    }
  }
}

// React Hook for Integrated System
export const useIntegratedSystem = (systemName: string) => {
  const service = useMemo(() => IntegratedSystemService.getInstance(), [])
  const { cacheAPICall } = useAPICache()
  const { measureRenderPerformance } = usePerformanceMonitor()
  
  const stateRef = useRef<any>({})
  const subscribersRef = useRef<(() => void)[]>([])

  // 發布狀態變更（性能優化）
  const publishState = useCallback((data: any) => {
    const measure = measureRenderPerformance()
    
    // 使用快取避免重複發布相同數據
    const cacheKey = `${systemName}-state`
    const cachedData = service.getSystemState(systemName)
    
    if (JSON.stringify(cachedData) !== JSON.stringify(data)) {
      service.publish(systemName, data)
      stateRef.current = data
    }
    
    if (measure) {
      setTimeout(measure, 0) // 下一個 tick 測量
    }
  }, [systemName, service, measureRenderPerformance])

  // 訂閱其他系統狀態
  const subscribeToSystem = useCallback((targetSystem: string, callback: Function) => {
    const unsubscribe = service.subscribe(targetSystem, callback)
    subscribersRef.current.push(unsubscribe)
    return unsubscribe
  }, [service])

  // 獲取整合狀態
  const getIntegratedState = useCallback((): IntegratedSystemState => {
    const posState = service.getSystemState('pos') || {}
    const kdsState = service.getSystemState('kds') || {}
    const tableState = service.getSystemState('tableManagement') || {}

    return {
      posSystem: {
        activeOrders: posState.activeOrders || 0,
        selectedTable: posState.selectedTable || null,
        performance: posState.performance || 100
      },
      kdsSystem: {
        pendingOrders: kdsState.pendingOrders || 0,
        averageCompletionTime: kdsState.averageCompletionTime || 0,
        priority: kdsState.priority || 0
      },
      tableManagement: {
        activeServices: tableState.activeServices || 0,
        utilizationRate: tableState.utilizationRate || 0,
        efficiency: tableState.efficiency || 100
      }
    }
  }, [service])

  // 執行跨系統動作
  const executeIntegratedAction = useCallback(async (action: string, data: any) => {
    const cacheKey = `action-${action}-${Date.now()}`
    
    return cacheAPICall(cacheKey, async () => {
      switch (action) {
        case 'placeOrder':
          // 跨系統下單流程
          publishState({ type: 'ORDER_PLACED', data })
          service.publish('kds', { type: 'NEW_ORDER', data })
          service.publish('tableManagement', { type: 'TABLE_OCCUPIED', data })
          break
          
        case 'completeOrder':
          // 跨系統完成訂單流程
          publishState({ type: 'ORDER_COMPLETED', data })
          service.publish('kds', { type: 'ORDER_COMPLETED', data })
          service.publish('tableManagement', { type: 'TABLE_READY_FOR_SERVICE', data })
          break
          
        case 'optimizePerformance':
          // 性能優化
          service.cleanup()
          const health = service.healthCheck()
          return health
          
        default:
          console.warn(`❌ 未知的整合動作: ${action}`)
      }
      
      return { success: true, timestamp: Date.now() }
    }, 5000) // 5秒快取
  }, [publishState, service, cacheAPICall])

  // 清理訂閱
  useEffect(() => {
    return () => {
      subscribersRef.current.forEach(unsubscribe => unsubscribe())
    }
  }, [])

  return {
    publishState,
    subscribeToSystem,
    getIntegratedState,
    executeIntegratedAction,
    currentState: stateRef.current,
    service
  }
}

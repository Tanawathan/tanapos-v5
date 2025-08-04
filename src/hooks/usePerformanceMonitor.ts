import { useEffect, useCallback, useRef } from 'react'

// 效能指標介面
interface PerformanceMetrics {
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  fcp?: number // First Contentful Paint
  ttfb?: number // Time to First Byte
  loadTime?: number
  renderTime?: number
  memoryUsage?: {
    used: number
    total: number
    limit: number
  }
}

// 效能監控 Hook
export const usePerformanceMonitor = () => {
  const metricsRef = useRef<PerformanceMetrics>({})
  const observerRef = useRef<PerformanceObserver | null>(null)

  // 測量載入效能
  const measureLoadPerformance = useCallback(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigation) {
        metricsRef.current.loadTime = navigation.loadEventEnd - navigation.loadEventStart
        metricsRef.current.ttfb = navigation.responseStart - navigation.requestStart
        
        console.log('🚀 載入效能:', {
          載入時間: `${metricsRef.current.loadTime}ms`,
          首字節時間: `${metricsRef.current.ttfb}ms`
        })
      }
    }
  }, [])

  // 測量渲染效能
  const measureRenderPerformance = useCallback(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark('render-start')
      
      return () => {
        performance.mark('render-end')
        performance.measure('render-time', 'render-start', 'render-end')
        
        const renderMeasure = performance.getEntriesByName('render-time')[0]
        if (renderMeasure) {
          metricsRef.current.renderTime = renderMeasure.duration
          console.log(`📊 渲染時間: ${renderMeasure.duration}ms`)
        }
      }
    }
  }, [])

  // 測量記憶體使用
  const measureMemoryUsage = useCallback(() => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      metricsRef.current.memoryUsage = {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
      }
      
      console.log('🧠 記憶體使用:', metricsRef.current.memoryUsage)
    }
  }, [])

  // Core Web Vitals 監控
  const setupCoreWebVitals = useCallback(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // LCP 監控
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        metricsRef.current.lcp = lastEntry.startTime
        console.log(`🎯 LCP: ${lastEntry.startTime}ms`)
      })
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (e) {
        console.log('LCP 監控不支援')
      }

      // FID 監控
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          metricsRef.current.fid = entry.processingStart - entry.startTime
          console.log(`⚡ FID: ${metricsRef.current.fid}ms`)
        })
      })
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] })
      } catch (e) {
        console.log('FID 監控不支援')
      }

      // CLS 監控
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        const entries = list.getEntries()
        
        entries.forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        })
        
        metricsRef.current.cls = clsValue
        console.log(`📐 CLS: ${clsValue}`)
      })
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (e) {
        console.log('CLS 監控不支援')
      }

      return () => {
        lcpObserver.disconnect()
        fidObserver.disconnect()
        clsObserver.disconnect()
      }
    }
  }, [])

  // 效能警告
  const checkPerformanceThresholds = useCallback(() => {
    const metrics = metricsRef.current
    const warnings: string[] = []

    if (metrics.lcp && metrics.lcp > 2500) {
      warnings.push(`⚠️ LCP 過慢: ${metrics.lcp}ms (建議 < 2500ms)`)
    }

    if (metrics.fid && metrics.fid > 100) {
      warnings.push(`⚠️ FID 過慢: ${metrics.fid}ms (建議 < 100ms)`)
    }

    if (metrics.cls && metrics.cls > 0.1) {
      warnings.push(`⚠️ CLS 過高: ${metrics.cls} (建議 < 0.1)`)
    }

    if (metrics.memoryUsage && metrics.memoryUsage.used > 100) {
      warnings.push(`⚠️ 記憶體使用過高: ${metrics.memoryUsage.used}MB`)
    }

    if (warnings.length > 0) {
      console.warn('🚨 效能警告:', warnings)
    }

    return warnings
  }, [])

  // 匯出效能報告
  const exportPerformanceReport = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      metrics: metricsRef.current,
      warnings: checkPerformanceThresholds()
    }

    console.log('📋 效能報告:', report)
    return report
  }, [checkPerformanceThresholds])

  useEffect(() => {
    // 初始化效能監控
    measureLoadPerformance()
    const cleanupCoreWebVitals = setupCoreWebVitals()

    // 定期記憶體監控
    const memoryInterval = setInterval(measureMemoryUsage, 30000) // 每 30 秒

    // 頁面卸載時生成報告
    const handleBeforeUnload = () => {
      exportPerformanceReport()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      if (cleanupCoreWebVitals) cleanupCoreWebVitals()
      clearInterval(memoryInterval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [
    measureLoadPerformance,
    setupCoreWebVitals,
    measureMemoryUsage,
    exportPerformanceReport
  ])

  return {
    metrics: metricsRef.current,
    measureRenderPerformance,
    measureMemoryUsage,
    checkPerformanceThresholds,
    exportPerformanceReport
  }
}

// 效能裝飾器 Hook (用於組件效能測量)
export const useComponentPerformance = (componentName: string) => {
  const { measureRenderPerformance } = usePerformanceMonitor()

  useEffect(() => {
    const endMeasure = measureRenderPerformance()
    
    return () => {
      if (endMeasure) {
        endMeasure()
        console.log(`🔍 ${componentName} 渲染完成`)
      }
    }
  }, [componentName, measureRenderPerformance])
}

// 路由變更效能監控
export const useRoutePerformance = () => {
  const routeStartTime = useRef<number>(0)

  const startRouteTransition = useCallback(() => {
    routeStartTime.current = performance.now()
    performance.mark('route-start')
  }, [])

  const endRouteTransition = useCallback((routeName: string) => {
    if (routeStartTime.current > 0) {
      const duration = performance.now() - routeStartTime.current
      performance.mark('route-end')
      performance.measure(`route-${routeName}`, 'route-start', 'route-end')
      
      console.log(`🧭 路由 ${routeName} 載入時間: ${duration}ms`)
      
      if (duration > 1000) {
        console.warn(`⚠️ 路由 ${routeName} 載入過慢: ${duration}ms`)
      }
    }
  }, [])

  return {
    startRouteTransition,
    endRouteTransition
  }
}

// 批次更新效能最佳化
export const useBatchedUpdates = () => {
  const batchedUpdates = useRef<Set<() => void>>(new Set())
  const timeoutRef = useRef<NodeJS.Timeout>()

  const addToBatch = useCallback((updateFn: () => void) => {
    batchedUpdates.current.add(updateFn)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      // 執行批次更新
      batchedUpdates.current.forEach(fn => fn())
      batchedUpdates.current.clear()
    }, 16) // 一個 frame 的時間
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { addToBatch }
}

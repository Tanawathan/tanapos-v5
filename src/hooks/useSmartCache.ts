import { useCallback, useEffect, useRef } from 'react'

// 快取項目介面
interface CacheItem<T> {
  data: T
  timestamp: number
  expiry: number
  accessCount: number
  lastAccess: number
}

// 快取配置
interface CacheConfig {
  maxSize: number
  defaultTTL: number // Time To Live in milliseconds
  enableLRU: boolean // Least Recently Used eviction
  enableMetrics: boolean
}

// 快取指標
interface CacheMetrics {
  hits: number
  misses: number
  evictions: number
  size: number
  hitRate: number
}

// 智慧快取類別
class SmartCache<T> {
  private cache = new Map<string, CacheItem<T>>()
  private config: CacheConfig
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
    hitRate: 0
  }

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 100,
      defaultTTL: 5 * 60 * 1000, // 5 分鐘
      enableLRU: true,
      enableMetrics: true,
      ...config
    }
  }

  // 設定快取項目
  set(key: string, data: T, customTTL?: number): void {
    const now = Date.now()
    const ttl = customTTL || this.config.defaultTTL
    
    // 如果快取已滿，移除最舊的項目
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest()
    }

    const item: CacheItem<T> = {
      data,
      timestamp: now,
      expiry: now + ttl,
      accessCount: 0,
      lastAccess: now
    }

    this.cache.set(key, item)
    this.updateMetrics()
  }

  // 取得快取項目
  get(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      this.metrics.misses++
      this.updateMetrics()
      return null
    }

    const now = Date.now()
    
    // 檢查是否過期
    if (now > item.expiry) {
      this.cache.delete(key)
      this.metrics.misses++
      this.updateMetrics()
      return null
    }

    // 更新存取資訊
    item.accessCount++
    item.lastAccess = now
    
    this.metrics.hits++
    this.updateMetrics()
    
    return item.data
  }

  // 檢查項目是否存在且有效
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  // 移除項目
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // 清除所有快取
  clear(): void {
    this.cache.clear()
    this.metrics = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      hitRate: 0
    }
  }

  // 清除過期項目
  cleanup(): number {
    const now = Date.now()
    let cleanedCount = 0
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
        cleanedCount++
      }
    }
    
    this.updateMetrics()
    return cleanedCount
  }

  // LRU 淘汰策略
  private evictOldest(): void {
    if (!this.config.enableLRU) {
      // 隨機淘汰
      const keys = Array.from(this.cache.keys())
      const randomKey = keys[Math.floor(Math.random() * keys.length)]
      this.cache.delete(randomKey)
    } else {
      // LRU 淘汰
      let oldestKey = ''
      let oldestAccess = Date.now()
      
      for (const [key, item] of this.cache.entries()) {
        if (item.lastAccess < oldestAccess) {
          oldestAccess = item.lastAccess
          oldestKey = key
        }
      }
      
      if (oldestKey) {
        this.cache.delete(oldestKey)
        this.metrics.evictions++
      }
    }
  }

  // 更新指標
  private updateMetrics(): void {
    if (!this.config.enableMetrics) return
    
    this.metrics.size = this.cache.size
    const total = this.metrics.hits + this.metrics.misses
    this.metrics.hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0
  }

  // 取得快取指標
  getMetrics(): CacheMetrics {
    return { ...this.metrics }
  }

  // 取得快取統計
  getStats(): { keys: string[], totalSize: number, averageAccess: number } {
    const keys = Array.from(this.cache.keys())
    const totalAccess = Array.from(this.cache.values())
      .reduce((sum, item) => sum + item.accessCount, 0)
    
    return {
      keys,
      totalSize: this.cache.size,
      averageAccess: this.cache.size > 0 ? totalAccess / this.cache.size : 0
    }
  }
}

// React Hook for Smart Cache
export const useSmartCache = <T>(config?: Partial<CacheConfig>) => {
  const cacheRef = useRef<SmartCache<T>>(new SmartCache<T>(config))
  const cleanupInterval = useRef<NodeJS.Timeout>()

  // 設定自動清理
  useEffect(() => {
    if (config?.defaultTTL) {
      cleanupInterval.current = setInterval(() => {
        const cleaned = cacheRef.current.cleanup()
        if (cleaned > 0) {
          console.log(`🧹 快取清理: 移除 ${cleaned} 個過期項目`)
        }
      }, config.defaultTTL / 2) // 每半個 TTL 時間清理一次
    }

    return () => {
      if (cleanupInterval.current) {
        clearInterval(cleanupInterval.current)
      }
    }
  }, [config?.defaultTTL])

  // 快取操作函數
  const setCache = useCallback((key: string, data: T, customTTL?: number) => {
    cacheRef.current.set(key, data, customTTL)
  }, [])

  const getCache = useCallback((key: string): T | null => {
    return cacheRef.current.get(key)
  }, [])

  const hasCache = useCallback((key: string): boolean => {
    return cacheRef.current.has(key)
  }, [])

  const deleteCache = useCallback((key: string): boolean => {
    return cacheRef.current.delete(key)
  }, [])

  const clearCache = useCallback(() => {
    cacheRef.current.clear()
  }, [])

  const getCacheMetrics = useCallback(() => {
    return cacheRef.current.getMetrics()
  }, [])

  const getCacheStats = useCallback(() => {
    return cacheRef.current.getStats()
  }, [])

  return {
    setCache,
    getCache,
    hasCache,
    deleteCache,
    clearCache,
    getCacheMetrics,
    getCacheStats
  }
}

// 特化的 API 快取 Hook
export const useAPICache = () => {
  const { setCache, getCache, hasCache, getCacheMetrics } = useSmartCache<any>({
    maxSize: 200,
    defaultTTL: 10 * 60 * 1000, // 10 分鐘
    enableLRU: true,
    enableMetrics: true
  })

  const cacheAPICall = useCallback(async <T>(
    key: string,
    apiCall: () => Promise<T>,
    customTTL?: number
  ): Promise<T> => {
    // 檢查快取
    const cached = getCache(key)
    if (cached) {
      console.log(`📦 使用快取: ${key}`)
      return cached
    }

    // 呼叫 API
    try {
      console.log(`🌐 API 呼叫: ${key}`)
      const data = await apiCall()
      setCache(key, data, customTTL)
      return data
    } catch (error) {
      console.error(`❌ API 呼叫失敗: ${key}`, error)
      throw error
    }
  }, [setCache, getCache])

  const invalidateCache = useCallback((pattern: string) => {
    const stats = getCacheMetrics()
    console.log(`🗑️ 快取失效模式: ${pattern}`, stats)
    // 實現模式匹配的快取失效邏輯
  }, [getCacheMetrics])

  return {
    cacheAPICall,
    invalidateCache,
    hasCache,
    getCacheMetrics
  }
}

// 圖片快取 Hook
export const useImageCache = () => {
  const { setCache, getCache, hasCache } = useSmartCache<string>({
    maxSize: 50,
    defaultTTL: 30 * 60 * 1000, // 30 分鐘
    enableLRU: true
  })

  const cacheImage = useCallback((url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      // 檢查快取
      if (hasCache(url)) {
        const cached = getCache(url)
        if (cached) {
          resolve(cached)
          return
        }
      }

      // 載入圖片
      const img = new Image()
      img.onload = () => {
        // 轉換為 base64 或保存 URL
        setCache(url, url)
        resolve(url)
      }
      img.onerror = () => {
        reject(new Error(`圖片載入失敗: ${url}`))
      }
      img.src = url
    })
  }, [setCache, getCache, hasCache])

  return { cacheImage }
}

// 狀態快取 Hook (用於 Zustand 或其他狀態管理)
export const useStateCache = <T>() => {
  const { setCache, getCache, hasCache, clearCache } = useSmartCache<T>({
    maxSize: 20,
    defaultTTL: 60 * 60 * 1000, // 1 小時
    enableLRU: false // 狀態快取不使用 LRU
  })

  const saveState = useCallback((key: string, state: T) => {
    setCache(key, state)
    console.log(`💾 狀態快取: ${key}`)
  }, [setCache])

  const loadState = useCallback((key: string): T | null => {
    const state = getCache(key)
    if (state) {
      console.log(`📂 載入狀態: ${key}`)
    }
    return state
  }, [getCache])

  const hasState = useCallback((key: string): boolean => {
    return hasCache(key)
  }, [hasCache])

  const clearAllStates = useCallback(() => {
    clearCache()
    console.log(`🗑️ 清除所有狀態快取`)
  }, [clearCache])

  return {
    saveState,
    loadState,
    hasState,
    clearAllStates
  }
}

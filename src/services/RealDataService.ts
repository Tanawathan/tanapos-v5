import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useSmartCache } from '../hooks/useSmartCache'
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor'

// 真實資料類型定義
interface DatabaseProduct {
  id: string
  name: string
  description: string
  price: number
  category_id: string
  image_url?: string
  sku?: string
  is_available: boolean
  preparation_time?: number
}

interface DatabaseCategory {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
  sort_order: number
  is_active: boolean
}

interface DatabaseTable {
  id: string
  table_number: number
  name?: string
  capacity: number
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance'
  is_active: boolean
}

interface DatabaseOrder {
  id: string
  order_number: string
  table_id?: string
  table_number?: number
  customer_name?: string
  subtotal: number
  tax_amount: number
  total_amount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled'
  payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded'
  created_at: string
  order_items?: DatabaseOrderItem[]
}

interface DatabaseOrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_sku?: string
  quantity: number
  unit_price: number
  total_price: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled'
  special_instructions?: string
}

// 真實資料存取服務
export class RealDataService {
  private static instance: RealDataService
  private cache = new Map<string, { data: any, timestamp: number }>()
  private subscribers = new Map<string, Set<Function>>()

  static getInstance(): RealDataService {
    if (!RealDataService.instance) {
      RealDataService.instance = new RealDataService()
    }
    return RealDataService.instance
  }

  // 餐廳資料
  async getRestaurant() {
    const cacheKey = 'restaurant'
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .single()

    if (error) throw new Error(`取得餐廳資訊失敗: ${error.message}`)
    
    this.setCache(cacheKey, data)
    return data
  }

  // 分類資料
  async getCategories(): Promise<DatabaseCategory[]> {
    const cacheKey = 'categories'
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    if (error) throw new Error(`載入分類失敗: ${error.message}`)
    
    this.setCache(cacheKey, data || [])
    return data || []
  }

  // 產品資料
  async getProducts(): Promise<DatabaseProduct[]> {
    const cacheKey = 'products'
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        category_id,
        image_url,
        sku,
        is_available,
        preparation_time
      `)
      .eq('is_active', true)
      .order('sort_order')

    if (error) throw new Error(`載入產品失敗: ${error.message}`)
    
    this.setCache(cacheKey, data || [])
    return data || []
  }

  // 根據分類取得產品
  async getProductsByCategory(categoryId: string): Promise<DatabaseProduct[]> {
    const cacheKey = `products_category_${categoryId}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .eq('is_available', true)
      .order('sort_order')

    if (error) throw new Error(`載入分類產品失敗: ${error.message}`)
    
    this.setCache(cacheKey, data || [])
    return data || []
  }

  // 桌位資料
  async getTables(): Promise<DatabaseTable[]> {
    const cacheKey = 'tables'
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('is_active', true)
      .order('table_number')

    if (error) throw new Error(`載入桌位失敗: ${error.message}`)
    
    this.setCache(cacheKey, data || [])
    return data || []
  }

  // 訂單資料
  async getOrders(): Promise<DatabaseOrder[]> {
    const cacheKey = 'orders'
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        table_id,
        table_number,
        customer_name,
        subtotal,
        tax_amount,
        total_amount,
        status,
        payment_status,
        created_at,
        order_items (
          id,
          order_id,
          product_id,
          product_name,
          product_sku,
          quantity,
          unit_price,
          total_price,
          status,
          special_instructions
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`載入訂單失敗: ${error.message}`)
    
    return (data || []) as DatabaseOrder[]
  }

  // 今日訂單
  async getTodayOrders(): Promise<DatabaseOrder[]> {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`載入今日訂單失敗: ${error.message}`)
    
    return data || []
  }

  // 新增訂單
  async createOrder(orderData: {
    table_id?: string
    table_number?: number
    customer_name?: string
    items: {
      product_id: string
      quantity: number
      special_instructions?: string
    }[]
  }): Promise<DatabaseOrder> {
    // 生成訂單編號
    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    
    // 計算訂單金額
    const products = await this.getProducts()
    let subtotal = 0
    const orderItems = orderData.items.map(item => {
      const product = products.find(p => p.id === item.product_id)
      if (!product) throw new Error(`產品不存在: ${item.product_id}`)
      
      const itemTotal = product.price * item.quantity
      subtotal += itemTotal
      
      return {
        product_id: item.product_id,
        product_name: product.name,
        product_sku: product.sku || '',
        quantity: item.quantity,
        unit_price: product.price,
        total_price: itemTotal,
        special_instructions: item.special_instructions || null
      }
    })

    const taxAmount = Math.round(subtotal * 0.1) // 10% 稅率
    const totalAmount = subtotal + taxAmount

    // 創建訂單
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        table_id: orderData.table_id,
        table_number: orderData.table_number,
        customer_name: orderData.customer_name,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'unpaid'
      })
      .select()
      .single()

    if (orderError) throw new Error(`創建訂單失敗: ${orderError.message}`)

    // 創建訂單項目
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems.map(item => ({
        order_id: order.id,
        ...item
      })))

    if (itemsError) throw new Error(`創建訂單項目失敗: ${itemsError.message}`)

    // 更新桌位狀態
    if (orderData.table_id) {
      await supabase
        .from('tables')
        .update({ status: 'occupied' })
        .eq('id', orderData.table_id)
    }

    // 清除快取
    this.clearCache(['orders', 'tables'])

    // 發布事件
    this.publishUpdate('order_created', order)

    return order
  }

  // 更新訂單狀態
  async updateOrderStatus(orderId: string, status: DatabaseOrder['status']): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (error) throw new Error(`更新訂單狀態失敗: ${error.message}`)

    // 如果訂單完成，更新桌位狀態
    if (status === 'completed') {
      const { data: order } = await supabase
        .from('orders')
        .select('table_id')
        .eq('id', orderId)
        .single()

      if (order?.table_id) {
        await supabase
          .from('tables')
          .update({ status: 'available' })
          .eq('id', order.table_id)
      }
    }

    this.clearCache(['orders', 'tables'])
    this.publishUpdate('order_updated', { id: orderId, status })
  }

  // 更新桌位狀態
  async updateTableStatus(tableId: string, status: DatabaseTable['status']): Promise<void> {
    const { error } = await supabase
      .from('tables')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', tableId)

    if (error) throw new Error(`更新桌位狀態失敗: ${error.message}`)

    this.clearCache(['tables'])
    this.publishUpdate('table_updated', { id: tableId, status })
  }

  // 即時資料訂閱
  subscribeToRealtime(callback: (event: string, data: any) => void) {
    // 訂閱訂單變更
    const ordersChannel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        (payload) => callback('orders', payload)
      )
      .subscribe()

    // 訂閱桌位變更
    const tablesChannel = supabase
      .channel('tables-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tables' }, 
        (payload) => callback('tables', payload)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ordersChannel)
      supabase.removeChannel(tablesChannel)
    }
  }

  // 快取管理
  private setCache(key: string, data: any, ttl = 5 * 60 * 1000) { // 5分鐘快取
    this.cache.set(key, {
      data,
      timestamp: Date.now() + ttl
    })
  }

  private getFromCache(key: string) {
    const cached = this.cache.get(key)
    if (cached && cached.timestamp > Date.now()) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }

  private clearCache(keys?: string[]) {
    if (keys) {
      keys.forEach(key => this.cache.delete(key))
    } else {
      this.cache.clear()
    }
  }

  // 事件發布
  private publishUpdate(event: string, data: any) {
    const subscribers = this.subscribers.get(event)
    if (subscribers) {
      subscribers.forEach(callback => callback(data))
    }
  }

  // 事件訂閱
  subscribe(event: string, callback: Function) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set())
    }
    this.subscribers.get(event)!.add(callback)

    return () => {
      this.subscribers.get(event)?.delete(callback)
    }
  }
}

// React Hook for Real Data
export const useRealData = () => {
  const service = RealDataService.getInstance()
  const { setCache, getCache } = useSmartCache()
  const { measureRenderPerformance } = usePerformanceMonitor()

  // 包裝 API 呼叫的快取函數
  const cacheAPICall = async <T>(key: string, apiCall: () => Promise<T>): Promise<T> => {
    const cached = getCache(key) as T
    if (cached) {
      return cached
    }
    
    const result = await apiCall()
    setCache(key, result)
    return result
  }

  // 資料載入 Hook
  const useCategories = () => {
    const [categories, setCategories] = useState<DatabaseCategory[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadCategories = useCallback(async () => {
      try {
        setLoading(true)
        const data = await cacheAPICall('categories', () => service.getCategories())
        setCategories(data)
        setError(null)
      } catch (err: any) {
        setError(err.message)
        console.error('載入分類失敗:', err)
      } finally {
        setLoading(false)
      }
    }, [service])

    useEffect(() => {
      loadCategories()
    }, [loadCategories])

    return { categories, loading, error, reload: loadCategories }
  }

  const useProducts = (categoryId?: string) => {
    const [products, setProducts] = useState<DatabaseProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadProducts = useCallback(async () => {
      try {
        setLoading(true)
        const cacheKey = categoryId ? `products_${categoryId}` : 'products'
        const data = await cacheAPICall(cacheKey, () => 
          categoryId ? service.getProductsByCategory(categoryId) : service.getProducts()
        )
        setProducts(data)
        setError(null)
      } catch (err: any) {
        setError(err.message)
        console.error('載入產品失敗:', err)
      } finally {
        setLoading(false)
      }
    }, [categoryId, service])

    useEffect(() => {
      loadProducts()
    }, [loadProducts])

    return { products, loading, error, reload: loadProducts }
  }

  const useTables = () => {
    const [tables, setTables] = useState<DatabaseTable[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadTables = useCallback(async () => {
      try {
        setLoading(true)
        const data = await cacheAPICall('tables', () => service.getTables())
        setTables(data)
        setError(null)
      } catch (err: any) {
        setError(err.message)
        console.error('載入桌位失敗:', err)
      } finally {
        setLoading(false)
      }
    }, [service])

    useEffect(() => {
      loadTables()
    }, [loadTables])

    return { tables, loading, error, reload: loadTables }
  }

  const useOrders = () => {
    const [orders, setOrders] = useState<DatabaseOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadOrders = useCallback(async () => {
      try {
        setLoading(true)
        const data = await service.getOrders()
        setOrders(data)
        setError(null)
      } catch (err: any) {
        setError(err.message)
        console.error('載入訂單失敗:', err)
      } finally {
        setLoading(false)
      }
    }, [service])

    useEffect(() => {
      loadOrders()

      // 訂閱即時更新
      const unsubscribe = service.subscribeToRealtime((event, data) => {
        if (event === 'orders') {
          loadOrders() // 重新載入訂單
        }
      })

      return unsubscribe
    }, [loadOrders])

    return { orders, loading, error, reload: loadOrders }
  }

  return {
    useCategories,
    useProducts,
    useTables,
    useOrders,
    service
  }
}

export default RealDataService

import { supabase as supabaseClient } from '../lib/supabase'

// 訂單狀態枚舉
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  PAID = 'paid',
  CANCELLED = 'cancelled'
}

// 支付狀態枚舉 (for payments table)
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

// 訂單支付狀態枚舉 (for orders table)
export enum OrderPaymentStatus {
  UNPAID = 'unpaid',
  PROCESSING = 'processing',
  PAID = 'paid', 
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

// 訂單介面
export interface Order {
  id: string
  restaurant_id?: string
  table_id?: string
  order_number: string
  table_number?: number
  customer_name?: string
  customer_phone?: string
  subtotal: number
  tax_amount: number
  total_amount: number
  status: OrderStatus
  payment_status: OrderPaymentStatus
  payment_method?: string
  notes?: string
  created_by?: string
  served_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

// 訂單項目介面
export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_sku?: string
  quantity: number
  unit_price: number
  total_price: number
  special_instructions?: string
  status: OrderStatus
  created_at: string
  updated_at: string
}

// 購物車項目介面
export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  specialInstructions?: string
}

// 支付記錄介面
export interface PaymentRecord {
  id: string
  order_id: string
  amount: number
  method: string
  status: PaymentStatus
  transaction_id?: string
  processed_at?: string
  created_at: string
  updated_at: string
}

class OrderService {
  private supabase = supabaseClient

  // 生成訂單號
  generateOrderNumber(): string {
    return `ORD-${Date.now()}`
  }

  // 創建訂單
  async createOrder(
    tableNumber: number,
    customerName: string,
    cartItems: CartItem[]
  ): Promise<{ order: Order; success: boolean; error?: string }> {
    try {
      // 計算金額
      const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const tax_amount = Math.round(subtotal * 0.1) // 10% 稅
      const total_amount = subtotal + tax_amount

      // 創建訂單
      const orderData = {
        order_number: this.generateOrderNumber(),
        table_number: tableNumber,
        customer_name: customerName,
        subtotal,
        tax_amount,
        total_amount,
        status: OrderStatus.PENDING,
        payment_status: OrderPaymentStatus.UNPAID
      }

      const { data: order, error: orderError } = await this.supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (orderError) {
        throw new Error(`創建訂單失敗: ${orderError.message}`)
      }

      // 創建訂單項目
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        special_instructions: item.specialInstructions || '',
        status: OrderStatus.PENDING
      }))

      const { error: itemsError } = await this.supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        // 如果項目創建失敗，刪除已創建的訂單
        await this.supabase.from('orders').delete().eq('id', order.id)
        throw new Error(`創建訂單項目失敗: ${itemsError.message}`)
      }

      return { order, success: true }
    } catch (error) {
      console.error('創建訂單錯誤:', error)
      return { 
        order: {} as Order, 
        success: false, 
        error: error instanceof Error ? error.message : '未知錯誤' 
      }
    }
  }

  // 更新訂單狀態
  async updateOrderStatus(
    orderId: string, 
    status: OrderStatus
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updates: any = { 
        status,
        updated_at: new Date().toISOString()
      }

      // 根據狀態添加時間戳
      if (status === OrderStatus.SERVED) {
        updates.served_at = new Date().toISOString()
      } else if (status === OrderStatus.PAID) {
        updates.completed_at = new Date().toISOString()
      }

      const { error } = await this.supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)

      if (error) {
        throw new Error(`更新訂單狀態失敗: ${error.message}`)
      }

      return { success: true }
    } catch (error) {
      console.error('更新訂單狀態錯誤:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '未知錯誤' 
      }
    }
  }

  // 更新支付狀態
  async updatePaymentStatus(
    orderId: string, 
    paymentStatus: OrderPaymentStatus,
    paymentMethod?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updates: any = {
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      }

      if (paymentMethod) {
        updates.payment_method = paymentMethod
      }

      const { error } = await this.supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)

      if (error) {
        throw new Error(`更新支付狀態失敗: ${error.message}`)
      }

      return { success: true }
    } catch (error) {
      console.error('更新支付狀態錯誤:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '未知錯誤' 
      }
    }
  }

  // 處理支付
  async processPayment(
    orderId: string,
    amount: number,
    method: string
  ): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    try {
      // 創建支付記錄 (使用 PaymentStatus for payments table)
      const paymentData = {
        order_id: orderId,
        amount,
        method,
        status: PaymentStatus.PENDING,
        transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }

      const { data: payment, error: paymentError } = await this.supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single()

      if (paymentError) {
        throw new Error(`創建支付記錄失敗: ${paymentError.message}`)
      }

      // 模擬支付處理 (實際應用中這裡會調用支付網關)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 支付成功，更新狀態 (使用 OrderPaymentStatus for orders table)
      await this.updatePaymentStatus(orderId, OrderPaymentStatus.PAID, method)
      await this.updateOrderStatus(orderId, OrderStatus.PAID)

      // 更新支付記錄 (使用 PaymentStatus for payments table)
      await this.supabase
        .from('payments')
        .update({
          status: PaymentStatus.COMPLETED,
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id)

      return { success: true, paymentId: payment.id }
    } catch (error) {
      console.error('處理支付錯誤:', error)
      
      // 支付失敗時更新訂單狀態
      try {
        await this.updatePaymentStatus(orderId, OrderPaymentStatus.UNPAID)
      } catch (updateError) {
        console.error('更新失敗狀態錯誤:', updateError)
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '未知錯誤' 
      }
    }
  }

  // 獲取訂單詳情（包含項目）
  async getOrderWithItems(orderId: string): Promise<Order | null> {
    try {
      const { data: order, error: orderError } = await this.supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (orderError || !order) {
        throw new Error(`獲取訂單失敗: ${orderError?.message}`)
      }

      const { data: items, error: itemsError } = await this.supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)

      if (itemsError) {
        console.warn('獲取訂單項目失敗:', itemsError.message)
      }

      return { ...order, items: items || [] }
    } catch (error) {
      console.error('獲取訂單詳情錯誤:', error)
      return null
    }
  }

  // 獲取訂單列表
  async getOrders(
    limit = 50,
    offset = 0,
    status?: OrderStatus
  ): Promise<Order[]> {
    try {
      let query = this.supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`獲取訂單列表失敗: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('獲取訂單列表錯誤:', error)
      return []
    }
  }

  // 取消訂單
  async cancelOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('orders')
        .update({
          status: OrderStatus.CANCELLED,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) {
        throw new Error(`取消訂單失敗: ${error.message}`)
      }

      return { success: true }
    } catch (error) {
      console.error('取消訂單錯誤:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '未知錯誤' 
      }
    }
  }

  // 按日期範圍獲取訂單 (用於統計)
  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    try {
      const { data: orders, error } = await this.supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`獲取訂單失敗: ${error.message}`)
      }

      return orders || []
    } catch (error) {
      console.error('按日期範圍獲取訂單錯誤:', error)
      return []
    }
  }

  // 即時訂閱訂單變更
  subscribeToOrders(callback: (payload: any) => void) {
    return this.supabase
      .channel('orders-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        callback
      )
      .subscribe()
  }

  // 即時訂閱訂單項目變更
  subscribeToOrderItems(callback: (payload: any) => void) {
    return this.supabase
      .channel('order-items-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'order_items' },
        callback
      )
      .subscribe()
  }
}

// 創建單例
export const orderService = new OrderService()
export default orderService

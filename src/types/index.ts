// 共享的資料類型定義
export interface Product {
  id: number
  name: string
  price: number
  category: string
  image: string
}

export interface ComboItems {
  main?: Product
  salad?: Product
  drink?: Product
  dessert?: Product
}

export interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  type: 'single' | 'combo'
  comboItems?: ComboItems
  notes?: string
  category?: string
  completed?: boolean
}

export interface CustomerInfo {
  tableNumber: string
  customerName?: string
  notes?: string
}

export interface Order {
  id: string
  orderNumber: string
  tableNumber: string
  customerName?: string
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'preparing' | 'ready' | 'dessert-waiting' | 'completed'
  orderTime: Date
  estimatedTime?: number // 預估完成時間（分鐘）
  priority: 'normal' | 'urgent' | 'vip'
  specialInstructions?: string
  itemCompletionStatus?: { [itemId: string]: boolean }
  comboItemCompletionStatus?: { [itemId: string]: { [comboType: string]: boolean } }
  kitchenStatus?: 'pending' | 'preparing' | 'ready' // 廚房狀態
  barStatus?: 'pending' | 'preparing' | 'ready' // 吧台狀態
  dessertAfterMealStatus?: 'waiting' | 'ready' | 'served' // 等餐後甜點狀態
}

// 訂單狀態中文對照
export const ORDER_STATUS_MAP = {
  pending: '待處理',
  preparing: '製作中', 
  ready: '已完成',
  completed: '已送餐'
} as const

// 優先級中文對照
export const PRIORITY_MAP = {
  normal: '一般',
  urgent: '🔥 急單',
  vip: '⭐ VIP'
} as const

// 顏色配置
export const STATUS_COLORS = {
  pending: '#f59e0b',
  preparing: '#3b82f6',
  ready: '#10b981',
  completed: '#6b7280'
} as const

export const PRIORITY_COLORS = {
  normal: '#6b7280',
  urgent: '#ef4444',
  vip: '#8b5cf6'
} as const

// 桌況管理相關類型
export interface Table {
  id: string
  number: string // 桌號
  capacity: number // 座位數
  area?: string // 區域（如：A區、B區）
  status: TableStatus
  customersCount?: number // 當前人數
  seatedTime?: Date // 入座時間
  lastStatusChange?: Date // 最後狀態變更時間
  notes?: string // 桌位備註
  estimatedLeaveTime?: Date // 預估離開時間
  currentOrder?: Order // 當前訂單
  totalAmount?: number // 消費金額
}

export type TableStatus = 
  | 'available'        // 空桌 🟢
  | 'seated'          // 已入座 🟡  
  | 'dining'          // 用餐中 🔴
  | 'cleaning'        // 待清理 🟠
  | 'reserved'        // 預約中 🔵

// 桌況狀態中文對照
export const TABLE_STATUS_MAP = {
  available: '空桌',
  seated: '已入座',
  dining: '用餐中', 
  cleaning: '待清理',
  reserved: '預約中'
} as const

// 桌況狀態顏色配置
export const TABLE_STATUS_COLORS = {
  available: '#10b981',   // 綠色
  seated: '#f59e0b',      // 黃色
  dining: '#ef4444',      // 紅色
  cleaning: '#f97316',    // 橙色
  reserved: '#3b82f6'     // 藍色
} as const

// 桌況統計資訊
export interface TableStatistics {
  totalTables: number
  usedTables: number
  availableRate: number // 空桌率
  averageDiningTime: number // 平均用餐時間（分鐘）
  turnoverRate: number // 翻桌率
  cleaningTables: number // 待清理桌數
}

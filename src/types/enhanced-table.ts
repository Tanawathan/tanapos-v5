// 增強型桌位系統類型定義

export type ExtendedTableStatus = 
  | 'available'     // 可用
  | 'seated'        // 已入座
  | 'reserved'      // 已預約
  | 'ordered'       // 已點餐
  | 'waiting_food'  // 等待上菜
  | 'dining'        // 用餐中
  | 'needs_service' // 需要服務
  | 'cleaning'      // 清理中

export interface TableTimer {
  id: string
  table_id: string
  timer_type: 'seating' | 'ordering' | 'reservation'
  started_at: string
  ended_at?: string
  duration_minutes?: number
  is_active: boolean
}

export interface EnhancedTable {
  id: string
  table_number: string
  capacity: number
  status: ExtendedTableStatus
  current_order_id?: string
  reserved_by?: string
  reserved_at?: string
  timer?: TableTimer
  last_order_time?: string
  estimated_availability?: string
  service_priority: 'normal' | 'high' | 'urgent'
  notes?: string
  location_zone: string // 區域劃分
  current_party_size?: number
  dining_start_time?: string
}

export interface TableRecommendation {
  table: EnhancedTable
  score: number
  reasons: string[]
  estimatedWaitTime: number
  suitability: 'perfect' | 'good' | 'acceptable'
}

export interface SmartTableSelector {
  availableTables: EnhancedTable[]
  recommendations: TableRecommendation[]
  waitTime: number
  suggestedActions: string[]
}

export interface TableAvailability {
  isAvailable: boolean
  reason?: string
  estimatedWaitTime?: number
  conflictingReservation?: any
  alternativeTables?: EnhancedTable[]
}

export interface StatusConflictData {
  tableId: string
  currentStatus: ExtendedTableStatus
  requestedStatus: ExtendedTableStatus
  timestamp: Date
  source: 'pos' | 'kds' | 'table_management'
}

export interface TableAction {
  id: string
  label: string
  action: () => void
  disabled?: boolean
}

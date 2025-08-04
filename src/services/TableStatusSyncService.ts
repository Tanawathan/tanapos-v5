import { EnhancedOrder, TableStatusUpdate } from '../types/enhanced-order'
import { EnhancedTable, ExtendedTableStatus } from '../types/enhanced-table'

interface StatusSyncListener {
  id: string
  callback: (update: TableStatusUpdate) => void
  filter?: {
    tableIds?: string[]
    orderIds?: string[]
    sources?: ('pos' | 'kds' | 'table_management' | 'kitchen' | 'service' | 'auto')[]
  }
}

export class TableStatusSyncService {
  private listeners: StatusSyncListener[] = []
  private pendingUpdates: Map<string, TableStatusUpdate[]> = new Map()
  private lastSyncTime: Map<string, Date> = new Map()
  
  /**
   * 訂閱桌位狀態更新
   */
  subscribe(
    id: string,
    callback: (update: TableStatusUpdate) => void,
    filter?: StatusSyncListener['filter']
  ): () => void {
    const listener: StatusSyncListener = { id, callback, filter }
    this.listeners.push(listener)
    
    // 返回取消訂閱函數
    return () => {
      this.listeners = this.listeners.filter(l => l.id !== id)
    }
  }

  /**
   * 發布桌位狀態更新
   */
  publishStatusUpdate(update: TableStatusUpdate): void {
    // 記錄更新時間
    this.lastSyncTime.set(update.tableId, update.timestamp)
    
    // 添加到待處理更新
    const tableUpdates = this.pendingUpdates.get(update.tableId) || []
    tableUpdates.push(update)
    this.pendingUpdates.set(update.tableId, tableUpdates)
    
    // 通知所有符合條件的監聽器
    this.notifyListeners(update)
    
    // 記錄日誌
    console.log(`[TableStatusSync] 狀態更新: ${update.tableId} ${update.oldStatus} → ${update.newStatus} (${update.trigger})`)
  }

  /**
   * 通知監聽器
   */
  private notifyListeners(update: TableStatusUpdate): void {
    this.listeners.forEach(listener => {
      // 檢查過濾條件
      if (this.shouldNotifyListener(listener, update)) {
        try {
          listener.callback(update)
        } catch (error) {
          console.error(`[TableStatusSync] 監聽器 ${listener.id} 處理更新時出錯:`, error)
        }
      }
    })
  }

  /**
   * 檢查是否應該通知監聽器
   */
  private shouldNotifyListener(listener: StatusSyncListener, update: TableStatusUpdate): boolean {
    const filter = listener.filter
    if (!filter) return true
    
    // 檢查桌位ID過濾
    if (filter.tableIds && !filter.tableIds.includes(update.tableId)) {
      return false
    }
    
    // 檢查訂單ID過濾
    if (filter.orderIds && !filter.orderIds.includes(update.orderId)) {
      return false
    }
    
    // 檢查來源過濾
    if (filter.sources && !filter.sources.includes(update.trigger)) {
      return false
    }
    
    return true
  }

  /**
   * 從KDS觸發桌位狀態更新
   */
  updateFromKDS(orderId: string, tableId: string, newStatus: ExtendedTableStatus, metadata?: Record<string, any>): void {
    const currentTime = new Date()
    
    // 獲取當前狀態（模擬）
    const oldStatus = this.getCurrentTableStatus(tableId)
    
    const update: TableStatusUpdate = {
      orderId,
      tableId,
      oldStatus,
      newStatus,
      trigger: 'kds',
      timestamp: currentTime,
      metadata
    }
    
    this.publishStatusUpdate(update)
  }

  /**
   * 從POS觸發桌位狀態更新
   */
  updateFromPOS(orderId: string, tableId: string, newStatus: ExtendedTableStatus, metadata?: Record<string, any>): void {
    const currentTime = new Date()
    const oldStatus = this.getCurrentTableStatus(tableId)
    
    const update: TableStatusUpdate = {
      orderId,
      tableId,
      oldStatus,
      newStatus,
      trigger: 'pos',
      timestamp: currentTime,
      metadata
    }
    
    this.publishStatusUpdate(update)
  }

  /**
   * 從桌位管理系統觸發狀態更新
   */
  updateFromTableManagement(orderId: string, tableId: string, newStatus: ExtendedTableStatus, metadata?: Record<string, any>): void {
    const currentTime = new Date()
    const oldStatus = this.getCurrentTableStatus(tableId)
    
    const update: TableStatusUpdate = {
      orderId,
      tableId,
      oldStatus,
      newStatus,
      trigger: 'table_management',
      timestamp: currentTime,
      metadata
    }
    
    this.publishStatusUpdate(update)
  }

  /**
   * 獲取桌位的待處理更新
   */
  getPendingUpdates(tableId: string): TableStatusUpdate[] {
    return this.pendingUpdates.get(tableId) || []
  }

  /**
   * 清除桌位的待處理更新
   */
  clearPendingUpdates(tableId: string): void {
    this.pendingUpdates.delete(tableId)
  }

  /**
   * 獲取最後同步時間
   */
  getLastSyncTime(tableId: string): Date | undefined {
    return this.lastSyncTime.get(tableId)
  }

  /**
   * 檢查桌位是否需要同步
   */
  needsSync(tableId: string, threshold: number = 5000): boolean {
    const lastSync = this.lastSyncTime.get(tableId)
    if (!lastSync) return true
    
    return (Date.now() - lastSync.getTime()) > threshold
  }

  /**
   * 獲取當前桌位狀態（模擬實現）
   */
  private getCurrentTableStatus(tableId: string): string {
    // 這裡應該從實際的桌位管理系統獲取狀態
    // 目前返回模擬狀態
    const mockStatuses = ['available', 'seated', 'ordered', 'waiting_food', 'dining']
    return mockStatuses[Math.floor(Math.random() * mockStatuses.length)]
  }

  /**
   * 批量處理狀態更新
   */
  batchUpdateStatus(updates: TableStatusUpdate[]): void {
    updates.forEach(update => {
      this.publishStatusUpdate(update)
    })
  }

  /**
   * 獲取所有活躍的監聽器
   */
  getActiveListeners(): StatusSyncListener[] {
    return [...this.listeners]
  }

  /**
   * 清理過期的更新記錄
   */
  cleanup(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now()
    
    // 清理過期的同步時間記錄
    for (const [tableId, lastSync] of this.lastSyncTime.entries()) {
      if (now - lastSync.getTime() > maxAge) {
        this.lastSyncTime.delete(tableId)
      }
    }
    
    // 清理過期的待處理更新
    for (const [tableId, updates] of this.pendingUpdates.entries()) {
      const recentUpdates = updates.filter(update => 
        now - update.timestamp.getTime() < maxAge
      )
      
      if (recentUpdates.length > 0) {
        this.pendingUpdates.set(tableId, recentUpdates)
      } else {
        this.pendingUpdates.delete(tableId)
      }
    }
  }
}

// 創建全局實例
export const tableStatusSyncService = new TableStatusSyncService()

// 自動清理定時器
setInterval(() => {
  tableStatusSyncService.cleanup()
}, 60 * 60 * 1000) // 每小時清理一次

export default tableStatusSyncService

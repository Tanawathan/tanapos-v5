import type { EnhancedTable, TableAvailability, ExtendedTableStatus } from '../types/enhanced-table'

export class TableAvailabilityChecker {
  private tables: EnhancedTable[] = []

  constructor(tables: EnhancedTable[]) {
    this.tables = tables
  }

  // 檢查實時可用性
  async checkRealTimeAvailability(tableId: string): Promise<TableAvailability> {
    const table = this.tables.find(t => t.id === tableId)
    
    if (!table) {
      return {
        isAvailable: false,
        reason: '桌位不存在'
      }
    }

    // 檢查桌位狀態
    if (table.status === 'available') {
      return {
        isAvailable: true
      }
    }

    // 檢查是否即將可用
    if (table.status === 'cleaning') {
      return {
        isAvailable: false,
        reason: '桌位清理中',
        estimatedWaitTime: 10 // 假設清理需要10分鐘
      }
    }

    if (table.status === 'dining' && table.dining_start_time) {
      const diningTime = this.calculateDiningTime(table.dining_start_time)
      const averageDiningTime = this.getAverageDiningTime(table.capacity)
      
      if (diningTime > averageDiningTime) {
        return {
          isAvailable: false,
          reason: '桌位使用中，但可能即將空出',
          estimatedWaitTime: Math.max(15, averageDiningTime - diningTime)
        }
      }
    }

    return {
      isAvailable: false,
      reason: this.getStatusReason(table.status),
      estimatedWaitTime: this.predictAvailabilityTime(tableId)
    }
  }

  // 預測可用時間
  predictAvailabilityTime(tableId: string): number {
    const table = this.tables.find(t => t.id === tableId)
    if (!table) return 0

    switch (table.status) {
      case 'available':
        return 0
      case 'cleaning':
        return 10
      case 'seated':
        return 20 // 預計20分鐘點餐
      case 'ordered':
        return 45 // 預計45分鐘用餐
      case 'waiting_food':
        return 60 // 預計60分鐘完整用餐
      case 'dining':
        if (table.dining_start_time) {
          const diningTime = this.calculateDiningTime(table.dining_start_time)
          const averageDiningTime = this.getAverageDiningTime(table.capacity)
          return Math.max(15, averageDiningTime - diningTime)
        }
        return 30
      case 'needs_service':
        return 15
      case 'reserved':
        if (table.reserved_at) {
          const reservedTime = new Date(table.reserved_at).getTime()
          const now = Date.now()
          const bufferTime = 15 * 60 * 1000 // 15分鐘緩衝
          return Math.max(0, (reservedTime - now + bufferTime) / (60 * 1000))
        }
        return 30
      default:
        return 30
    }
  }

  // 驗證預約衝突
  async validateReservationConflict(tableId: string, time: Date): Promise<boolean> {
    const table = this.tables.find(t => t.id === tableId)
    if (!table) return true

    // 檢查是否已有預約
    if (table.status === 'reserved' && table.reserved_at) {
      const reservedTime = new Date(table.reserved_at)
      const timeDiff = Math.abs(time.getTime() - reservedTime.getTime())
      const bufferTime = 2 * 60 * 60 * 1000 // 2小時緩衝

      return timeDiff < bufferTime
    }

    return false
  }

  // 計算等待時間
  async calculateWaitTime(partySize: number): Promise<number> {
    const suitableTables = this.tables.filter(t => t.capacity >= partySize)
    
    if (suitableTables.length === 0) {
      return 60 // 沒有合適桌位，預計等待60分鐘
    }

    const availableTables = suitableTables.filter(t => t.status === 'available')
    if (availableTables.length > 0) {
      return 0 // 有可用桌位
    }

    // 計算最短等待時間
    const waitTimes = suitableTables.map(t => this.predictAvailabilityTime(t.id))
    return Math.min(...waitTimes)
  }

  // 私有輔助方法
  private calculateDiningTime(startTime: string): number {
    const start = new Date(startTime).getTime()
    const now = Date.now()
    return (now - start) / (60 * 1000) // 返回分鐘數
  }

  private getAverageDiningTime(capacity: number): number {
    // 根據桌位容量返回平均用餐時間（分鐘）
    if (capacity <= 2) return 45
    if (capacity <= 4) return 60
    if (capacity <= 6) return 75
    return 90
  }

  private getStatusReason(status: ExtendedTableStatus): string {
    const statusMap = {
      'seated': '客人已入座',
      'reserved': '桌位已預約',
      'ordered': '客人已點餐',
      'waiting_food': '等待上菜',
      'dining': '客人用餐中',
      'needs_service': '需要服務',
      'cleaning': '桌位清理中',
      'available': '桌位可用'
    }
    
    return statusMap[status] || '桌位不可用'
  }

  // 更新桌位數據
  updateTables(tables: EnhancedTable[]) {
    this.tables = tables
  }

  // 獲取所有可用桌位
  getAvailableTables(): EnhancedTable[] {
    return this.tables.filter(t => t.status === 'available')
  }

  // 獲取即將可用的桌位
  getSoonAvailableTables(maxWaitTime: number = 15): EnhancedTable[] {
    return this.tables.filter(t => {
      if (t.status === 'available') return false
      const waitTime = this.predictAvailabilityTime(t.id)
      return waitTime <= maxWaitTime
    })
  }
}

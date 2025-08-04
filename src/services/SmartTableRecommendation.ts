import type { EnhancedTable, TableRecommendation, SmartTableSelector } from '../types/enhanced-table'
import { TableAvailabilityChecker } from './TableAvailabilityChecker'

export class SmartTableRecommendation {
  private availabilityChecker: TableAvailabilityChecker

  constructor(tables: EnhancedTable[]) {
    this.availabilityChecker = new TableAvailabilityChecker(tables)
  }

  // 獲取智能推薦
  async getSmartRecommendations(partySize: number, preferences?: {
    zone?: string
    maxWaitTime?: number
    serviceLevel?: 'standard' | 'priority' | 'vip'
  }): Promise<SmartTableSelector> {
    const tables = this.availabilityChecker.getAvailableTables()
    const soonAvailable = this.availabilityChecker.getSoonAvailableTables(preferences?.maxWaitTime || 15)
    
    const allCandidates = [...tables, ...soonAvailable]
    const suitableTables = allCandidates.filter(t => t.capacity >= partySize)

    const recommendations = await Promise.all(
      suitableTables.map(table => this.createRecommendation(table, partySize, preferences))
    )

    // 按分數排序
    recommendations.sort((a, b) => b.score - a.score)

    const waitTime = await this.availabilityChecker.calculateWaitTime(partySize)
    const suggestedActions = this.generateSuggestedActions(recommendations, partySize, waitTime)

    return {
      availableTables: tables.filter(t => t.capacity >= partySize),
      recommendations: recommendations.slice(0, 5), // 只返回前5個推薦
      waitTime,
      suggestedActions
    }
  }

  // 創建單個桌位推薦
  private async createRecommendation(
    table: EnhancedTable, 
    partySize: number, 
    preferences?: any
  ): Promise<TableRecommendation> {
    const score = this.calculateScore(table, partySize, preferences)
    const reasons = this.generateReasons(table, partySize, preferences)
    const estimatedWaitTime = this.availabilityChecker.predictAvailabilityTime(table.id)
    const suitability = this.determineSuitability(score)

    return {
      table,
      score,
      reasons,
      estimatedWaitTime,
      suitability
    }
  }

  // 計算推薦分數
  private calculateScore(table: EnhancedTable, partySize: number, preferences?: any): number {
    let score = 0

    // 1. 容量匹配度 (40%)
    const capacityScore = this.getCapacityScore(table.capacity, partySize)
    score += capacityScore * 0.4

    // 2. 狀態分數 (30%)
    const statusScore = this.getStatusScore(table.status)
    score += statusScore * 0.3

    // 3. 區域偏好 (15%)
    const locationScore = this.getLocationScore(table.location_zone, preferences?.zone)
    score += locationScore * 0.15

    // 4. 等待時間 (10%)
    const waitTimeScore = this.getWaitTimeScore(this.availabilityChecker.predictAvailabilityTime(table.id))
    score += waitTimeScore * 0.1

    // 5. 服務優先級 (5%)
    const priorityScore = this.getPriorityScore(table.service_priority, preferences?.serviceLevel)
    score += priorityScore * 0.05

    return Math.round(score * 100) / 100
  }

  // 容量匹配分數
  private getCapacityScore(tableCapacity: number, partySize: number): number {
    if (tableCapacity < partySize) return 0 // 不能容納
    
    const ratio = partySize / tableCapacity
    
    if (ratio >= 0.8) return 1.0 // 最佳匹配
    if (ratio >= 0.6) return 0.9 // 良好匹配
    if (ratio >= 0.4) return 0.7 // 可接受
    if (ratio >= 0.25) return 0.5 // 過大但可用
    return 0.3 // 太大
  }

  // 狀態分數
  private getStatusScore(status: string): number {
    const statusScores = {
      'available': 1.0,
      'cleaning': 0.8,
      'needs_service': 0.6,
      'dining': 0.4,
      'waiting_food': 0.3,
      'ordered': 0.2,
      'seated': 0.1,
      'reserved': 0.0
    }
    
    return statusScores[status] || 0
  }

  // 區域分數
  private getLocationScore(tableZone: string, preferredZone?: string): number {
    if (!preferredZone) return 0.7 // 中性分數
    return tableZone === preferredZone ? 1.0 : 0.3
  }

  // 等待時間分數
  private getWaitTimeScore(waitTimeMinutes: number): number {
    if (waitTimeMinutes === 0) return 1.0
    if (waitTimeMinutes <= 5) return 0.9
    if (waitTimeMinutes <= 10) return 0.7
    if (waitTimeMinutes <= 15) return 0.5
    if (waitTimeMinutes <= 30) return 0.3
    return 0.1
  }

  // 優先級分數
  private getPriorityScore(tablePriority: string, preferredLevel?: string): number {
    if (!preferredLevel) return 0.7
    
    const priorityMap = {
      'urgent': 3,
      'high': 2,
      'normal': 1
    }
    
    const tableLevel = priorityMap[tablePriority] || 1
    const preferredLevelNum = priorityMap[preferredLevel] || 1
    
    return tableLevel >= preferredLevelNum ? 1.0 : 0.5
  }

  // 生成推薦原因
  private generateReasons(table: EnhancedTable, partySize: number, preferences?: any): string[] {
    const reasons: string[] = []

    // 容量匹配
    const capacityRatio = partySize / table.capacity
    if (capacityRatio >= 0.8) {
      reasons.push('🎯 桌位大小完美匹配')
    } else if (capacityRatio >= 0.6) {
      reasons.push('✅ 桌位大小合適')
    } else if (capacityRatio <= 0.5) {
      reasons.push('📏 桌位較大，更舒適')
    }

    // 狀態
    if (table.status === 'available') {
      reasons.push('🟢 立即可用')
    } else {
      const waitTime = this.availabilityChecker.predictAvailabilityTime(table.id)
      if (waitTime <= 10) {
        reasons.push(`⏱️ 約${waitTime}分鐘後可用`)
      }
    }

    // 區域
    if (preferences?.zone && table.location_zone === preferences.zone) {
      reasons.push(`📍 位於偏好區域 (${table.location_zone})`)
    }

    // 服務優先級
    if (table.service_priority === 'high' || table.service_priority === 'urgent') {
      reasons.push('⭐ 優先服務桌位')
    }

    // 特殊情況
    if (table.notes) {
      reasons.push(`📝 ${table.notes}`)
    }

    return reasons
  }

  // 確定適合度
  private determineSuitability(score: number): 'perfect' | 'good' | 'acceptable' {
    if (score >= 0.8) return 'perfect'
    if (score >= 0.6) return 'good'
    return 'acceptable'
  }

  // 生成建議操作
  private generateSuggestedActions(
    recommendations: TableRecommendation[], 
    partySize: number, 
    waitTime: number
  ): string[] {
    const actions: string[] = []

    if (recommendations.length === 0) {
      actions.push('❌ 目前沒有適合的桌位')
      actions.push('💡 建議考慮外帶或預約')
      return actions
    }

    const perfectMatches = recommendations.filter(r => r.suitability === 'perfect')
    const availableNow = recommendations.filter(r => r.estimatedWaitTime === 0)

    if (availableNow.length > 0) {
      actions.push('✅ 有桌位立即可用，建議馬上安排')
    } else if (waitTime <= 10) {
      actions.push(`⏰ 建議等待約${waitTime}分鐘`)
    } else if (waitTime <= 30) {
      actions.push('🎫 建議取號等待或考慮預約')
    } else {
      actions.push('📅 建議預約其他時段')
    }

    if (perfectMatches.length > 0) {
      actions.push(`🎯 發現${perfectMatches.length}個完美匹配桌位`)
    }

    // 容量建議
    const oversizedTables = recommendations.filter(r => 
      r.table.capacity > partySize * 1.5
    )
    
    if (oversizedTables.length > 0 && recommendations.length > oversizedTables.length) {
      actions.push('💡 有更合適大小的桌位可選')
    }

    return actions
  }

  // 更新桌位數據
  updateTables(tables: EnhancedTable[]) {
    this.availabilityChecker.updateTables(tables)
  }

  // 獲取快速推薦（用於實時顯示）
  async getQuickRecommendation(partySize: number): Promise<EnhancedTable | null> {
    const recommendations = await this.getSmartRecommendations(partySize)
    
    if (recommendations.recommendations.length === 0) return null
    
    return recommendations.recommendations[0].table
  }
}

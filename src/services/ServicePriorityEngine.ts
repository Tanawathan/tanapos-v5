import { EnhancedOrder, ServicePriorityConfig } from '../types/enhanced-order'
import { EnhancedTable } from '../types/enhanced-table'

export class ServicePriorityEngine {
  private config: ServicePriorityConfig = {
    factors: {
      waitTime: {
        weight: 30,
        thresholds: { low: 5, normal: 10, high: 15, urgent: 20 }
      },
      tableType: {
        weight: 20,
        vipMultiplier: 1.5,
        capacityBonus: 0.1
      },
      partySize: {
        weight: 20,
        largePartyThreshold: 6,
        largePartyBonus: 0.2
      },
      specialNeeds: {
        weight: 15,
        categories: {
          '過敏提醒': 10,
          '特殊飲食': 8,
          '慶祝活動': 12,
          '商務用餐': 15,
          '特急': 20
        }
      }
    }
  }

  /**
   * 計算訂單的服務優先級
   */
  calculateServicePriority(order: EnhancedOrder, tableInfo?: EnhancedTable): EnhancedOrder['servicePriority'] {
    const waitTimeMinutes = this.getWaitTimeMinutes(order.orderTime)
    
    // 計算各項因子分數
    const waitTimeScore = this.calculateWaitTimeScore(waitTimeMinutes)
    const tableTypeScore = this.calculateTableTypeScore(tableInfo)
    const partySizeScore = this.calculatePartySizeScore(order.tableInfo?.partySize || 2)
    const specialNeedsScore = this.calculateSpecialNeedsScore(order)
    const vipScore = this.calculateVipScore(tableInfo)

    // 加權總分
    const totalScore = Math.min(100, Math.round(
      waitTimeScore + tableTypeScore + partySizeScore + specialNeedsScore + vipScore
    ))

    // 確定優先級等級
    const level = this.determinePriorityLevel(totalScore, waitTimeMinutes)
    
    // 生成原因說明
    const reasons = this.generatePriorityReasons({
      waitTimeScore,
      tableTypeScore,
      partySizeScore,
      specialNeedsScore,
      vipScore,
      waitTimeMinutes,
      tableInfo,
      order
    })

    return {
      score: totalScore,
      factors: {
        waitTime: waitTimeScore,
        tableType: tableTypeScore,
        partySize: partySizeScore,
        specialNeeds: specialNeedsScore,
        vipStatus: vipScore
      },
      level,
      reason: reasons
    }
  }

  /**
   * 計算等待時間分數 (0-30分)
   */
  private calculateWaitTimeScore(waitTimeMinutes: number): number {
    const { weight, thresholds } = this.config.factors.waitTime
    
    if (waitTimeMinutes >= thresholds.urgent) return weight
    if (waitTimeMinutes >= thresholds.high) return weight * 0.8
    if (waitTimeMinutes >= thresholds.normal) return weight * 0.5
    if (waitTimeMinutes >= thresholds.low) return weight * 0.2
    return 0
  }

  /**
   * 計算桌位類型分數 (0-20分)
   */
  private calculateTableTypeScore(tableInfo?: EnhancedTable): number {
    if (!tableInfo) return 0
    
    const { weight, vipMultiplier, capacityBonus } = this.config.factors.tableType
    let score = 0
    
    // VIP桌位加成
    if (tableInfo.location_zone.includes('VIP')) {
      score += weight * 0.6 * vipMultiplier
    }
    
    // 大桌容量加成
    if (tableInfo.capacity >= 8) {
      score += weight * capacityBonus * tableInfo.capacity
    }
    
    // 高優先級桌位加成
    if (tableInfo.service_priority === 'high' || tableInfo.service_priority === 'urgent') {
      score += weight * 0.2
    }
    
    return Math.min(weight, score)
  }

  /**
   * 計算用餐人數分數 (0-20分)
   */
  private calculatePartySizeScore(partySize: number): number {
    const { weight, largePartyThreshold, largePartyBonus } = this.config.factors.partySize
    
    if (partySize >= largePartyThreshold) {
      return weight * (1 + largePartyBonus * (partySize - largePartyThreshold + 1))
    }
    
    // 小型聚會基礎分數
    return weight * 0.1 * partySize
  }

  /**
   * 計算特殊需求分數 (0-15分)
   */
  private calculateSpecialNeedsScore(order: EnhancedOrder): number {
    const { weight, categories } = this.config.factors.specialNeeds
    let score = 0
    
    // 檢查訂單備註中的特殊需求
    const notes = (order as any).notes?.toLowerCase() || ''
    const itemNotes = order.items.flatMap(item => item.notes || '').join(' ').toLowerCase()
    const allNotes = notes + ' ' + itemNotes
    
    for (const [category, categoryScore] of Object.entries(categories)) {
      if (this.containsKeywords(allNotes, category)) {
        score += categoryScore
      }
    }
    
    return Math.min(weight, score)
  }

  /**
   * 計算VIP狀態分數 (0-15分)
   */
  private calculateVipScore(tableInfo?: EnhancedTable): number {
    if (!tableInfo) return 0
    
    const weight = 15
    let score = 0
    
    // VIP區域
    if (tableInfo.location_zone.includes('VIP')) {
      score += weight * 0.7
    }
    
    // 高優先級桌位
    if (tableInfo.service_priority === 'high' || tableInfo.service_priority === 'urgent') {
      score += weight * 0.3
    }
    
    return Math.min(weight, score)
  }

  /**
   * 確定優先級等級
   */
  private determinePriorityLevel(score: number, waitTimeMinutes: number): 'low' | 'normal' | 'high' | 'urgent' {
    // 等待時間過長強制提升優先級
    if (waitTimeMinutes >= 20) return 'urgent'
    if (waitTimeMinutes >= 15) return 'high'
    
    // 根據分數確定等級
    if (score >= 80) return 'urgent'
    if (score >= 60) return 'high'
    if (score >= 30) return 'normal'
    return 'low'
  }

  /**
   * 生成優先級原因說明
   */
  private generatePriorityReasons(data: {
    waitTimeScore: number
    tableTypeScore: number
    partySizeScore: number
    specialNeedsScore: number
    vipScore: number
    waitTimeMinutes: number
    tableInfo?: EnhancedTable
    order: EnhancedOrder
  }): string[] {
    const reasons: string[] = []
    
    // 等待時間原因
    if (data.waitTimeMinutes >= 15) {
      reasons.push(`⏰ 等待時間已達 ${data.waitTimeMinutes} 分鐘`)
    } else if (data.waitTimeMinutes >= 10) {
      reasons.push(`🕐 等待時間 ${data.waitTimeMinutes} 分鐘`)
    }
    
    // 桌位類型原因
    if (data.tableInfo?.location_zone.includes('VIP')) {
      reasons.push('👑 VIP 桌位')
    }
    if (data.tableInfo && data.tableInfo.capacity >= 8) {
      reasons.push(`👥 大型聚餐 (${data.tableInfo.capacity}人桌)`)
    }
    
    // 用餐人數原因
    if (data.order.tableInfo && data.order.tableInfo.partySize >= 6) {
      reasons.push(`🍽️ 多人用餐 (${data.order.tableInfo.partySize}人)`)
    }
    
    // 特殊需求原因
    if (data.specialNeedsScore > 0) {
      reasons.push('⚠️ 特殊需求')
    }
    
    return reasons
  }

  /**
   * 檢查文本是否包含關鍵詞
   */
  private containsKeywords(text: string, category: string): boolean {
    const keywords: Record<string, string[]> = {
      '過敏提醒': ['過敏', '不吃', '忌', '敏感'],
      '特殊飲食': ['素食', '清真', '無糖', '低鹽', '養生'],
      '慶祝活動': ['生日', '慶祝', '紀念', '慶生', '週年'],
      '商務用餐': ['商務', '會議', '討論', '商談'],
      '特急': ['急', '趕時間', '快點', '特急']
    }
    
    const categoryKeywords = keywords[category] || []
    return categoryKeywords.some(keyword => text.includes(keyword))
  }

  /**
   * 獲取等待時間（分鐘）
   */
  private getWaitTimeMinutes(orderTime: Date): number {
    return Math.floor((Date.now() - orderTime.getTime()) / (1000 * 60))
  }

  /**
   * 批量計算多個訂單的優先級
   */
  calculateBatchPriority(orders: EnhancedOrder[], tables?: EnhancedTable[]): EnhancedOrder[] {
    return orders.map(order => {
      const tableInfo = tables?.find(table => table.id === order.tableInfo?.tableId)
      const servicePriority = this.calculateServicePriority(order, tableInfo)
      
      return {
        ...order,
        servicePriority
      }
    })
  }

  /**
   * 獲取優先級配置
   */
  getConfig(): ServicePriorityConfig {
    return { ...this.config }
  }

  /**
   * 更新優先級配置
   */
  updateConfig(newConfig: Partial<ServicePriorityConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

export default ServicePriorityEngine

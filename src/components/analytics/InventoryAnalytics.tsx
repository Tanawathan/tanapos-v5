import React, { useState, useEffect } from 'react'

interface InventoryItem {
  id: string
  name: string
  category: string
  currentStock: number
  averageUsage: number // 每日平均使用量
  daysRemaining: number
  reorderPoint: number
  cost: number
  revenue: number
  turnoverRate: number
  profitMargin: number
  status: 'healthy' | 'warning' | 'critical' | 'overstock'
}

const generateInventoryData = (): InventoryItem[] => {
  const items = [
    { name: '牛肉', category: '肉類', cost: 80000, usage: 15 },
    { name: '豬肉', category: '肉類', cost: 45000, usage: 20 },
    { name: '雞肉', category: '肉類', cost: 35000, usage: 25 },
    { name: '白米', category: '主食', cost: 15000, usage: 30 },
    { name: '麵條', category: '主食', cost: 12000, usage: 18 },
    { name: '高麗菜', category: '蔬菜', cost: 8000, usage: 12 },
    { name: '青菜', category: '蔬菜', cost: 6000, usage: 15 },
    { name: '蔥', category: '蔬菜', cost: 3000, usage: 8 },
    { name: '醬油', category: '調料', cost: 5000, usage: 3 },
    { name: '沙拉油', category: '調料', cost: 4000, usage: 5 }
  ]

  return items.map((item, index) => {
    const stock = Math.floor(Math.random() * 100) + 20
    const daysRemaining = Math.floor(stock / item.usage)
    const revenue = item.cost * (1.5 + Math.random() * 0.5) // 成本的1.5-2倍
    const turnoverRate = 365 / (stock / item.usage) // 年週轉率
    const profitMargin = ((revenue - item.cost) / revenue) * 100
    
    let status: InventoryItem['status'] = 'healthy'
    if (daysRemaining < 3) status = 'critical'
    else if (daysRemaining < 7) status = 'warning'
    else if (daysRemaining > 30) status = 'overstock'

    return {
      id: `item-${index}`,
      name: item.name,
      category: item.category,
      currentStock: stock,
      averageUsage: item.usage,
      daysRemaining,
      reorderPoint: item.usage * 7, // 7天安全庫存
      cost: item.cost,
      revenue,
      turnoverRate,
      profitMargin,
      status
    }
  })
}

const InventoryAnalytics: React.FC = () => {
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([])
  const [sortBy, setSortBy] = useState<'turnover' | 'profit' | 'stock' | 'category'>('turnover')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  useEffect(() => {
    setInventoryData(generateInventoryData())
    
    // 每分鐘更新數據
    const interval = setInterval(() => {
      setInventoryData(generateInventoryData())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // 排序數據
  const sortedData = [...inventoryData].sort((a, b) => {
    switch (sortBy) {
      case 'turnover':
        return b.turnoverRate - a.turnoverRate
      case 'profit':
        return b.profitMargin - a.profitMargin
      case 'stock':
        return a.daysRemaining - b.daysRemaining
      case 'category':
        return a.category.localeCompare(b.category)
      default:
        return 0
    }
  })

  // 過濾數據
  const filteredData = sortedData.filter(item => 
    filterCategory === 'all' || item.category === filterCategory
  )

  // 統計數據
  const totalItems = inventoryData.length
  const criticalItems = inventoryData.filter(item => item.status === 'critical').length
  const warningItems = inventoryData.filter(item => item.status === 'warning').length
  const overstockItems = inventoryData.filter(item => item.status === 'overstock').length
  const avgTurnover = inventoryData.reduce((sum, item) => sum + item.turnoverRate, 0) / totalItems
  const totalValue = inventoryData.reduce((sum, item) => sum + item.cost, 0)

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'critical': return '#ef4444'
      case 'warning': return '#f59e0b'
      case 'overstock': return '#8b5cf6'
      case 'healthy': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getStatusText = (status: InventoryItem['status']) => {
    switch (status) {
      case 'critical': return '緊急補貨'
      case 'warning': return '需要補貨'
      case 'overstock': return '庫存過多'
      case 'healthy': return '正常'
      default: return '未知'
    }
  }

  const categories = ['all', ...Array.from(new Set(inventoryData.map(item => item.category)))]

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* 標題和控制項 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <h2 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#1e293b',
          margin: 0 
        }}>
          📦 庫存週轉率分析
        </h2>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '0.375rem',
              border: '1px solid #d1d5db',
              fontSize: '0.9rem'
            }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? '全部分類' : cat}
              </option>
            ))}
          </select>
          
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: '0.5rem',
              borderRadius: '0.375rem',
              border: '1px solid #d1d5db',
              fontSize: '0.9rem'
            }}
          >
            <option value="turnover">週轉率排序</option>
            <option value="profit">毛利率排序</option>
            <option value="stock">庫存天數排序</option>
            <option value="category">分類排序</option>
          </select>
        </div>
      </div>

      {/* 總覽統計卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{criticalItems}</div>
          <div style={{ opacity: 0.9 }}>緊急補貨項目</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{warningItems}</div>
          <div style={{ opacity: 0.9 }}>需要補貨項目</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{overstockItems}</div>
          <div style={{ opacity: 0.9 }}>庫存過多項目</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {Math.round(avgTurnover)}x
          </div>
          <div style={{ opacity: 0.9 }}>平均週轉率</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            NT$ {totalValue.toLocaleString()}
          </div>
          <div style={{ opacity: 0.9 }}>總庫存價值</div>
        </div>
      </div>

      {/* 詳細庫存表格 */}
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        overflowX: 'auto'
      }}>
        <h3 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          marginBottom: '1.5rem',
          color: '#1e293b'
        }}>
          📋 詳細庫存分析
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                  品項
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                  分類
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>
                  狀態
                </th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>
                  剩餘天數
                </th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>
                  週轉率
                </th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>
                  毛利率
                </th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>
                  庫存價值
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr 
                  key={item.id}
                  style={{ 
                    borderBottom: '1px solid #f3f4f6',
                    backgroundColor: index % 2 === 0 ? '#fafafa' : 'white'
                  }}
                >
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      現有: {item.currentStock} 單位
                    </div>
                  </td>
                  
                  <td style={{ padding: '1rem', color: '#374151' }}>
                    {item.category}
                  </td>
                  
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span style={{
                      background: getStatusColor(item.status),
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {getStatusText(item.status)}
                    </span>
                  </td>
                  
                  <td style={{ 
                    padding: '1rem', 
                    textAlign: 'right',
                    color: item.daysRemaining < 7 ? '#ef4444' : '#374151',
                    fontWeight: item.daysRemaining < 7 ? '600' : 'normal'
                  }}>
                    {item.daysRemaining} 天
                  </td>
                  
                  <td style={{ 
                    padding: '1rem', 
                    textAlign: 'right',
                    color: '#374151',
                    fontWeight: '600'
                  }}>
                    {Math.round(item.turnoverRate)}x/年
                  </td>
                  
                  <td style={{ 
                    padding: '1rem', 
                    textAlign: 'right',
                    color: item.profitMargin > 50 ? '#10b981' : '#374151',
                    fontWeight: item.profitMargin > 50 ? '600' : 'normal'
                  }}>
                    {Math.round(item.profitMargin)}%
                  </td>
                  
                  <td style={{ 
                    padding: '1rem', 
                    textAlign: 'right',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    NT$ {item.cost.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 改善建議 */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        color: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        marginTop: '2rem'
      }}>
        <h3 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          margin: '0 0 1rem 0'
        }}>
          💡 庫存優化建議
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          {criticalItems > 0 && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.2)',
              borderRadius: '0.5rem',
              padding: '1rem',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <strong>🚨 緊急行動</strong>
              <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
                有 {criticalItems} 項商品需要緊急補貨，建議立即聯繫供應商
              </p>
            </div>
          )}
          
          {overstockItems > 0 && (
            <div style={{
              background: 'rgba(139, 92, 246, 0.2)',
              borderRadius: '0.5rem',
              padding: '1rem',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}>
              <strong>📦 庫存優化</strong>
              <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
                有 {overstockItems} 項商品庫存過多，建議推廣促銷或調整進貨量
              </p>
            </div>
          )}
          
          <div style={{
            background: 'rgba(16, 185, 129, 0.2)',
            borderRadius: '0.5rem',
            padding: '1rem',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <strong>📈 週轉提升</strong>
            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
              平均週轉率 {Math.round(avgTurnover)}x，建議目標提升至 15x 以上
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InventoryAnalytics

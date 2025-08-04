import React, { useState, useEffect } from 'react'
import InventoryAnalytics from './InventoryAnalytics'

// 模擬數據生成函數
const generateHourlyData = () => {
  const hours = []
  const currentHour = new Date().getHours()
  
  for (let i = 6; i <= 23; i++) {
    const sales = Math.floor(Math.random() * 50000) + 10000
    const orders = Math.floor(Math.random() * 30) + 5
    
    hours.push({
      hour: i,
      sales,
      orders,
      avgOrder: Math.round(sales / orders),
      isCurrentHour: i === currentHour
    })
  }
  return hours
}

const generateTopProducts = () => {
  const products = [
    { name: '招牌牛肉麵', sales: 1250000, orders: 450, profit: 0.65 },
    { name: '紅燒排骨飯', sales: 980000, orders: 380, profit: 0.58 },
    { name: '蒜泥白肉', sales: 750000, orders: 220, profit: 0.72 },
    { name: '宮保雞丁', sales: 680000, orders: 280, profit: 0.61 },
    { name: '麻婆豆腐', sales: 520000, orders: 200, profit: 0.69 },
    { name: '糖醋里肌', sales: 450000, orders: 180, profit: 0.55 },
    { name: '三杯雞', sales: 420000, orders: 150, profit: 0.63 },
    { name: '鹽酥雞', sales: 380000, orders: 190, profit: 0.48 }
  ]
  
  return products.sort((a, b) => b.sales - a.sales)
}

const generateTableEfficiency = () => {
  const tables = []
  for (let i = 1; i <= 12; i++) {
    const usage = Math.random() * 0.8 + 0.2 // 20% - 100%
    const revenue = Math.floor(Math.random() * 80000) + 20000
    const turnover = Math.floor(Math.random() * 8) + 2
    
    tables.push({
      id: i,
      usage: usage,
      revenue,
      turnover,
      efficiency: usage * turnover / 10 // 效率計算
    })
  }
  return tables.sort((a, b) => b.efficiency - a.efficiency)
}

const AdvancedAnalytics: React.FC = () => {
  const [hourlyData, setHourlyData] = useState(generateHourlyData())
  const [topProducts, setTopProducts] = useState(generateTopProducts())
  const [tableEfficiency, setTableEfficiency] = useState(generateTableEfficiency())
  const [selectedTimeRange, setSelectedTimeRange] = useState('today')
  const [activeSection, setActiveSection] = useState('sales') // 添加區段狀態

  // 定時更新數據
  useEffect(() => {
    const interval = setInterval(() => {
      setHourlyData(generateHourlyData())
      setTopProducts(generateTopProducts())
      setTableEfficiency(generateTableEfficiency())
    }, 30000) // 每30秒更新

    return () => clearInterval(interval)
  }, [])

  // 計算總體統計
  const totalSales = hourlyData.reduce((sum, h) => sum + h.sales, 0)
  const totalOrders = hourlyData.reduce((sum, h) => sum + h.orders, 0)
  const avgOrderValue = Math.round(totalSales / totalOrders)
  const peakHour = hourlyData.reduce((peak, current) => 
    current.sales > peak.sales ? current : peak
  )

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* 標題和時間選擇器 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          color: '#1e293b',
          margin: 0 
        }}>
          📈 進階數據分析
        </h1>
        
        <select 
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            border: '2px solid #e2e8f0',
            fontSize: '1rem',
            background: 'white',
            cursor: 'pointer'
          }}
        >
          <option value="today">今日</option>
          <option value="week">本週</option>
          <option value="month">本月</option>
        </select>
      </div>

      {/* 區段導航 */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        background: 'white',
        padding: '0.5rem',
        borderRadius: '1rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <button
          onClick={() => setActiveSection('sales')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: activeSection === 'sales' ? '#4f46e5' : 'transparent',
            color: activeSection === 'sales' ? 'white' : '#6b7280',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          📊 銷售分析
        </button>
        
        <button
          onClick={() => setActiveSection('inventory')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: activeSection === 'inventory' ? '#4f46e5' : 'transparent',
            color: activeSection === 'inventory' ? 'white' : '#6b7280',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          📦 庫存分析
        </button>
      </div>

      {/* 條件渲染內容 */}
      {activeSection === 'inventory' ? (
        <InventoryAnalytics />
      ) : (
        <>
      {/* 核心 KPI 卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
            NT$ {totalSales.toLocaleString()}
          </div>
          <div style={{ opacity: 0.9, marginTop: '0.5rem' }}>今日總銷售額</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
            {totalOrders}
          </div>
          <div style={{ opacity: 0.9, marginTop: '0.5rem' }}>完成訂單數</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
            NT$ {avgOrderValue}
          </div>
          <div style={{ opacity: 0.9, marginTop: '0.5rem' }}>平均客單價</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
            {peakHour.hour}:00
          </div>
          <div style={{ opacity: 0.9, marginTop: '0.5rem' }}>尖峰時段</div>
        </div>
      </div>

      {/* 每小時銷售趨勢圖 */}
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          marginBottom: '2rem',
          color: '#1e293b'
        }}>
          📊 每小時銷售趨勢
        </h3>
        
        <div style={{ position: 'relative', height: '300px' }}>
          {/* 簡單的長條圖 */}
          <div style={{
            display: 'flex',
            alignItems: 'end',
            height: '250px',
            gap: '4px',
            padding: '0 1rem'
          }}>
            {hourlyData.map((data) => {
              const height = (data.sales / Math.max(...hourlyData.map(h => h.sales))) * 200
              return (
                <div key={data.hour} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  flex: 1
                }}>
                  <div
                    style={{
                      background: data.isCurrentHour 
                        ? 'linear-gradient(to top, #ef4444, #dc2626)'
                        : 'linear-gradient(to top, #3b82f6, #1d4ed8)',
                      height: `${height}px`,
                      width: '100%',
                      borderRadius: '4px 4px 0 0',
                      minHeight: '20px',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    title={`${data.hour}:00 - NT$${data.sales.toLocaleString()}`}
                  >
                    {data.isCurrentHour && (
                      <div style={{
                        position: 'absolute',
                        top: '-25px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#ef4444',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        whiteSpace: 'nowrap'
                      }}>
                        現在
                      </div>
                    )}
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#6b7280',
                    marginTop: '0.5rem'
                  }}>
                    {data.hour}:00
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 熱銷商品排行和桌位效率 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* 熱銷商品排行榜 */}
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            marginBottom: '1.5rem',
            color: '#1e293b'
          }}>
            🏆 熱銷商品排行榜
          </h3>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {topProducts.map((product, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem 0',
                borderBottom: index < topProducts.length - 1 ? '1px solid #e5e7eb' : 'none'
              }}>
                <div style={{
                  background: index < 3 
                    ? ['#ffd700', '#c0c0c0', '#cd7f32'][index]
                    : '#e5e7eb',
                  color: index < 3 ? 'white' : '#6b7280',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  marginRight: '1rem'
                }}>
                  {index + 1}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>
                    {product.name}
                  </div>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: '#6b7280',
                    marginTop: '0.25rem'
                  }}>
                    {product.orders} 份 • 毛利率 {Math.round(product.profit * 100)}%
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: '#10b981' }}>
                    NT$ {product.sales.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 桌位使用效率 */}
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            marginBottom: '1.5rem',
            color: '#1e293b'
          }}>
            🪑 桌位使用效率
          </h3>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {tableEfficiency.map((table, index) => (
              <div key={table.id} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem 0',
                borderBottom: index < tableEfficiency.length - 1 ? '1px solid #e5e7eb' : 'none'
              }}>
                <div style={{
                  background: '#3b82f6',
                  color: 'white',
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  marginRight: '1rem'
                }}>
                  {table.id}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>
                      桌位 {table.id}
                    </span>
                    <span style={{ 
                      color: table.efficiency > 0.5 ? '#10b981' : '#f59e0b',
                      fontWeight: '600'
                    }}>
                      {Math.round(table.efficiency * 100)}% 效率
                    </span>
                  </div>
                  
                  <div style={{ 
                    background: '#f1f5f9',
                    borderRadius: '4px',
                    height: '6px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: table.efficiency > 0.5 ? '#10b981' : '#f59e0b',
                      height: '100%',
                      width: `${table.usage * 100}%`,
                      borderRadius: '4px'
                    }} />
                  </div>
                  
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#6b7280',
                    marginTop: '0.25rem'
                  }}>
                    使用率 {Math.round(table.usage * 100)}% • 翻桌 {table.turnover} 次 • NT$ {table.revenue.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 實時警報和建議 */}
      <div style={{
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        color: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          margin: 0
        }}>
          🎯 營運建議
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '0.5rem',
            padding: '1rem'
          }}>
            <strong>📈 銷售建議</strong>
            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
              目前是{peakHour.hour}:00尖峰時段，建議增加人手並推廣高毛利商品
            </p>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '0.5rem',
            padding: '1rem'
          }}>
            <strong>🪑 桌位優化</strong>
            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
              桌位1-3效率最高，建議優先安排客人至這些桌位
            </p>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  )
}

export default AdvancedAnalytics

import React, { useState, useEffect } from 'react'
import { useTableStore } from '../../stores/tableStore'
import { useUIStyle } from '../../contexts/UIStyleContext'
import { Table } from '../../types/index'
import LoadingSpinner from '../analytics/LoadingSpinner'

// 桌台卡片組件
const TableCard: React.FC<{
  table: Table
  onStatusChange: (tableId: string, status: string) => void
  themeColors: any
  uiStyle: string
  isMobile: boolean
}> = ({ table, onStatusChange, themeColors, uiStyle, isMobile }) => {
  const isDining = table.status === 'dining'
  const isSeated = table.status === 'seated'
  const isCleaning = table.status === 'cleaning'
  const isReserved = table.status === 'reserved'
  const isAvailable = table.status === 'available'
  
  const getStatusColor = () => {
    if (isDining) return '#ef4444' // red-500 - 用餐中
    if (isSeated) return '#f59e0b' // amber-500 - 已入座
    if (isCleaning) return '#f97316' // orange-500 - 待清理
    if (isReserved) return '#3b82f6' // blue-500 - 預約中
    return '#10b981' // emerald-500 - 空桌
  }
  
  const getStatusText = () => {
    if (isDining) return '用餐中'
    if (isSeated) return '已入座'
    if (isCleaning) return '待清理'
    if (isReserved) return '預約中'
    return '空桌'
  }
  
  const getStatusIcon = () => {
    if (isDining) return '🔴'
    if (isSeated) return '🟡'
    if (isCleaning) return '🧽'
    if (isReserved) return '�'
    return '✅'
  }

  return (
    <div
      style={{
        border: uiStyle === 'brutalism' ? `4px solid ${themeColors.border}` :
                uiStyle === 'kawaii' ? `3px solid ${getStatusColor()}` : 
                `2px solid ${getStatusColor()}`,
        borderRadius: uiStyle === 'brutalism' || uiStyle === 'dos' || uiStyle === 'bios' ? '0' :
                     uiStyle === 'kawaii' ? '20px' :
                     uiStyle === 'neumorphism' ? '16px' : '12px',
        padding: isMobile ? '16px' : '20px',
        backgroundColor: uiStyle === 'glassmorphism' ? 'rgba(255, 255, 255, 0.1)' :
                        uiStyle === 'neumorphism' ? 'linear-gradient(145deg, #f0f0f3, #cacdd1)' :
                        themeColors.cardBg,
        color: themeColors.text,
        boxShadow: uiStyle === 'brutalism' ? '6px 6px 0px #000000' :
                  uiStyle === 'cyberpunk' ? '0 0 20px rgba(0, 255, 255, 0.3)' :
                  uiStyle === 'kawaii' ? '0 8px 24px rgba(255, 105, 180, 0.3)' :
                  uiStyle === 'neumorphism' ? '12px 12px 24px #bebebe, -12px -12px 24px #ffffff' :
                  uiStyle === 'glassmorphism' ? '0 8px 32px 0 rgba(31, 38, 135, 0.37)' : 
                  '0 4px 16px rgba(0, 0, 0, 0.1)',
        backdropFilter: uiStyle === 'glassmorphism' ? 'blur(8px)' : 'none',
        transform: uiStyle === 'brutalism' ? 'rotate(-1deg)' :
                  uiStyle === 'kawaii' ? 'rotate(0.5deg)' : 'none',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
      className="hover:scale-105"
    >
      {/* 狀態指示器 */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: getStatusColor(),
          boxShadow: uiStyle === 'cyberpunk' ? `0 0 10px ${getStatusColor()}` : 'none'
        }}
      />
      
      {/* 桌號 */}
      <div style={{
        fontSize: isMobile ? '24px' : '28px',
        fontWeight: uiStyle === 'brutalism' || uiStyle === 'dos' ? '900' : 'bold',
        marginBottom: '8px',
        color: themeColors.primary,
        fontFamily: uiStyle === 'brutalism' ? 'Impact, "Arial Black", sans-serif' :
                   uiStyle === 'dos' || uiStyle === 'bios' ? 'monospace' :
                   uiStyle === 'kawaii' ? '"Comic Sans MS", cursive' : 'inherit',
        textShadow: uiStyle === 'cyberpunk' ? '0 0 10px rgba(0, 255, 255, 0.5)' : 'none'
      }}>
        桌號 {table.number || table.id}
      </div>
      
      {/* 區域 */}
      {table.area && (
        <div style={{
          fontSize: '12px',
          color: themeColors.secondary,
          marginBottom: '8px',
          fontWeight: uiStyle === 'brutalism' || uiStyle === 'dos' ? '700' : 'normal'
        }}>
          📍 {table.area}
        </div>
      )}
      
      {/* 容量 */}
      <div style={{
        fontSize: '14px',
        color: themeColors.secondary,
        marginBottom: '12px',
        fontWeight: uiStyle === 'brutalism' || uiStyle === 'dos' ? '700' : 'normal'
      }}>
        👥 容量: {table.capacity || 4} 人
      </div>
      
      {/* 狀態 */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '6px 12px',
          borderRadius: uiStyle === 'brutalism' || uiStyle === 'dos' || uiStyle === 'bios' ? '0' :
                       uiStyle === 'kawaii' ? '20px' : '8px',
          backgroundColor: getStatusColor(),
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 'bold',
          marginBottom: '16px',
          textTransform: uiStyle === 'brutalism' || uiStyle === 'dos' ? 'uppercase' : 'none'
        }}
      >
        <span style={{ marginRight: '4px' }}>{getStatusIcon()}</span>
        {getStatusText()}
      </div>
      
      {/* 計時器 */}
      {(isDining || isSeated) && table.seatedTime && (
        <div style={{
          marginBottom: '12px',
          padding: '8px',
          backgroundColor: isDining ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          borderRadius: uiStyle === 'brutalism' || uiStyle === 'dos' || uiStyle === 'bios' ? '0' : '6px',
          border: uiStyle === 'brutalism' ? `2px solid ${getStatusColor()}` : 'none'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '4px',
            color: getStatusColor()
          }}>
            ⏰ {isDining ? '用餐時間' : '等待時間'}
          </div>
          <div style={{
            fontSize: '14px',
            color: themeColors.text,
            fontFamily: 'monospace'
          }}>
            {formatDuration(Date.now() - new Date(table.seatedTime).getTime())}
          </div>
        </div>
      )}
      
      {/* 操作按鈕區域 */}
      <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {isAvailable && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onStatusChange(table.id, 'seated')
            }}
            style={{
              flex: 1,
              minWidth: '80px',
              padding: '8px 12px',
              border: 'none',
              borderRadius: uiStyle === 'brutalism' || uiStyle === 'dos' || uiStyle === 'bios' ? '0' :
                           uiStyle === 'kawaii' ? '15px' : '6px',
              backgroundColor: '#f59e0b',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: uiStyle === 'brutalism' ? '2px 2px 0px #000000' :
                        uiStyle === 'neumorphism' ? '4px 4px 8px #bebebe, -4px -4px 8px #ffffff' : 'none'
            }}
          >
            � 入座
          </button>
        )}

        {isSeated && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onStatusChange(table.id, 'dining')
            }}
            style={{
              flex: 1,
              minWidth: '80px',
              padding: '8px 12px',
              border: 'none',
              borderRadius: uiStyle === 'brutalism' || uiStyle === 'dos' || uiStyle === 'bios' ? '0' :
                           uiStyle === 'kawaii' ? '15px' : '6px',
              backgroundColor: '#ef4444',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🔴 用餐
          </button>
        )}
        
        {(isDining || isSeated) && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onStatusChange(table.id, 'cleaning')
            }}
            style={{
              flex: 1,
              minWidth: '80px',
              padding: '8px 12px',
              border: `1px solid ${themeColors.primary}`,
              borderRadius: uiStyle === 'brutalism' || uiStyle === 'dos' || uiStyle === 'bios' ? '0' :
                           uiStyle === 'kawaii' ? '15px' : '6px',
              backgroundColor: 'transparent',
              color: themeColors.primary,
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            ✅ 結帳
          </button>
        )}
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            onStatusChange(table.id, isCleaning ? 'available' : 'cleaning')
          }}
          style={{
            flex: 1,
            minWidth: '80px',
            padding: '8px 12px',
            border: '1px solid #f59e0b',
            borderRadius: uiStyle === 'brutalism' || uiStyle === 'dos' || uiStyle === 'bios' ? '0' :
                         uiStyle === 'kawaii' ? '15px' : '6px',
            backgroundColor: isCleaning ? '#f59e0b' : 'transparent',
            color: isCleaning ? 'white' : '#f59e0b',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          🧽 {isCleaning ? '完成' : '清理'}
        </button>
      </div>
    </div>
  )
}

// 主要桌台管理組件
const ModernTableManagement: React.FC = () => {
  const { tables, updateTableStatus, initializeTables } = useTableStore()
  const { currentStyle } = useUIStyle()
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'available' | 'seated' | 'dining' | 'cleaning' | 'reserved'>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  // 檢測螢幕尺寸
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width <= 768)
      setIsTablet(width > 768 && width <= 1024)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // 初始化桌台數據
  useEffect(() => {
    console.log('🏢 ModernTableManagement: 開始初始化')
    const timer = setTimeout(() => {
      try {
        initializeTables()
        console.log('✅ ModernTableManagement: 初始化完成')
      } catch (error) {
        console.error('❌ ModernTableManagement: 初始化失敗', error)
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])

  // 監聽桌台數據變化
  useEffect(() => {
    console.log('📊 ModernTableManagement: 桌台數據變化', tables.length)
  }, [tables])

  const themeColors = {
    mainBg: currentStyle === 'modern' ? '#ffffff' :
           currentStyle === 'neumorphism' ? '#e0e5ec' :
           currentStyle === 'glassmorphism' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
           currentStyle === 'brutalism' ? '#ffffff' :
           currentStyle === 'cyberpunk' ? '#0a0a0a' :
           currentStyle === 'dos' ? '#000080' :
           currentStyle === 'bios' ? '#000000' :
           currentStyle === 'kawaii' ? '#fff0f5' :
           '#ffffff',
           
    cardBg: currentStyle === 'modern' ? '#f8f9fa' :
           currentStyle === 'neumorphism' ? '#e0e5ec' :
           currentStyle === 'glassmorphism' ? 'rgba(255, 255, 255, 0.1)' :
           currentStyle === 'brutalism' ? '#f8f9fa' :
           currentStyle === 'cyberpunk' ? '#1a1a1a' :
           currentStyle === 'dos' ? '#0000aa' :
           currentStyle === 'bios' ? '#003366' :
           currentStyle === 'kawaii' ? '#ffffff' :
           '#f8f9fa',
           
    primary: currentStyle === 'modern' ? '#007bff' :
            currentStyle === 'neumorphism' ? '#5a67d8' :
            currentStyle === 'glassmorphism' ? '#ffffff' :
            currentStyle === 'brutalism' ? '#000000' :
            currentStyle === 'cyberpunk' ? '#00ffff' :
            currentStyle === 'dos' ? '#ffff00' :
            currentStyle === 'bios' ? '#00aaff' :
            currentStyle === 'kawaii' ? '#ff69b4' :
            '#007bff',
            
    secondary: currentStyle === 'modern' ? '#6c757d' :
              currentStyle === 'neumorphism' ? '#718096' :
              currentStyle === 'glassmorphism' ? 'rgba(255, 255, 255, 0.7)' :
              currentStyle === 'brutalism' ? '#6c757d' :
              currentStyle === 'cyberpunk' ? '#ff00ff' :
              currentStyle === 'dos' ? '#00ffff' :
              currentStyle === 'bios' ? '#666666' :
              currentStyle === 'kawaii' ? '#ffa0c9' :
              '#6c757d',
              
    text: currentStyle === 'modern' ? '#333333' :
         currentStyle === 'neumorphism' ? '#2d3748' :
         currentStyle === 'glassmorphism' ? '#ffffff' :
         currentStyle === 'brutalism' ? '#000000' :
         currentStyle === 'cyberpunk' ? '#ffffff' :
         currentStyle === 'dos' ? '#ffffff' :
         currentStyle === 'bios' ? '#cccccc' :
         currentStyle === 'kawaii' ? '#333333' :
         '#333333',
         
    border: currentStyle === 'modern' ? '#dee2e6' :
           currentStyle === 'neumorphism' ? '#cbd5e0' :
           currentStyle === 'glassmorphism' ? 'rgba(255, 255, 255, 0.2)' :
           currentStyle === 'brutalism' ? '#000000' :
           currentStyle === 'cyberpunk' ? '#00ffff' :
           currentStyle === 'dos' ? '#ffffff' :
           currentStyle === 'bios' ? '#666666' :
           currentStyle === 'kawaii' ? '#ffb6c1' :
           '#dee2e6'
  }

  // 處理桌位狀態更新
  const handleTableStatusUpdate = async (tableId: string, status: string) => {
    setIsLoading(true)
    try {
      const table = tables.find(t => t.id === tableId)
      if (table) {
        await updateTableStatus(tableId, status as any)
        console.log(`✅ 桌位 ${table.number || table.id} 狀態更新為 ${status}`)
      }
    } catch (error) {
      console.error('更新桌位狀態失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 篩選桌位
  const filteredTables = tables.filter((table: Table) => {
    if (selectedFilter === 'all') return true
    return table.status === selectedFilter
  })

  // 統計數據
  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    seated: tables.filter(t => t.status === 'seated').length,
    dining: tables.filter(t => t.status === 'dining').length,
    cleaning: tables.filter(t => t.status === 'cleaning').length,
    reserved: tables.filter(t => t.status === 'reserved').length
  }

  if (tables.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: themeColors.mainBg,
        flexDirection: 'column'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column'
        }}>
          <LoadingSpinner />
          <span style={{ 
            marginTop: '12px', 
            color: themeColors.text,
            fontSize: '16px'
          }}>
            載入現代化桌台管理系統...
          </span>
          <span style={{ 
            marginTop: '8px', 
            color: themeColors.secondary,
            fontSize: '14px'
          }}>
            正在初始化 24 個桌台
          </span>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: themeColors.mainBg,
      color: themeColors.text,
      padding: isMobile ? '16px' : '24px',
      fontFamily: currentStyle === 'brutalism' ? 'Impact, "Arial Black", sans-serif' :
                 currentStyle === 'dos' || currentStyle === 'bios' ? 'monospace' :
                 currentStyle === 'kawaii' ? '"Comic Sans MS", cursive' : 'inherit'
    }}>
      {/* 標題區域 */}
      <div style={{
        marginBottom: '32px',
        textAlign: isMobile ? 'center' : 'left'
      }}>
        <h1 style={{
          fontSize: isMobile ? '28px' : '36px',
          fontWeight: currentStyle === 'brutalism' || currentStyle === 'dos' ? '900' : 'bold',
          color: themeColors.primary,
          marginBottom: '8px',
          textTransform: currentStyle === 'brutalism' || currentStyle === 'dos' ? 'uppercase' : 'none',
          textShadow: currentStyle === 'cyberpunk' ? '0 0 15px rgba(0, 255, 255, 0.5)' : 'none'
        }}>
          🏢 現代化桌台管理系統
        </h1>
        
        <div style={{
          fontSize: '14px',
          color: themeColors.secondary,
          marginBottom: '16px'
        }}>
          {tables.length > 0 ? (
            <span>✅ 共 {tables.length} 個桌台 | 最佳視覺效果</span>
          ) : (
            <span>⚠️ 無桌台數據</span>
          )}
        </div>
      </div>

      {/* 統計卡片區域 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 
                           isTablet ? 'repeat(3, 1fr)' : 
                           'repeat(6, 1fr)',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {[
          { label: '總桌台', value: stats.total, color: themeColors.primary, icon: '🏢' },
          { label: '空桌', value: stats.available, color: '#10b981', icon: '✅' },
          { label: '已入座', value: stats.seated, color: '#f59e0b', icon: '�' },
          { label: '用餐中', value: stats.dining, color: '#ef4444', icon: '🔴' },
          { label: '待清理', value: stats.cleaning, color: '#f97316', icon: '🧽' },
          { label: '預約中', value: stats.reserved, color: '#3b82f6', icon: '📅' }
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              padding: isMobile ? '16px' : '20px',
              backgroundColor: themeColors.cardBg,
              borderRadius: currentStyle === 'brutalism' || currentStyle === 'dos' || currentStyle === 'bios' ? '0' :
                             currentStyle === 'kawaii' ? '16px' :
                             currentStyle === 'neumorphism' ? '12px' : '8px',
              border: currentStyle === 'brutalism' ? `3px solid ${themeColors.border}` :
                     currentStyle === 'kawaii' ? `2px solid ${stat.color}` : 'none',
              textAlign: 'center',
              boxShadow: currentStyle === 'brutalism' ? '4px 4px 0px #000000' :
                        currentStyle === 'neumorphism' ? '8px 8px 16px #bebebe, -8px -8px 16px #ffffff' :
                        currentStyle === 'glassmorphism' ? '0 4px 16px rgba(31, 38, 135, 0.2)' :
                        '0 2px 8px rgba(0, 0, 0, 0.1)',
              backdropFilter: currentStyle === 'glassmorphism' ? 'blur(4px)' : 'none'
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{stat.icon}</div>
            <div style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: 'bold',
              color: stat.color,
              marginBottom: '4px'
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: '12px',
              color: themeColors.secondary,
              fontWeight: currentStyle === 'brutalism' || currentStyle === 'dos' ? '700' : 'normal'
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* 篩選按鈕區域 */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '32px',
        justifyContent: isMobile ? 'center' : 'flex-start'
      }}>
        {[
          { key: 'all', label: '全部', count: stats.total },
          { key: 'available', label: '空桌', count: stats.available },
          { key: 'seated', label: '已入座', count: stats.seated },
          { key: 'dining', label: '用餐中', count: stats.dining },
          { key: 'cleaning', label: '待清理', count: stats.cleaning },
          { key: 'reserved', label: '預約中', count: stats.reserved }
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setSelectedFilter(filter.key as any)}
            style={{
              padding: isMobile ? '10px 16px' : '12px 20px',
              border: selectedFilter === filter.key ? 'none' : `2px solid ${themeColors.border}`,
              borderRadius: currentStyle === 'brutalism' || currentStyle === 'dos' || currentStyle === 'bios' ? '0' :
                           currentStyle === 'kawaii' ? '20px' : '8px',
              backgroundColor: selectedFilter === filter.key ? themeColors.primary : themeColors.cardBg,
              color: selectedFilter === filter.key ? 
                     (currentStyle === 'brutalism' ? '#000000' : 'white') : 
                     themeColors.text,
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textTransform: currentStyle === 'brutalism' || currentStyle === 'dos' ? 'uppercase' : 'none',
              boxShadow: selectedFilter === filter.key && currentStyle === 'brutalism' ? '3px 3px 0px #000000' :
                        selectedFilter === filter.key && currentStyle === 'neumorphism' ? '6px 6px 12px #bebebe, -6px -6px 12px #ffffff' : 'none'
            }}
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>

      {/* 桌台網格區域 */}
      {filteredTables.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 
                             isTablet ? 'repeat(2, 1fr)' : 
                             'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {filteredTables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onStatusChange={handleTableStatusUpdate}
              themeColors={themeColors}
              uiStyle={currentStyle}
              isMobile={isMobile}
            />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: themeColors.secondary
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🪑</div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '8px',
            color: themeColors.text
          }}>
            沒有找到桌台
          </h3>
          <p style={{ fontSize: '14px' }}>
            {selectedFilter === 'all' ? '系統中沒有任何桌台數據' : `沒有符合 "${selectedFilter}" 條件的桌台`}
          </p>
        </div>
      )}
    </div>
  )
}

// 時間格式化輔助函數
function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}小時 ${minutes % 60}分鐘`
  } else if (minutes > 0) {
    return `${minutes}分鐘 ${seconds % 60}秒`
  } else {
    return `${seconds}秒`
  }
}

export default ModernTableManagement

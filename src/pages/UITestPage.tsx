import React from 'react'
import { UIStyleControls } from '../components/UIStyleControls'
import { useUIStyle } from '../contexts/UIStyleProvider'

export const UITestPage: React.FC = () => {
  const { config, currentStyle, styleConfig } = useUIStyle()

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'hsl(var(--color-background))',
      color: 'hsl(var(--color-foreground))',
      padding: 'var(--spacing-xl)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-2xl)'
      }}>
        {/* 標題 */}
        <div style={{
          textAlign: 'center',
          borderBottom: `2px solid hsl(var(--color-border))`,
          paddingBottom: 'var(--spacing-lg)'
        }}>
          <h1 style={{
            fontSize: 'var(--font-size-4xl)',
            fontWeight: '700',
            marginBottom: 'var(--spacing-sm)',
            color: 'hsl(var(--pos-primary))'
          }}>TanaPOS V5 UI 風格系統</h1>
          <p style={{
            fontSize: 'var(--font-size-lg)',
            color: 'hsl(var(--color-muted-foreground))'
          }}>
            當前風格：{styleConfig.icon} {styleConfig.displayName}
          </p>
          <p style={{
            fontSize: 'var(--font-size-base)',
            color: 'hsl(var(--color-muted-foreground))',
            marginTop: 'var(--spacing-sm)'
          }}>
            {styleConfig.description}
          </p>
        </div>

        {/* 控制面板 */}
        <div style={{
          backgroundColor: 'hsl(var(--color-card))',
          padding: 'var(--spacing-xl)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid hsl(var(--color-border))',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <h2 style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: '600',
            marginBottom: 'var(--spacing-lg)',
            color: 'hsl(var(--color-foreground))'
          }}>主題控制</h2>
          <UIStyleControls />
        </div>

        {/* 配置狀態 */}
        <div style={{
          backgroundColor: 'hsl(var(--color-card))',
          padding: 'var(--spacing-xl)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid hsl(var(--color-border))',
          boxShadow: 'var(--shadow-md)'
        }}>
          <h3 style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: '600',
            marginBottom: 'var(--spacing-lg)'
          }}>當前配置</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--spacing-lg)',
            fontSize: 'var(--font-size-sm)'
          }}>
            <div>
              <strong>主題：</strong>
              <span style={{ 
                marginLeft: 'var(--spacing-sm)',
                padding: 'var(--spacing-xs) var(--spacing-sm)',
                backgroundColor: 'hsl(var(--pos-primary))',
                color: 'hsl(var(--pos-primary-foreground))',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-xs)'
              }}>
                {config.theme}
              </span>
            </div>
            <div>
              <strong>字體大小：</strong>
              <span style={{ 
                marginLeft: 'var(--spacing-sm)',
                color: 'hsl(var(--color-foreground))'
              }}>
                {config.fontSize}
              </span>
            </div>
            <div>
              <strong>動畫：</strong>
              <span style={{ 
                marginLeft: 'var(--spacing-sm)',
                color: config.animations ? 'hsl(var(--color-success))' : 'hsl(var(--color-destructive))'
              }}>
                {config.animations ? '啟用' : '停用'}
              </span>
            </div>
            <div>
              <strong>圓角：</strong>
              <span style={{ 
                marginLeft: 'var(--spacing-sm)',
                color: 'hsl(var(--color-foreground))'
              }}>
                {config.borderRadius}
              </span>
            </div>
            <div>
              <strong>高對比：</strong>
              <span style={{ 
                marginLeft: 'var(--spacing-sm)',
                color: config.highContrast ? 'hsl(var(--color-success))' : 'hsl(var(--color-destructive))'
              }}>
                {config.highContrast ? '啟用' : '停用'}
              </span>
            </div>
          </div>
        </div>

        {/* 色彩系統展示 */}
        <div style={{
          backgroundColor: 'hsl(var(--color-card))',
          padding: 'var(--spacing-xl)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid hsl(var(--color-border))',
          boxShadow: 'var(--shadow-md)'
        }}>
          <h3 style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: '600',
            marginBottom: 'var(--spacing-lg)'
          }}>色彩調色板</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 'var(--spacing-lg)'
          }}>
            {[
              { name: 'Primary', bg: 'var(--pos-primary)', fg: 'var(--pos-primary-foreground)' },
              { name: 'Secondary', bg: 'var(--pos-secondary)', fg: 'var(--pos-secondary-foreground)' },
              { name: 'Success', bg: 'var(--color-success)', fg: 'var(--color-success-foreground)' },
              { name: 'Warning', bg: 'var(--color-warning)', fg: 'var(--color-warning-foreground)' },
              { name: 'Destructive', bg: 'var(--color-destructive)', fg: 'var(--color-destructive-foreground)' },
              { name: 'Muted', bg: 'var(--color-muted)', fg: 'var(--color-muted-foreground)' },
              { name: 'Accent', bg: 'var(--color-accent)', fg: 'var(--color-accent-foreground)' },
              { name: 'Card', bg: 'var(--color-card)', fg: 'var(--color-card-foreground)' }
            ].map((color) => (
              <div key={color.name} style={{
                padding: 'var(--spacing-lg)',
                backgroundColor: `hsl(${color.bg})`,
                color: `hsl(${color.fg})`,
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                fontSize: 'var(--font-size-sm)',
                fontWeight: '500',
                border: '1px solid hsl(var(--color-border))',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {color.name}
              </div>
            ))}
          </div>
        </div>

        {/* 按鈕展示 */}
        <div style={{
          backgroundColor: 'hsl(var(--color-card))',
          padding: 'var(--spacing-xl)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid hsl(var(--color-border))',
          boxShadow: 'var(--shadow-md)',
          transition: 'box-shadow var(--animation-duration-normal)'
        }}
        onMouseEnter={(e) => {
          if (config.animations) {
            e.currentTarget.style.boxShadow = 'var(--card-hover-shadow, var(--shadow-lg))'
          }
        }}
        onMouseLeave={(e) => {
          if (config.animations) {
            e.currentTarget.style.boxShadow = 'var(--shadow-md)'
          }
        }}>
          <h3 style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: '600',
            marginBottom: 'var(--spacing-lg)'
          }}>按鈕樣式展示</h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-lg)'
          }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--spacing-md)'
            }}>
              <button style={{
                padding: 'var(--spacing-md) var(--spacing-xl)',
                background: 'var(--button-gradient-primary, hsl(var(--pos-primary)))',
                color: 'hsl(var(--pos-primary-foreground))',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all var(--animation-duration-normal)',
                fontWeight: '500',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                if (config.animations) {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)'
                }
              }}
              onMouseLeave={(e) => {
                if (config.animations) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
                }
              }}>
                主要按鈕
              </button>
              <button style={{
                padding: 'var(--spacing-md) var(--spacing-xl)',
                background: 'var(--button-gradient-secondary, hsl(var(--pos-secondary)))',
                color: 'hsl(var(--pos-secondary-foreground))',
                borderRadius: 'var(--radius-md)',
                border: '1px solid hsl(var(--color-border))',
                cursor: 'pointer',
                transition: 'all var(--animation-duration-normal)',
                fontWeight: '500',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                if (config.animations) {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.backgroundColor = 'hsl(var(--color-muted))'
                }
              }}
              onMouseLeave={(e) => {
                if (config.animations) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.backgroundColor = 'hsl(var(--pos-secondary))'
                }
              }}>
                次要按鈕
              </button>
              <button style={{
                padding: 'var(--spacing-md) var(--spacing-xl)',
                background: 'none',
                color: 'hsl(var(--color-destructive))',
                borderRadius: 'var(--radius-md)',
                border: '1px solid hsl(var(--color-destructive))',
                cursor: 'pointer',
                transition: 'all var(--animation-duration-normal)',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                if (config.animations) {
                  e.currentTarget.style.backgroundColor = 'hsl(var(--color-destructive))'
                  e.currentTarget.style.color = 'hsl(var(--color-destructive-foreground))'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }
              }}
              onMouseLeave={(e) => {
                if (config.animations) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'hsl(var(--color-destructive))'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}>
                刪除按鈕
              </button>
              <button style={{
                padding: 'var(--spacing-sm)',
                background: 'hsl(var(--color-accent))',
                color: 'hsl(var(--color-accent-foreground))',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all var(--animation-duration-normal)',
                fontSize: 'var(--font-size-sm)',
                minWidth: '2.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (config.animations) {
                  e.currentTarget.style.transform = 'scale(1.05)'
                }
              }}
              onMouseLeave={(e) => {
                if (config.animations) {
                  e.currentTarget.style.transform = 'scale(1)'
                }
              }}>
                +
              </button>
            </div>
            
            {/* POS 專用按鈕 */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--spacing-md)',
              paddingTop: 'var(--spacing-lg)',
              borderTop: '1px solid hsl(var(--color-border))'
            }}>
              <h4 style={{
                width: '100%',
                fontSize: 'var(--font-size-base)',
                fontWeight: '600',
                marginBottom: 'var(--spacing-sm)',
                color: 'hsl(var(--color-muted-foreground))'
              }}>POS 專用按鈕</h4>
              <button style={{
                padding: 'var(--spacing-lg) var(--spacing-2xl)',
                background: 'linear-gradient(135deg, hsl(var(--pos-primary)), hsl(var(--color-success)))',
                color: 'white',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all var(--animation-duration-normal)',
                fontWeight: '600',
                fontSize: 'var(--font-size-lg)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
              onMouseEnter={(e) => {
                if (config.animations) {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)'
                }
              }}
              onMouseLeave={(e) => {
                if (config.animations) {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
                }
              }}>
                結帳
              </button>
              <button style={{
                padding: 'var(--spacing-md) var(--spacing-xl)',
                background: 'hsl(var(--color-warning))',
                color: 'hsl(var(--color-warning-foreground))',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all var(--animation-duration-normal)',
                fontWeight: '500',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                if (config.animations) {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.filter = 'brightness(1.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (config.animations) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.filter = 'brightness(1)'
                }
              }}>
                暫停交易
              </button>
              <button style={{
                padding: 'var(--spacing-md) var(--spacing-xl)',
                background: 'hsl(var(--color-destructive))',
                color: 'hsl(var(--color-destructive-foreground))',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all var(--animation-duration-normal)',
                fontWeight: '500',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                if (config.animations) {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.filter = 'brightness(1.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (config.animations) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.filter = 'brightness(1)'
                }
              }}>
                取消交易
              </button>
            </div>
          </div>
        </div>

        {/* 表單元素展示 */}
        <div style={{
          backgroundColor: 'hsl(var(--color-card))',
          padding: 'var(--spacing-xl)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid hsl(var(--color-border))',
          boxShadow: 'var(--shadow-md)'
        }}>
          <h3 style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: '600',
            marginBottom: 'var(--spacing-lg)'
          }}>表單元素</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--spacing-xl)'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: 'var(--spacing-sm)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: '500',
                color: 'hsl(var(--color-foreground))'
              }}>
                商品名稱
              </label>
              <input
                type="text"
                placeholder="請輸入商品名稱"
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid hsl(var(--color-border))',
                  backgroundColor: 'hsl(var(--color-background))',
                  color: 'hsl(var(--color-foreground))',
                  fontSize: 'var(--font-size-base)',
                  transition: 'border-color var(--animation-duration-normal), box-shadow var(--animation-duration-normal)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'hsl(var(--pos-primary))'
                  e.currentTarget.style.boxShadow = '0 0 0 2px hsla(var(--pos-primary), 0.2)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'hsl(var(--color-border))'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: 'var(--spacing-sm)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: '500',
                color: 'hsl(var(--color-foreground))'
              }}>
                商品分類
              </label>
              <select style={{
                width: '100%',
                padding: 'var(--spacing-md)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid hsl(var(--color-border))',
                backgroundColor: 'hsl(var(--color-background))',
                color: 'hsl(var(--color-foreground))',
                fontSize: 'var(--font-size-base)'
              }}>
                <option>請選擇分類</option>
                <option>食品</option>
                <option>飲料</option>
                <option>日用品</option>
              </select>
            </div>
          </div>
        </div>

        {/* 卡片和陰影效果 */}
        <div style={{
          backgroundColor: 'hsl(var(--color-card))',
          padding: 'var(--spacing-xl)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid hsl(var(--color-border))',
          boxShadow: 'var(--shadow-md)'
        }}>
          <h3 style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: '600',
            marginBottom: 'var(--spacing-lg)'
          }}>卡片樣式與陰影</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--spacing-lg)'
          }}>
            {[
              { name: '基本卡片', shadow: 'var(--shadow-sm)' },
              { name: '中等陰影', shadow: 'var(--shadow-md)' },
              { name: '大陰影', shadow: 'var(--shadow-lg)' },
              { name: '特大陰影', shadow: 'var(--shadow-xl)' }
            ].map((card) => (
              <div
                key={card.name}
                style={{
                  padding: 'var(--spacing-xl)',
                  backgroundColor: 'hsl(var(--color-background))',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid hsl(var(--color-border))',
                  boxShadow: card.shadow,
                  transition: 'transform var(--animation-duration-normal), box-shadow var(--animation-duration-normal)'
                }}
                onMouseEnter={(e) => {
                  if (config.animations) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-xl)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (config.animations) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = card.shadow
                  }
                }}
              >
                <h4 style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: '600',
                  marginBottom: 'var(--spacing-sm)'
                }}>
                  {card.name}
                </h4>
                <p style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'hsl(var(--color-muted-foreground))',
                  lineHeight: '1.5'
                }}>
                  這是一個展示不同陰影效果的卡片元件，展現了設計系統的視覺層次。
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 頁尾 */}
        <div style={{
          textAlign: 'center',
          padding: 'var(--spacing-2xl)',
          borderTop: '1px solid hsl(var(--color-border))',
          color: 'hsl(var(--color-muted-foreground))',
          fontSize: 'var(--font-size-sm)'
        }}>
          <p>TanaPOS V5 UI 風格系統 - 使用純 CSS 變數實現</p>
          <p style={{ marginTop: 'var(--spacing-sm)' }}>
            支援深色/淺色/高對比主題，響應式設計，完整的無障礙支援
          </p>
        </div>
      </div>
    </div>
  )
}

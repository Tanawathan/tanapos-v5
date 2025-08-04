import React from 'react'
import { useUIStyle, StyleSwitcher } from '../contexts/UIStyleProvider'

export const UIStyleControls: React.FC = () => {
  const { 
    config, 
    updateConfig, 
    toggleTheme, 
    resetToDefaults,
    currentStyle,
    styleConfig 
  } = useUIStyle()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      fontFamily: 'inherit'
    }}>
      {/* 風格選擇器 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <h4 style={{
          fontSize: 'var(--font-size-base)',
          fontWeight: '600',
          margin: '0',
          color: 'hsl(var(--color-foreground))'
        }}>
          🎨 UI 風格
        </h4>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <StyleSwitcher />
          <div style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'hsl(var(--color-muted))',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            color: 'hsl(var(--color-muted-foreground))'
          }}>
            {styleConfig.icon} {styleConfig.description}
          </div>
        </div>
      </div>

      {/* 傳統主題控制 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <h4 style={{
          fontSize: 'var(--font-size-base)',
          fontWeight: '600',
          margin: '0',
          color: 'hsl(var(--color-foreground))'
        }}>
          🌓 色彩主題
        </h4>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          {(['light', 'dark', 'high-contrast'] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => updateConfig({ theme })}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: config.theme === theme 
                  ? 'hsl(var(--pos-primary))' 
                  : 'hsl(var(--color-secondary))',
                color: config.theme === theme 
                  ? 'hsl(var(--pos-primary-foreground))' 
                  : 'hsl(var(--color-secondary-foreground))',
                border: '1px solid hsl(var(--color-border))',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                fontWeight: '500',
                transition: 'all var(--animation-duration-normal)',
                fontFamily: 'inherit'
              }}
            >
              {theme === 'light' && '☀️ 淺色'}
              {theme === 'dark' && '🌙 深色'}
              {theme === 'high-contrast' && '🔆 高對比'}
            </button>
          ))}
        </div>
      </div>

      {/* 字體大小控制 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <h4 style={{
          fontSize: 'var(--font-size-base)',
          fontWeight: '600',
          margin: '0',
          color: 'hsl(var(--color-foreground))'
        }}>
          📝 字體大小
        </h4>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          {(['small', 'normal', 'large'] as const).map((size) => (
            <button
              key={size}
              onClick={() => updateConfig({ fontSize: size })}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: config.fontSize === size 
                  ? 'hsl(var(--pos-primary))' 
                  : 'hsl(var(--color-secondary))',
                color: config.fontSize === size 
                  ? 'hsl(var(--pos-primary-foreground))' 
                  : 'hsl(var(--color-secondary-foreground))',
                border: '1px solid hsl(var(--color-border))',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                fontWeight: '500',
                transition: 'all var(--animation-duration-normal)',
                fontFamily: 'inherit'
              }}
            >
              {size === 'small' && '🔍 小'}
              {size === 'normal' && '📏 標準'}
              {size === 'large' && '🔎 大'}
            </button>
          ))}
        </div>
      </div>

      {/* 圓角控制 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <h4 style={{
          fontSize: 'var(--font-size-base)',
          fontWeight: '600',
          margin: '0',
          color: 'hsl(var(--color-foreground))'
        }}>
          📐 圓角樣式
        </h4>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          {(['none', 'small', 'normal', 'large'] as const).map((radius) => (
            <button
              key={radius}
              onClick={() => updateConfig({ borderRadius: radius })}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: config.borderRadius === radius 
                  ? 'hsl(var(--pos-primary))' 
                  : 'hsl(var(--color-secondary))',
                color: config.borderRadius === radius 
                  ? 'hsl(var(--pos-primary-foreground))' 
                  : 'hsl(var(--color-secondary-foreground))',
                border: '1px solid hsl(var(--color-border))',
                borderRadius: radius === 'none' ? '0' : 
                             radius === 'small' ? '0.25rem' :
                             radius === 'normal' ? '0.5rem' : '1rem',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                fontWeight: '500',
                transition: 'all var(--animation-duration-normal)',
                fontFamily: 'inherit'
              }}
            >
              {radius === 'none' && '⬜ 無'}
              {radius === 'small' && '▫️ 小'}
              {radius === 'normal' && '🔳 標準'}
              {radius === 'large' && '🔴 大'}
            </button>
          ))}
        </div>
      </div>

      {/* 開關控制 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h4 style={{
          fontSize: 'var(--font-size-base)',
          fontWeight: '600',
          margin: '0',
          color: 'hsl(var(--color-foreground))'
        }}>
          ⚙️ 功能設定
        </h4>
        
        {/* 動畫開關 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{
            fontSize: 'var(--font-size-sm)',
            color: 'hsl(var(--color-foreground))'
          }}>
            ✨ 動畫效果
          </span>
          <button
            onClick={() => updateConfig({ animations: !config.animations })}
            style={{
              position: 'relative',
              display: 'inline-flex',
              height: '1.5rem',
              width: '2.75rem',
              alignItems: 'center',
              borderRadius: '9999px',
              backgroundColor: config.animations 
                ? 'hsl(var(--pos-primary))' 
                : 'hsl(var(--color-muted))',
              transition: 'background-color var(--animation-duration-normal)',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            <span style={{
              display: 'inline-block',
              height: '1rem',
              width: '1rem',
              borderRadius: '50%',
              backgroundColor: 'white',
              marginLeft: config.animations ? '0.75rem' : '0.25rem',
              transition: 'margin-left var(--animation-duration-normal)'
            }} />
          </button>
        </div>

        {/* 高對比開關 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{
            fontSize: 'var(--font-size-sm)',
            color: 'hsl(var(--color-foreground))'
          }}>
            🔆 高對比模式
          </span>
          <button
            onClick={() => updateConfig({ highContrast: !config.highContrast })}
            style={{
              position: 'relative',
              display: 'inline-flex',
              height: '1.5rem',
              width: '2.75rem',
              alignItems: 'center',
              borderRadius: '9999px',
              backgroundColor: config.highContrast 
                ? 'hsl(var(--pos-primary))' 
                : 'hsl(var(--color-muted))',
              transition: 'background-color var(--animation-duration-normal)',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            <span style={{
              display: 'inline-block',
              height: '1rem',
              width: '1rem',
              borderRadius: '50%',
              backgroundColor: 'white',
              marginLeft: config.highContrast ? '0.75rem' : '0.25rem',
              transition: 'margin-left var(--animation-duration-normal)'
            }} />
          </button>
        </div>
      </div>

      {/* 快速操作 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <h4 style={{
          fontSize: 'var(--font-size-base)',
          fontWeight: '600',
          margin: '0',
          color: 'hsl(var(--color-foreground))'
        }}>
          🚀 快速操作
        </h4>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={toggleTheme}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'hsl(var(--color-accent))',
              color: 'hsl(var(--color-accent-foreground))',
              border: '1px solid hsl(var(--color-border))',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
              fontWeight: '500',
              transition: 'all var(--animation-duration-normal)',
              fontFamily: 'inherit'
            }}
          >
            🔄 切換主題
          </button>
          <button
            onClick={resetToDefaults}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'hsl(var(--color-destructive))',
              color: 'hsl(var(--color-destructive-foreground))',
              border: '1px solid hsl(var(--color-border))',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
              fontWeight: '500',
              transition: 'all var(--animation-duration-normal)',
              fontFamily: 'inherit'
            }}
          >
            🔧 重置設定
          </button>
        </div>
      </div>
    </div>
  )
}

// 🛠️ 統一的樣式工具函數
import React from 'react'

export interface ThemeColors {
  primary: string
  secondary: string
  success: string
  warning: string
  danger: string
  bg: string
  cardBg: string
  text: string
  subText: string
  border: string
  shadow: string
  hover: string
}

export interface StyleVariants {
  primary: string
  secondary: string
  success: string
  warning: string
  danger: string
}

// 生成按鈕樣式的通用函數
export const generateButtonStyles = (
  variant: keyof StyleVariants,
  size: 'sm' | 'md' | 'lg',
  themeColors: ThemeColors,
  currentStyle: string
): React.CSSProperties => {
  // 尺寸系統
  const sizeStyles = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
    lg: { padding: '1rem 2rem', fontSize: '1.125rem' }
  }

  // 顏色系統
  const variantStyles: StyleVariants = {
    primary: themeColors.primary,
    secondary: themeColors.secondary,
    success: themeColors.success,
    warning: themeColors.warning,
    danger: themeColors.danger
  }

  // 基礎樣式
  const baseStyles: React.CSSProperties = {
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease',
    background: variantStyles[variant],
    color: variant === 'secondary' ? themeColors.text : '#ffffff',
    ...sizeStyles[size]
  }

  // 主題特殊樣式
  const themeSpecificStyles: Record<string, Partial<React.CSSProperties>> = {
    brutalism: {
      borderRadius: '0',
      border: `3px solid ${themeColors.text}`,
      boxShadow: `4px 4px 0px ${themeColors.text}`
    },
    kawaii: {
      borderRadius: '20px',
      border: `2px solid ${variantStyles[variant]}`,
      boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
    },
    neumorphism: {
      borderRadius: '12px',
      boxShadow: `8px 8px 16px ${themeColors.shadow}, -8px -8px 16px #ffffff`,
      border: 'none'
    },
    glassmorphism: {
      borderRadius: '12px',
      background: `${variantStyles[variant]}88`,
      backdropFilter: 'blur(10px)',
      border: `1px solid ${variantStyles[variant]}33`
    },
    cyberpunk: {
      borderRadius: '4px',
      border: `2px solid ${themeColors.primary}`,
      boxShadow: `0 0 10px ${themeColors.primary}33`,
      textTransform: 'uppercase'
    },
    code: {
      borderRadius: '6px',
      fontFamily: 'Fira Code, monospace',
      border: `1px solid ${themeColors.border}`,
      background: themeColors.cardBg
    }
  }

  return {
    ...baseStyles,
    ...(themeSpecificStyles[currentStyle] || { borderRadius: '8px' })
  }
}

// 生成卡片樣式的通用函數
export const generateCardStyles = (
  themeColors: ThemeColors,
  currentStyle: string
): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    background: themeColors.cardBg,
    color: themeColors.text,
    padding: '1rem',
    marginBottom: '1rem'
  }

  const themeSpecificStyles: Record<string, Partial<React.CSSProperties>> = {
    brutalism: {
      border: `3px solid ${themeColors.text}`,
      borderRadius: '0',
      boxShadow: `6px 6px 0px ${themeColors.text}`
    },
    kawaii: {
      borderRadius: '20px',
      border: `2px solid ${themeColors.border}`,
      boxShadow: '0 8px 24px rgba(236, 72, 153, 0.15)'
    },
    neumorphism: {
      borderRadius: '16px',
      boxShadow: `12px 12px 24px ${themeColors.shadow}, -12px -12px 24px #ffffff`,
      border: 'none'
    },
    glassmorphism: {
      borderRadius: '16px',
      background: `${themeColors.cardBg}aa`,
      backdropFilter: 'blur(12px)',
      border: `1px solid ${themeColors.border}44`
    }
  }

  return {
    ...baseStyles,
    ...(themeSpecificStyles[currentStyle] || {
      borderRadius: '12px',
      border: `1px solid ${themeColors.border}`,
      boxShadow: themeColors.shadow
    })
  }
}

// 購物車項目樣式生成器
export const generateCartItemStyles = (
  themeColors: ThemeColors,
  currentStyle: string
): React.CSSProperties => {
  return {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: themeColors.cardBg,
    border: currentStyle === 'brutalism' ? `2px solid ${themeColors.text}` : 
            currentStyle === 'kawaii' ? `2px solid ${themeColors.border}` : 'none',
    borderRadius: currentStyle === 'brutalism' ? '0' :
                  currentStyle === 'kawaii' ? '15px' :
                  currentStyle === 'neumorphism' ? '12px' : '8px',
    marginBottom: '0.5rem',
    boxShadow: currentStyle === 'neumorphism' ? `4px 4px 8px ${themeColors.shadow}` :
               currentStyle === 'glassmorphism' ? '0 4px 12px rgba(0,0,0,0.1)' :
               currentStyle === 'brutalism' ? `3px 3px 0px ${themeColors.text}` : 'none'
  }
}

// 響應式類型定義
export interface ResponsiveConfig {
  mobile: {
    gridColumns: number
    cardHeight: string
    fontSize: {
      title: string
      cardTitle: string
      price: string
    }
  }
  tablet: {
    gridColumns: number
    cardHeight: string
    fontSize: {
      title: string
      cardTitle: string
      price: string
    }
  }
  desktop: {
    gridColumns: number
    cardHeight: string
    fontSize: {
      title: string
      cardTitle: string
      price: string
    }
  }
}

// 預設響應式配置
export const defaultResponsiveConfig: ResponsiveConfig = {
  mobile: {
    gridColumns: 2,
    cardHeight: '120px',
    fontSize: {
      title: '1.5rem',
      cardTitle: '0.875rem',
      price: '1rem'
    }
  },
  tablet: {
    gridColumns: 3,
    cardHeight: '140px',
    fontSize: {
      title: '1.75rem',
      cardTitle: '1rem',
      price: '1.125rem'
    }
  },
  desktop: {
    gridColumns: 4,
    cardHeight: '160px',
    fontSize: {
      title: '2rem',
      cardTitle: '1rem',
      price: '1.25rem'
    }
  }
}

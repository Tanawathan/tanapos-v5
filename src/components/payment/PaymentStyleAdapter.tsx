import React from 'react'
import { useUIStyle } from '../../contexts/UIStyleContext'

// 支付系統樣式適配 Hook
export const usePaymentStyles = () => {
  const { currentStyle } = useUIStyle()

  // 根據當前風格獲取顏色主題
  const getThemeColors = () => {
    switch (currentStyle) {
      case 'modern':
        return {
          primary: '#007bff',
          secondary: '#6c757d',
          success: '#28a745',
          warning: '#ffc107',
          danger: '#dc3545',
          bg: '#ffffff',
          cardBg: '#f8f9fa',
          text: '#212529',
          subText: '#6c757d',
          border: '#dee2e6',
          shadow: 'rgba(0, 0, 0, 0.1)',
          hover: '#0056b3'
        }
      case 'neumorphism':
        return {
          primary: '#5a67d8',
          secondary: '#718096',
          success: '#38a169',
          warning: '#ed8936',
          danger: '#e53e3e',
          bg: '#f0f0f3',
          cardBg: '#f0f0f3',
          text: '#2d3748',
          subText: '#718096',
          border: '#cbd5e0',
          shadow: '#bebebe',
          hover: '#4c51bf'
        }
      case 'glassmorphism':
        return {
          primary: 'rgba(255, 255, 255, 0.9)',
          secondary: 'rgba(255, 255, 255, 0.7)',
          success: 'rgba(72, 187, 120, 0.9)',
          warning: 'rgba(237, 137, 54, 0.9)',
          danger: 'rgba(245, 101, 101, 0.9)',
          bg: 'rgba(255, 255, 255, 0.1)',
          cardBg: 'rgba(255, 255, 255, 0.15)',
          text: '#ffffff',
          subText: 'rgba(255, 255, 255, 0.8)',
          border: 'rgba(255, 255, 255, 0.3)',
          shadow: 'rgba(0, 0, 0, 0.1)',
          hover: 'rgba(255, 255, 255, 0.95)'
        }
      case 'brutalism':
        return {
          primary: '#ff0080',
          secondary: '#00ffff',
          success: '#00ff00',
          warning: '#ffff00',
          danger: '#ff0000',
          bg: '#000000',
          cardBg: '#000000',
          text: '#ffffff',
          subText: '#cccccc',
          border: '#ffffff',
          shadow: 'rgba(255, 255, 255, 0.2)',
          hover: '#ff4da6'
        }
      case 'cyberpunk':
        return {
          primary: '#00ffff',
          secondary: '#ff0080',
          success: '#00ff41',
          warning: '#ffff00',
          danger: '#ff073a',
          bg: '#0a0a0a',
          cardBg: '#1a1a1a',
          text: '#00ffff',
          subText: '#00cccc',
          border: '#00ffff',
          shadow: 'rgba(0, 255, 255, 0.3)',
          hover: '#00cccc'
        }
      case 'kawaii':
        return {
          primary: '#ff69b4',
          secondary: '#ffa0c9',
          success: '#98fb98',
          warning: '#ffd700',
          danger: '#ff6b6b',
          bg: '#fff0f5',
          cardBg: '#ffffff',
          text: '#ff1493',
          subText: '#db7093',
          border: '#ffb6c1',
          shadow: 'rgba(255, 105, 180, 0.3)',
          hover: '#ff1493'
        }
      case 'dos':
        return {
          primary: '#ffff00',
          secondary: '#00ffff',
          success: '#00ff00',
          warning: '#ffff00',
          danger: '#ff0000',
          bg: '#0000aa',
          cardBg: '#000080',
          text: '#ffffff',
          subText: '#c0c0c0',
          border: '#c0c0c0',
          shadow: 'rgba(192, 192, 192, 0.5)',
          hover: '#cccc00'
        }
      case 'bios':
        return {
          primary: '#00aaff',
          secondary: '#008080',
          success: '#00ff00',
          warning: '#ffaa00',
          danger: '#ff0000',
          bg: '#000040',
          cardBg: '#003366',
          text: '#00ffff',
          subText: '#88dddd',
          border: '#008080',
          shadow: 'rgba(0, 255, 255, 0.3)',
          hover: '#0088cc'
        }
      default:
        return {
          primary: '#007bff',
          secondary: '#6c757d',
          success: '#28a745',
          warning: '#ffc107',
          danger: '#dc3545',
          bg: '#ffffff',
          cardBg: '#f8f9fa',
          text: '#212529',
          subText: '#6c757d',
          border: '#dee2e6',
          shadow: 'rgba(0, 0, 0, 0.1)',
          hover: '#0056b3'
        }
    }
  }

  // 獲取按鈕樣式
  const getButtonStyle = (variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' = 'primary') => {
    const colors = getThemeColors()
    const baseStyle = {
      border: 'none',
      borderRadius: currentStyle === 'brutalism' ? '0' :
                   currentStyle === 'kawaii' ? '15px' :
                   currentStyle === 'neumorphism' ? '12px' : '8px',
      padding: '12px 24px',
      fontSize: '14px',
      fontWeight: currentStyle === 'brutalism' || currentStyle === 'dos' ? '900' : '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      minHeight: '44px',
      textTransform: currentStyle === 'brutalism' || currentStyle === 'dos' ? 'uppercase' as const : 'none' as const,
      fontFamily: currentStyle === 'brutalism' ? 'Impact, "Arial Black", sans-serif' :
                 currentStyle === 'dos' || currentStyle === 'bios' ? 'monospace' :
                 currentStyle === 'kawaii' ? '"Comic Sans MS", "Marker Felt", cursive' : 'inherit'
    }

    const variantColors = {
      primary: { bg: colors.primary, text: currentStyle === 'glassmorphism' ? colors.text : '#ffffff' },
      secondary: { bg: colors.secondary, text: currentStyle === 'glassmorphism' ? colors.text : '#ffffff' },
      success: { bg: colors.success, text: '#ffffff' },
      warning: { bg: colors.warning, text: '#000000' },
      danger: { bg: colors.danger, text: '#ffffff' }
    }

    return {
      ...baseStyle,
      background: variantColors[variant].bg,
      color: variantColors[variant].text,
      border: currentStyle === 'brutalism' ? `3px solid ${colors.border}` :
             currentStyle === 'glassmorphism' ? `1px solid ${colors.border}` : 'none',
      boxShadow: currentStyle === 'neumorphism' ? `4px 4px 8px ${colors.shadow}, -2px -2px 4px #ffffff` :
                currentStyle === 'brutalism' ? `4px 4px 0px ${colors.border}` :
                currentStyle === 'glassmorphism' ? `0 4px 16px ${colors.shadow}` :
                currentStyle === 'kawaii' ? `0 4px 8px ${colors.shadow}` : 
                `0 2px 4px ${colors.shadow}`,
      backdropFilter: currentStyle === 'glassmorphism' ? 'blur(10px)' : 'none',
      transform: currentStyle === 'brutalism' ? 'rotate(-1deg)' : 'none'
    }
  }

  // 獲取卡片樣式
  const getCardStyle = () => {
    const colors = getThemeColors()
    return {
      background: colors.cardBg,
      color: colors.text,
      border: currentStyle === 'brutalism' ? `2px solid ${colors.border}` :
             currentStyle === 'glassmorphism' ? `1px solid ${colors.border}` : 
             `1px solid ${colors.border}`,
      borderRadius: currentStyle === 'brutalism' ? '0' :
                   currentStyle === 'kawaii' ? '15px' :
                   currentStyle === 'neumorphism' ? '12px' : '8px',
      padding: '24px',
      margin: '16px 0',
      boxShadow: currentStyle === 'neumorphism' ? `8px 8px 16px ${colors.shadow}, -4px -4px 8px #ffffff` :
                currentStyle === 'brutalism' ? `8px 8px 0px ${colors.border}` :
                currentStyle === 'glassmorphism' ? `0 8px 32px ${colors.shadow}` :
                currentStyle === 'kawaii' ? `0 8px 16px ${colors.shadow}` :
                `0 4px 6px ${colors.shadow}`,
      backdropFilter: currentStyle === 'glassmorphism' ? 'blur(20px)' : 'none',
      transform: currentStyle === 'brutalism' ? 'rotate(-0.5deg)' : 'none'
    }
  }

  // 獲取輸入框樣式
  const getInputStyle = () => {
    const colors = getThemeColors()
    return {
      background: colors.bg,
      color: colors.text,
      border: currentStyle === 'brutalism' ? `2px solid ${colors.border}` :
             currentStyle === 'glassmorphism' ? `1px solid ${colors.border}` :
             `1px solid ${colors.border}`,
      borderRadius: currentStyle === 'brutalism' ? '0' :
                   currentStyle === 'kawaii' ? '15px' :
                   currentStyle === 'neumorphism' ? '12px' : '6px',
      padding: '12px 16px',
      fontSize: '14px',
      minHeight: '44px',
      boxShadow: currentStyle === 'neumorphism' ? `inset 4px 4px 8px ${colors.shadow}, inset -2px -2px 4px #ffffff` :
                currentStyle === 'glassmorphism' ? `0 2px 8px ${colors.shadow}` : 'none',
      backdropFilter: currentStyle === 'glassmorphism' ? 'blur(10px)' : 'none',
      fontFamily: currentStyle === 'dos' || currentStyle === 'bios' ? 'monospace' :
                 currentStyle === 'kawaii' ? '"Comic Sans MS", "Marker Felt", cursive' : 'inherit'
    }
  }

  // 獲取模態框樣式
  const getModalStyle = () => {
    const colors = getThemeColors()
    return {
      overlay: {
        background: currentStyle === 'glassmorphism' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.5)',
        backdropFilter: currentStyle === 'glassmorphism' ? 'blur(5px)' : 'none'
      },
      modal: {
        background: colors.cardBg,
        color: colors.text,
        border: currentStyle === 'brutalism' ? `4px solid ${colors.border}` :
               currentStyle === 'glassmorphism' ? `1px solid ${colors.border}` : 'none',
        borderRadius: currentStyle === 'brutalism' ? '0' :
                     currentStyle === 'kawaii' ? '20px' :
                     currentStyle === 'neumorphism' ? '16px' : '12px',
        boxShadow: currentStyle === 'neumorphism' ? `16px 16px 32px ${colors.shadow}, -8px -8px 16px #ffffff` :
                  currentStyle === 'brutalism' ? `12px 12px 0px ${colors.border}` :
                  currentStyle === 'glassmorphism' ? `0 16px 64px ${colors.shadow}` :
                  currentStyle === 'kawaii' ? `0 16px 32px ${colors.shadow}` :
                  `0 8px 24px ${colors.shadow}`,
        backdropFilter: currentStyle === 'glassmorphism' ? 'blur(20px)' : 'none',
        transform: currentStyle === 'brutalism' ? 'rotate(-1deg)' : 'none',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }
    }
  }

  return {
    colors: getThemeColors(),
    getButtonStyle,
    getCardStyle,
    getInputStyle,
    getModalStyle,
    currentStyle
  }
}

// 支付系統按鈕組件
interface PaymentButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  variant = 'primary',
  onClick,
  disabled = false,
  children,
  className = '',
  style = {}
}) => {
  const { getButtonStyle } = usePaymentStyles()
  const buttonStyle = getButtonStyle(variant)

  return (
    <button
      style={{
        ...buttonStyle,
        ...style,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  )
}

// 支付系統卡片組件
interface PaymentCardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export const PaymentCard: React.FC<PaymentCardProps> = ({
  children,
  className = '',
  style = {}
}) => {
  const { getCardStyle } = usePaymentStyles()
  const cardStyle = getCardStyle()

  return (
    <div
      style={{
        ...cardStyle,
        ...style
      }}
      className={className}
    >
      {children}
    </div>
  )
}

// 支付系統輸入框組件
interface PaymentInputProps {
  type?: string
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
}

export const PaymentInput: React.FC<PaymentInputProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
  style = {}
}) => {
  const { getInputStyle } = usePaymentStyles()
  const inputStyle = getInputStyle()

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        ...inputStyle,
        ...style,
        opacity: disabled ? 0.6 : 1
      }}
      className={className}
    />
  )
}

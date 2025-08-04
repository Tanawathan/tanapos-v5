import React from 'react'
import { CreditCard, Banknote, Smartphone, Gift, Star } from 'lucide-react'
import { PaymentMethod } from '../../types/payment'
import { usePaymentStyles, PaymentCard } from './PaymentStyleAdapter'

interface PaymentMethodsProps {
  enabledMethods: PaymentMethod[]
  onSelect: (method: PaymentMethod) => void
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  enabledMethods,
  onSelect
}) => {
  const { colors, currentStyle } = usePaymentStyles()
  
  const paymentOptions = [
    {
      method: PaymentMethod.CASH,
      name: '現金',
      icon: Banknote,
      description: '現金支付',
      themeColor: colors.success
    },
    {
      method: PaymentMethod.CREDIT_CARD,
      name: '信用卡',
      icon: CreditCard,
      description: 'Visa, MasterCard, JCB',
      themeColor: colors.primary
    },
    {
      method: PaymentMethod.DIGITAL_WALLET,
      name: '電子錢包',
      icon: Smartphone,
      description: 'Apple Pay, Google Pay, Line Pay',
      themeColor: '#8b5cf6'
    },
    {
      method: PaymentMethod.MEMBER_POINTS,
      name: '會員點數',
      icon: Star,
      description: '使用會員點數支付',
      themeColor: colors.warning
    },
    {
      method: PaymentMethod.VOUCHER,
      name: '禮券',
      icon: Gift,
      description: '商品禮券或折價券',
      themeColor: '#ec4899'
    }
  ]

  const availableOptions = paymentOptions.filter(option => 
    enabledMethods.includes(option.method)
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ 
        fontSize: '18px', 
        fontWeight: '500', 
        color: colors.text,
        margin: 0
      }}>
        選擇支付方式
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {availableOptions.map((option) => {
          const Icon = option.icon
          
          return (
            <button
              key={option.method}
              onClick={() => onSelect(option.method)}
              style={{
                width: '100%',
                padding: '20px',
                border: `2px solid ${option.themeColor}20`,
                borderRadius: currentStyle === 'brutalism' ? '0' :
                             currentStyle === 'kawaii' ? '15px' :
                             currentStyle === 'neumorphism' ? '12px' : '8px',
                background: option.themeColor + '10',
                color: colors.text,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'block',
                boxShadow: currentStyle === 'neumorphism' ? `4px 4px 8px ${colors.shadow}, -2px -2px 4px #ffffff` :
                          currentStyle === 'brutalism' ? `4px 4px 0px ${option.themeColor}` :
                          currentStyle === 'glassmorphism' ? `0 4px 16px ${colors.shadow}` :
                          currentStyle === 'kawaii' ? `0 4px 8px ${colors.shadow}` :
                          `0 2px 4px ${colors.shadow}`,
                backdropFilter: currentStyle === 'glassmorphism' ? 'blur(10px)' : 'none',
                transform: currentStyle === 'brutalism' ? 'rotate(-0.5deg)' : 'none',
                fontFamily: currentStyle === 'brutalism' ? 'Impact, "Arial Black", sans-serif' :
                           currentStyle === 'dos' || currentStyle === 'bios' ? 'monospace' :
                           currentStyle === 'kawaii' ? '"Comic Sans MS", "Marker Felt", cursive' : 'inherit'
              }}
              onMouseEnter={(e) => {
                if (currentStyle === 'brutalism') {
                  e.currentTarget.style.transform = 'rotate(0.5deg) scale(1.02)'
                  e.currentTarget.style.boxShadow = `6px 6px 0px ${option.themeColor}`
                } else if (currentStyle === 'neumorphism') {
                  e.currentTarget.style.boxShadow = `6px 6px 12px ${colors.shadow}, -3px -3px 6px #ffffff`
                } else {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = `0 4px 8px ${colors.shadow}`
                }
                e.currentTarget.style.borderColor = option.themeColor + '40'
                e.currentTarget.style.background = option.themeColor + '20'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = currentStyle === 'brutalism' ? 'rotate(-0.5deg)' : 'none'
                e.currentTarget.style.boxShadow = currentStyle === 'neumorphism' ? `4px 4px 8px ${colors.shadow}, -2px -2px 4px #ffffff` :
                                                 currentStyle === 'brutalism' ? `4px 4px 0px ${option.themeColor}` :
                                                 currentStyle === 'glassmorphism' ? `0 4px 16px ${colors.shadow}` :
                                                 currentStyle === 'kawaii' ? `0 4px 8px ${colors.shadow}` :
                                                 `0 2px 4px ${colors.shadow}`
                e.currentTarget.style.borderColor = option.themeColor + '20'
                e.currentTarget.style.background = option.themeColor + '10'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px' 
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: colors.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: option.themeColor,
                  border: `2px solid ${option.themeColor}`,
                  boxShadow: currentStyle === 'neumorphism' ? `2px 2px 4px ${colors.shadow}, -1px -1px 2px #ffffff` : 'none'
                }}>
                  <Icon style={{ width: '24px', height: '24px' }} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: '500', 
                    color: colors.text,
                    marginBottom: '4px',
                    fontSize: currentStyle === 'brutalism' ? '16px' : '15px',
                    textTransform: currentStyle === 'brutalism' ? 'uppercase' : 'none'
                  }}>
                    {option.name}
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: colors.subText,
                    lineHeight: '1.4'
                  }}>
                    {option.description}
                  </div>
                </div>
                
                <div style={{ color: colors.subText }}>
                  <svg 
                    style={{ width: '20px', height: '20px' }} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                </div>
              </div>
            </button>
          )
        })}
      </div>
      
      {availableOptions.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ color: colors.subText }}>
            <CreditCard style={{ width: '48px', height: '48px' }} />
          </div>
          <p style={{ color: colors.subText, margin: 0 }}>
            目前沒有可用的支付方式
          </p>
        </div>
      )}
    </div>
  )
}

export default PaymentMethods

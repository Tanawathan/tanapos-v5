import React, { useState } from 'react'
import { CreditCard, Shield, Loader } from 'lucide-react'
import { usePaymentStyles, PaymentButton, PaymentCard, PaymentInput } from './PaymentStyleAdapter'

interface CardPaymentProps {
  amount: number
  onSubmit: (data: { cardType: string; lastFourDigits: string; authCode?: string }) => void
  isProcessing: boolean
}

const CardPayment: React.FC<CardPaymentProps> = ({
  amount,
  onSubmit,
  isProcessing
}) => {
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const [isCardReaderMode, setIsCardReaderMode] = useState(true)
  const [cardReaderStatus, setCardReaderStatus] = useState<'waiting' | 'reading' | 'processing'>('waiting')

  const { colors, currentStyle } = usePaymentStyles()

  // 格式化卡號（每4位數字加空格）
  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  // 格式化有效期限（MM/YY）
  const formatExpiryDate = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length >= 2) {
      return numbers.substring(0, 2) + '/' + numbers.substring(2, 4)
    }
    return numbers
  }

  // 檢測卡片類型
  const getCardType = (number: string) => {
    const firstDigit = number.charAt(0)
    const firstTwoDigits = number.substring(0, 2)
    
    if (firstDigit === '4') return 'Visa'
    if (firstTwoDigits >= '51' && firstTwoDigits <= '55') return 'MasterCard'
    if (firstTwoDigits === '35') return 'JCB'
    if (firstTwoDigits === '37' || firstTwoDigits === '34') return 'American Express'
    return 'Unknown'
  }

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value)
    if (formatted.length <= 19) {
      setCardNumber(formatted)
    }
  }

  const handleExpiryDateChange = (value: string) => {
    const formatted = formatExpiryDate(value)
    if (formatted.length <= 5) {
      setExpiryDate(formatted)
    }
  }

  const handleCvvChange = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 4) {
      setCvv(numbers)
    }
  }

  // 刷卡機模擬
  const handleCardReaderPayment = async () => {
    setCardReaderStatus('reading')
    
    // 模擬讀卡過程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setCardReaderStatus('processing')
    
    // 模擬處理過程
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 模擬成功
    const mockData = {
      cardType: 'Visa',
      lastFourDigits: '1234',
      authCode: 'AUTH' + Math.random().toString(36).substr(2, 6).toUpperCase()
    }
    
    onSubmit(mockData)
    setCardReaderStatus('waiting')
  }

  // 手動輸入驗證
  const isManualFormValid = () => {
    const cleanCardNumber = cardNumber.replace(/\s/g, '')
    return cleanCardNumber.length >= 13 && 
           expiryDate.length === 5 && 
           cvv.length >= 3 && 
           cardholderName.trim().length > 0
  }

  const handleManualSubmit = () => {
    if (isManualFormValid()) {
      const cleanCardNumber = cardNumber.replace(/\s/g, '')
      onSubmit({
        cardType: getCardType(cleanCardNumber),
        lastFourDigits: cleanCardNumber.slice(-4),
        authCode: 'MANUAL' + Math.random().toString(36).substr(2, 6).toUpperCase()
      })
    }
  }

  const currentCardType = getCardType(cardNumber.replace(/\s/g, ''))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 金額顯示 */}
      <div style={{
        padding: '20px',
        background: colors.primary + '20',
        border: `2px solid ${colors.primary}`,
        borderRadius: currentStyle === 'brutalism' ? '0' :
                     currentStyle === 'kawaii' ? '15px' :
                     currentStyle === 'neumorphism' ? '12px' : '8px',
        backdropFilter: currentStyle === 'glassmorphism' ? 'blur(10px)' : 'none'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          marginBottom: '12px'
        }}>
          <CreditCard style={{ width: '24px', height: '24px', color: colors.primary }} />
          <span style={{ fontWeight: '500', color: colors.primary }}>信用卡支付</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: colors.subText, marginBottom: '4px' }}>
            支付金額
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: colors.text }}>
            ${amount}
          </div>
        </div>
      </div>

      {/* 支付方式選擇 */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <PaymentButton
          variant={isCardReaderMode ? 'primary' : 'secondary'}
          onClick={() => setIsCardReaderMode(true)}
          style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px 12px',
            gap: '8px'
          }}
        >
          <CreditCard style={{ width: '24px', height: '24px' }} />
          <div style={{ fontWeight: '500' }}>刷卡機</div>
        </PaymentButton>
        <PaymentButton
          variant={!isCardReaderMode ? 'primary' : 'secondary'}
          onClick={() => setIsCardReaderMode(false)}
          style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px 12px',
            gap: '8px'
          }}
        >
          <Shield style={{ width: '24px', height: '24px' }} />
          <div style={{ fontWeight: '500' }}>手動輸入</div>
        </PaymentButton>
      </div>

      {/* 刷卡機模式 */}
      {isCardReaderMode && (
        <PaymentCard style={{ textAlign: 'center', padding: '40px 24px' }}>
          {cardReaderStatus === 'waiting' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <CreditCard style={{ width: '48px', height: '48px', color: colors.primary }} />
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '500', color: colors.text, margin: '0 0 8px 0' }}>
                  請插入或感應信用卡
                </h3>
                <p style={{ color: colors.subText, margin: 0, fontSize: '14px' }}>
                  將卡片插入讀卡機或進行感應
                </p>
              </div>
              <PaymentButton
                variant="primary"
                onClick={handleCardReaderPayment}
                disabled={isProcessing}
              >
                模擬刷卡
              </PaymentButton>
            </div>
          )}

          {cardReaderStatus === 'reading' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                border: `3px solid ${colors.primary}20`,
                borderTop: `3px solid ${colors.primary}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '500', color: colors.text, margin: '0 0 8px 0' }}>
                  讀取卡片中...
                </h3>
                <p style={{ color: colors.subText, margin: 0, fontSize: '14px' }}>
                  請勿移動卡片
                </p>
              </div>
            </div>
          )}

          {cardReaderStatus === 'processing' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <Loader style={{ width: '48px', height: '48px', color: colors.primary }} />
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '500', color: colors.text, margin: '0 0 8px 0' }}>
                  處理交易中...
                </h3>
                <p style={{ color: colors.subText, margin: 0, fontSize: '14px' }}>
                  正在與銀行確認
                </p>
              </div>
            </div>
          )}
        </PaymentCard>
      )}

      {/* 手動輸入模式 */}
      {!isCardReaderMode && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 卡號輸入 */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.text, marginBottom: '8px' }}>
              卡號 *
            </label>
            <PaymentInput
              value={cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              placeholder="1234 5678 9012 3456"
              style={{ fontSize: '16px' }}
            />
            {currentCardType !== 'Unknown' && cardNumber.length > 0 && (
              <p style={{ fontSize: '12px', color: colors.primary, margin: '4px 0 0 0' }}>
                {currentCardType} 卡
              </p>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* 有效期限 */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.text, marginBottom: '8px' }}>
                有效期限 *
              </label>
              <PaymentInput
                value={expiryDate}
                onChange={(e) => handleExpiryDateChange(e.target.value)}
                placeholder="MM/YY"
              />
            </div>

            {/* CVV */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.text, marginBottom: '8px' }}>
                CVV *
              </label>
              <PaymentInput
                value={cvv}
                onChange={(e) => handleCvvChange(e.target.value)}
                placeholder="123"
                type="password"
              />
            </div>
          </div>

          {/* 持卡人姓名 */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.text, marginBottom: '8px' }}>
              持卡人姓名 *
            </label>
            <PaymentInput
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="卡片上的英文姓名"
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          {/* 提交按鈕 */}
          <PaymentButton
            variant={isManualFormValid() ? 'primary' : 'secondary'}
            onClick={handleManualSubmit}
            disabled={!isManualFormValid() || isProcessing}
            style={{ 
              width: '100%',
              padding: '16px',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            {isProcessing ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '8px' 
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid transparent',
                  borderTop: '2px solid currentColor',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span>處理中...</span>
              </div>
            ) : (
              '確認付款'
            )}
          </PaymentButton>
        </div>
      )}

      {/* 安全提示 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        padding: '12px',
        background: colors.success + '10',
        border: `1px solid ${colors.success}30`,
        borderRadius: currentStyle === 'brutalism' ? '0' : '6px'
      }}>
        <Shield style={{ width: '16px', height: '16px', color: colors.success }} />
        <p style={{ 
          fontSize: '12px', 
          color: colors.subText,
          margin: 0 
        }}>
          您的卡片資訊經過加密保護，安全無慮
        </p>
      </div>
    </div>
  )
}

export default CardPayment

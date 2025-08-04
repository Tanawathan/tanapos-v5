import React, { useState, useEffect } from 'react'
import { Banknote, Calculator } from 'lucide-react'
import { usePaymentStyles, PaymentButton, PaymentCard, PaymentInput } from './PaymentStyleAdapter'

interface CashPaymentProps {
  amount: number
  onSubmit: (data: { receivedAmount: number; change: number }) => void
  isProcessing: boolean
}

const CashPayment: React.FC<CashPaymentProps> = ({
  amount,
  onSubmit,
  isProcessing
}) => {
  const [receivedAmount, setReceivedAmount] = useState<number>(amount)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [change, setChange] = useState<number>(0)
  
  const { colors, currentStyle } = usePaymentStyles()

  // 預設收款金額選項
  const quickAmounts = [
    amount, // 剛好金額
    Math.ceil(amount / 100) * 100, // 進位到百元
    Math.ceil(amount / 500) * 500, // 進位到五百元
    Math.ceil(amount / 1000) * 1000, // 進位到千元
  ].filter((amt, index, arr) => arr.indexOf(amt) === index) // 去重複

  // 計算找零
  useEffect(() => {
    const newChange = Math.max(0, receivedAmount - amount)
    setChange(newChange)
  }, [receivedAmount, amount])

  const handleQuickAmountSelect = (amt: number) => {
    setReceivedAmount(amt)
    setCustomAmount('')
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    const numValue = parseFloat(value) || 0
    setReceivedAmount(numValue)
  }

  const handleSubmit = () => {
    if (receivedAmount >= amount) {
      onSubmit({
        receivedAmount,
        change
      })
    }
  }

  const isValid = receivedAmount >= amount

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 金額顯示 */}
      <div style={{
        padding: '20px',
        background: colors.success + '20',
        border: `2px solid ${colors.success}`,
        borderRadius: currentStyle === 'brutalism' ? '0' :
                     currentStyle === 'kawaii' ? '15px' :
                     currentStyle === 'neumorphism' ? '12px' : '8px',
        backdropFilter: currentStyle === 'glassmorphism' ? 'blur(10px)' : 'none'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          marginBottom: '16px'
        }}>
          <Banknote style={{ width: '24px', height: '24px', color: colors.success }} />
          <span style={{ fontWeight: '500', color: colors.success }}>現金支付</span>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '16px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '14px', color: colors.subText, marginBottom: '4px' }}>
              應收金額
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.text }}>
              ${amount}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: colors.subText, marginBottom: '4px' }}>
              找零
            </div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: change > 0 ? colors.success : colors.subText
            }}>
              ${change}
            </div>
          </div>
        </div>
      </div>

      {/* 快速金額選擇 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label style={{ fontSize: '14px', fontWeight: '500', color: colors.text }}>
          收款金額
        </label>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '12px' 
        }}>
          {quickAmounts.map((amt) => (
            <PaymentButton
              key={amt}
              variant={receivedAmount === amt && !customAmount ? 'success' : 'secondary'}
              onClick={() => handleQuickAmountSelect(amt)}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                padding: '16px 12px'
              }}
            >
              <div style={{ fontWeight: '500' }}>${amt}</div>
              {amt > amount && (
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  找零 ${amt - amount}
                </div>
              )}
            </PaymentButton>
          ))}
        </div>
      </div>

      {/* 自訂金額輸入 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '14px', fontWeight: '500', color: colors.text }}>
          自訂收款金額
        </label>
        <div style={{ position: 'relative' }}>
          <PaymentInput
            type="number"
            value={customAmount}
            onChange={(e) => handleCustomAmountChange(e.target.value)}
            placeholder={`最少 $${amount}`}
            style={{ 
              paddingRight: '40px',
              fontSize: '16px'
            }}
          />
          <div style={{
            position: 'absolute',
            top: '50%',
            right: '12px',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Calculator style={{ width: '20px', height: '20px', color: colors.subText }} />
          </div>
        </div>
        {customAmount && receivedAmount < amount && (
          <p style={{ 
            color: colors.danger, 
            fontSize: '14px',
            margin: 0
          }}>
            收款金額不能少於應收金額 ${amount}
          </p>
        )}
      </div>

      {/* 金額明細 */}
      <PaymentCard style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <span style={{ color: colors.subText }}>應收金額:</span>
          <span style={{ fontWeight: '500' }}>${amount}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <span style={{ color: colors.subText }}>收到金額:</span>
          <span style={{ fontWeight: '500' }}>${receivedAmount}</span>
        </div>
        <div style={{ 
          borderTop: `1px solid ${colors.border}`, 
          paddingTop: '12px' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '500' }}>找零:</span>
            <span style={{ 
              fontWeight: 'bold',
              color: change > 0 ? colors.success : colors.text
            }}>
              ${change}
            </span>
          </div>
        </div>
      </PaymentCard>

      {/* 提交按鈕 */}
      <PaymentButton
        variant={isValid ? 'success' : 'secondary'}
        onClick={handleSubmit}
        disabled={!isValid || isProcessing}
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
          '確認收款'
        )}
      </PaymentButton>

      {/* 說明文字 */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ 
          fontSize: '14px', 
          color: colors.subText,
          margin: 0 
        }}>
          請確認收到的現金金額，系統將自動計算找零
        </p>
      </div>
    </div>
  )
}

export default CashPayment

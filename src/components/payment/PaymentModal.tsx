import React, { useState, useEffect } from 'react'
import { X, CreditCard, Banknote, Smartphone, Gift, Star, Receipt } from 'lucide-react'
import { PaymentMethod, PaymentRequest, PaymentResponse, PaymentStatus } from '../../types/payment'
import { usePaymentStore } from '../../stores/paymentStore'
import { useReceiptStore } from '../../stores/receiptStore'
import { usePaymentStyles, PaymentButton, PaymentCard } from './PaymentStyleAdapter'
import { useSound } from '../../hooks/useSound'
import PaymentMethods from './PaymentMethods'
import CashPayment from './CashPayment'
import CardPayment from './CardPayment'
import DigitalWalletPayment from './DigitalWalletPayment'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  orderId: string
  tableId?: string
  customerId?: string
  onSuccess?: (response: PaymentResponse) => void
  onError?: (error: string) => void
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  orderId,
  tableId,
  customerId,
  onSuccess,
  onError
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [tip, setTip] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState<'select' | 'payment' | 'success'>('select')
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null)

  const { 
    config, 
    processPayment, 
    isProcessing: storeProcessing, 
    error,
    clearError 
  } = usePaymentStore()
  
  const { generateReceipt } = useReceiptStore()
  const { playSound } = useSound()

  // 重置狀態當模態關閉/開啟時
  useEffect(() => {
    if (isOpen) {
      setSelectedMethod(null)
      setTip(0)
      setCurrentStep('select')
      setPaymentResponse(null)
      clearError()
    }
  }, [isOpen, clearError])

  // 計算總金額（包含小費）
  const totalAmount = amount + tip

  // 預設小費選項
  const tipOptions = [
    { label: '無小費', value: 0 },
    { label: '10%', value: Math.round(amount * 0.1) },
    { label: '15%', value: Math.round(amount * 0.15) },
    { label: '20%', value: Math.round(amount * 0.2) }
  ]

  const handleMethodSelect = (method: PaymentMethod) => {
    playSound('click') // 播放點擊音效
    setSelectedMethod(method)
    setCurrentStep('payment')
  }

  const handlePaymentSubmit = async (paymentData: any) => {
    try {
      setIsProcessing(true)
      clearError()
      
      // 播放處理中音效
      playSound('processing')

      const paymentRequest: PaymentRequest = {
        orderId,
        tableId,
        customerId,
        amount: totalAmount,
        paymentMethod: selectedMethod!,
        tip,
        metadata: {
          ...paymentData,
          originalAmount: amount,
          tipAmount: tip
        }
      }

      const response = await processPayment(paymentRequest)
      
      if (response.success) {
        // 播放成功音效
        playSound('paymentSuccess')
        
        setPaymentResponse(response)
        setCurrentStep('success')
        
        // 生成收據
        try {
          const transaction = await getTransactionFromResponse(response, paymentRequest)
          await generateReceipt(transaction)
        } catch (receiptError) {
          console.warn('收據生成失敗:', receiptError)
        }

        // 呼叫成功回調
        onSuccess?.(response)
      } else {
        // 播放失敗音效
        playSound('paymentFailed')
        onError?.(response.error || '支付失敗')
      }
    } catch (error) {
      // 播放錯誤音效
      playSound('error')
      const errorMessage = error instanceof Error ? error.message : '支付處理失敗'
      onError?.(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBackToMethods = () => {
    setSelectedMethod(null)
    setCurrentStep('select')
  }

  const handleClose = () => {
    if (!isProcessing && !storeProcessing) {
      onClose()
    }
  }

  const renderPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH:
        return <Banknote className="w-6 h-6" />
      case PaymentMethod.CREDIT_CARD:
        return <CreditCard className="w-6 h-6" />
      case PaymentMethod.DIGITAL_WALLET:
        return <Smartphone className="w-6 h-6" />
      case PaymentMethod.MEMBER_POINTS:
        return <Star className="w-6 h-6" />
      case PaymentMethod.VOUCHER:
        return <Gift className="w-6 h-6" />
      default:
        return <CreditCard className="w-6 h-6" />
    }
  }

  const { colors, getModalStyle, currentStyle } = usePaymentStyles()

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'select':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 金額顯示 */}
            <PaymentCard style={{ textAlign: 'center', padding: '32px 24px' }}>
              <div style={{ fontSize: '14px', color: colors.subText, marginBottom: '8px' }}>
                訂單金額
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: colors.text }}>
                ${amount}
              </div>
              {tip > 0 && (
                <div style={{ fontSize: '14px', color: colors.subText, marginTop: '8px' }}>
                  小費: ${tip} | 總計: ${totalAmount}
                </div>
              )}
            </PaymentCard>

            {/* 小費選擇 */}
            {config.tipEnabled && (
              <PaymentCard>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: colors.text }}>
                    小費選擇
                  </label>
                </div>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '12px',
                  marginBottom: '16px' 
                }}>
                  {tipOptions.map((option) => (
                    <PaymentButton
                      key={option.value}
                      variant={tip === option.value ? 'primary' : 'secondary'}
                      onClick={() => setTip(option.value)}
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        padding: '16px 12px'
                      }}
                    >
                      <div style={{ fontWeight: '500' }}>{option.label}</div>
                      {option.value > 0 && (
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>${option.value}</div>
                      )}
                    </PaymentButton>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '14px', color: colors.subText }}>自訂金額:</label>
                  <input
                    type="number"
                    min="0"
                    max={Math.round(amount * (config.maxTipPercentage / 100))}
                    value={tip}
                    onChange={(e) => setTip(Number(e.target.value) || 0)}
                    style={{
                      width: '100px',
                      padding: '8px 12px',
                      border: `1px solid ${colors.border}`,
                      borderRadius: currentStyle === 'brutalism' ? '0' : 
                                   currentStyle === 'kawaii' ? '15px' : '6px',
                      background: colors.bg,
                      color: colors.text,
                      fontSize: '14px'
                    }}
                  />
                </div>
              </PaymentCard>
            )}

            {/* 支付方式選擇 */}
            <PaymentMethods
              enabledMethods={config.enabledMethods}
              onSelect={handleMethodSelect}
            />
          </div>
        )

      case 'payment':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 返回按鈕和金額顯示 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <PaymentButton
                variant="secondary"
                onClick={handleBackToMethods}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                ← 返回選擇
              </PaymentButton>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: colors.text }}>
                  ${totalAmount}
                </div>
                {tip > 0 && (
                  <div style={{ fontSize: '14px', color: colors.subText }}>
                    含小費 ${tip}
                  </div>
                )}
              </div>
            </div>

            {/* 當前支付方式 */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '16px',
              background: colors.primary + '20',
              border: `1px solid ${colors.primary}`,
              borderRadius: currentStyle === 'brutalism' ? '0' : 
                           currentStyle === 'kawaii' ? '15px' : '8px'
            }}>
              {renderPaymentMethodIcon(selectedMethod!)}
              <span style={{ fontWeight: '500', color: colors.text }}>
                {getPaymentMethodName(selectedMethod!)}
              </span>
            </div>

            {/* 支付表單 */}
            {selectedMethod === PaymentMethod.CASH && (
              <CashPayment
                amount={totalAmount}
                onSubmit={handlePaymentSubmit}
                isProcessing={isProcessing || storeProcessing}
              />
            )}
            
            {selectedMethod === PaymentMethod.CREDIT_CARD && (
              <CardPayment
                amount={totalAmount}
                onSubmit={handlePaymentSubmit}
                isProcessing={isProcessing || storeProcessing}
              />
            )}
            
            {selectedMethod === PaymentMethod.DIGITAL_WALLET && (
              <DigitalWalletPayment
                amount={totalAmount}
                onSubmit={handlePaymentSubmit}
                isProcessing={isProcessing || storeProcessing}
              />
            )}
          </div>
        )

      case 'success':
        return (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ 
              width: '64px',
              height: '64px',
              background: colors.success + '20',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              border: `2px solid ${colors.success}`
            }}>
              <Receipt style={{ width: '32px', height: '32px', color: colors.success }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: colors.success, margin: 0 }}>
                支付成功！
              </h3>
              <p style={{ color: colors.subText, margin: 0 }}>
                交易已完成，感謝您的光臨
              </p>
            </div>

            <PaymentCard style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>交易編號:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                  {paymentResponse?.transactionId}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>支付金額:</span>
                <span style={{ fontWeight: 'bold' }}>${totalAmount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>支付方式:</span>
                <span>{getPaymentMethodName(selectedMethod!)}</span>
              </div>
            </PaymentCard>

            <PaymentButton
              variant="success"
              onClick={handleClose}
              style={{ width: '100%', padding: '16px' }}
            >
              完成
            </PaymentButton>
          </div>
        )

      default:
        return null
    }
  }

  if (!isOpen) return null

  const modalStyles = getModalStyle()

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      ...modalStyles.overlay
    }}>
      <div style={modalStyles.modal}>
        {/* 標題列 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '24px',
          borderBottom: `1px solid ${colors.border}`
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold',
            margin: 0,
            color: colors.text
          }}>
            {currentStep === 'select' && '選擇支付方式'}
            {currentStep === 'payment' && '完成支付'}
            {currentStep === 'success' && '支付完成'}
          </h2>
          {currentStep !== 'payment' && (
            <button
              onClick={handleClose}
              disabled={isProcessing || storeProcessing}
              style={{
                background: 'none',
                border: 'none',
                color: colors.subText,
                cursor: isProcessing || storeProcessing ? 'not-allowed' : 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X style={{ width: '24px', height: '24px' }} />
            </button>
          )}
        </div>

        {/* 內容區域 */}
        <div style={{ padding: '24px' }}>
          {error && (
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              background: colors.danger + '20',
              border: `1px solid ${colors.danger}`,
              borderRadius: currentStyle === 'brutalism' ? '0' : '8px'
            }}>
              <p style={{ color: colors.danger, fontSize: '14px', margin: 0 }}>{error}</p>
            </div>
          )}
          
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  )
}

// 輔助函數
function getPaymentMethodName(method: PaymentMethod): string {
  const names = {
    [PaymentMethod.CASH]: '現金',
    [PaymentMethod.CREDIT_CARD]: '信用卡',
    [PaymentMethod.DIGITAL_WALLET]: '電子錢包',
    [PaymentMethod.MEMBER_POINTS]: '會員點數',
    [PaymentMethod.VOUCHER]: '禮券'
  }
  return names[method] || method
}

async function getTransactionFromResponse(response: PaymentResponse, request: PaymentRequest) {
  // 將支付響應轉換為交易記錄格式
  return {
    id: response.transactionId,
    orderId: request.orderId,
    tableId: request.tableId,
    amount: request.amount,
    paymentMethod: request.paymentMethod,
    status: PaymentStatus.COMPLETED,
    transactionId: response.transactionId,
    reference: response.reference,
    timestamp: new Date(),
    cashier: 'CASHIER001', // TODO: 從用戶狀態獲取
    customer: request.customerId ? { id: request.customerId, name: '客戶' } : undefined,
    tip: request.tip || 0,
    subtotal: request.amount - (request.tip || 0),
    total: request.amount,
    metadata: request.metadata
  }
}

export default PaymentModal

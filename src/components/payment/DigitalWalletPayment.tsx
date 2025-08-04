import React, { useState, useEffect } from 'react'
import { Smartphone, QrCode, Wifi, CheckCircle, X } from 'lucide-react'
import { usePaymentStyles, PaymentButton, PaymentCard } from './PaymentStyleAdapter'

interface DigitalWalletPaymentProps {
  amount: number
  onSubmit: (data: { walletType: string; transactionId: string }) => void
  isProcessing: boolean
}

type WalletType = 'apple_pay' | 'google_pay' | 'line_pay' | 'jko_pay' | 'pi_wallet'

const DigitalWalletPayment: React.FC<DigitalWalletPaymentProps> = ({
  amount,
  onSubmit,
  isProcessing
}) => {
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'selecting' | 'connecting' | 'waiting' | 'success' | 'failed'>('selecting')
  const [qrCode, setQrCode] = useState<string>('')
  const [countdown, setCountdown] = useState<number>(120) // 2分鐘倒數

  const { colors, currentStyle } = usePaymentStyles()

  const wallets = [
    {
      type: 'apple_pay' as WalletType,
      name: 'Apple Pay',
      icon: '🍎',
      description: 'Touch ID 或 Face ID',
      themeColor: '#000000',
      available: true
    },
    {
      type: 'google_pay' as WalletType,
      name: 'Google Pay',
      icon: '🔵',
      description: '使用 Google 帳戶支付',
      themeColor: '#4285f4',
      available: true
    },
    {
      type: 'line_pay' as WalletType,
      name: 'LINE Pay',
      icon: '💚',
      description: 'LINE 行動支付',
      themeColor: '#00b900',
      available: true
    },
    {
      type: 'jko_pay' as WalletType,
      name: '街口支付',
      icon: '🟠',
      description: '街口行動支付',
      themeColor: '#ff6b00',
      available: true
    },
    {
      type: 'pi_wallet' as WalletType,
      name: 'Pi 錢包',
      icon: '🟣',
      description: 'Pi Network 錢包',
      themeColor: '#722ed1',
      available: true
    }
  ]

  // 倒數計時器
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (paymentStatus === 'waiting' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
    } else if (countdown === 0) {
      setPaymentStatus('failed')
    }
    return () => clearTimeout(timer)
  }, [paymentStatus, countdown])

  const handleWalletSelect = async (walletType: WalletType) => {
    setSelectedWallet(walletType)
    
    if (walletType === 'apple_pay' || walletType === 'google_pay') {
      // NFC 支付
      setPaymentStatus('connecting')
      await simulateNFCPayment(walletType)
    } else {
      // QR Code 支付
      setPaymentStatus('waiting')
      generateQRCode(walletType)
      setCountdown(120)
    }
  }

  const simulateNFCPayment = async (walletType: WalletType) => {
    try {
      // 模擬連接過程
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 模擬支付成功
      const transactionId = 'TXN' + Date.now().toString(36).toUpperCase()
      setPaymentStatus('success')
      
      setTimeout(() => {
        onSubmit({
          walletType: wallets.find(w => w.type === walletType)?.name || walletType,
          transactionId
        })
      }, 1000)
    } catch (error) {
      setPaymentStatus('failed')
    }
  }

  const generateQRCode = (walletType: WalletType) => {
    // 模擬 QR Code 生成
    const mockQRCode = `${walletType}_payment_${amount}_${Date.now()}`
    setQrCode(mockQRCode)
    
    // 模擬用戶掃描支付（10-30秒隨機）
    const randomDelay = Math.random() * 20000 + 10000
    setTimeout(() => {
      if (paymentStatus === 'waiting') {
        const transactionId = 'QR' + Date.now().toString(36).toUpperCase()
        setPaymentStatus('success')
        
        setTimeout(() => {
          onSubmit({
            walletType: wallets.find(w => w.type === walletType)?.name || walletType,
            transactionId
          })
        }, 1000)
      }
    }, randomDelay)
  }

  const handleRetry = () => {
    setSelectedWallet(null)
    setPaymentStatus('selecting')
    setQrCode('')
    setCountdown(120)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const selectedWalletInfo = wallets.find(w => w.type === selectedWallet)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 金額顯示 */}
      <div style={{
        padding: '20px',
        background: '#8b5cf6' + '20',
        border: '2px solid #8b5cf6',
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
          <Smartphone style={{ width: '24px', height: '24px', color: '#8b5cf6' }} />
          <span style={{ fontWeight: '500', color: '#8b5cf6' }}>電子錢包支付</span>
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

      {/* 錢包選擇 */}
      {paymentStatus === 'selecting' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '500', color: colors.text, margin: 0 }}>
            選擇電子錢包
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {wallets.map((wallet) => (
              <button
                key={wallet.type}
                onClick={() => handleWalletSelect(wallet.type)}
                disabled={!wallet.available || isProcessing}
                style={{
                  padding: '20px 16px',
                  border: `2px solid ${wallet.themeColor}20`,
                  borderRadius: currentStyle === 'brutalism' ? '0' :
                               currentStyle === 'kawaii' ? '15px' :
                               currentStyle === 'neumorphism' ? '12px' : '8px',
                  background: wallet.themeColor + '10',
                  color: colors.text,
                  cursor: wallet.available ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: currentStyle === 'neumorphism' ? `4px 4px 8px ${colors.shadow}, -2px -2px 4px #ffffff` :
                            currentStyle === 'brutalism' ? `4px 4px 0px ${wallet.themeColor}` :
                            currentStyle === 'glassmorphism' ? `0 4px 16px ${colors.shadow}` :
                            currentStyle === 'kawaii' ? `0 4px 8px ${colors.shadow}` :
                            `0 2px 4px ${colors.shadow}`,
                  backdropFilter: currentStyle === 'glassmorphism' ? 'blur(10px)' : 'none',
                  transform: currentStyle === 'brutalism' ? 'rotate(-0.5deg)' : 'none',
                  opacity: wallet.available ? 1 : 0.6
                }}
                onMouseEnter={(e) => {
                  if (wallet.available) {
                    if (currentStyle === 'brutalism') {
                      e.currentTarget.style.transform = 'rotate(0.5deg) scale(1.02)'
                      e.currentTarget.style.boxShadow = `6px 6px 0px ${wallet.themeColor}`
                    } else {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = `0 4px 8px ${colors.shadow}`
                    }
                    e.currentTarget.style.borderColor = wallet.themeColor + '40'
                    e.currentTarget.style.background = wallet.themeColor + '20'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = currentStyle === 'brutalism' ? 'rotate(-0.5deg)' : 'none'
                  e.currentTarget.style.boxShadow = currentStyle === 'neumorphism' ? `4px 4px 8px ${colors.shadow}, -2px -2px 4px #ffffff` :
                                                   currentStyle === 'brutalism' ? `4px 4px 0px ${wallet.themeColor}` :
                                                   currentStyle === 'glassmorphism' ? `0 4px 16px ${colors.shadow}` :
                                                   currentStyle === 'kawaii' ? `0 4px 8px ${colors.shadow}` :
                                                   `0 2px 4px ${colors.shadow}`
                  e.currentTarget.style.borderColor = wallet.themeColor + '20'
                  e.currentTarget.style.background = wallet.themeColor + '10'
                }}
              >
                <div style={{ fontSize: '32px' }}>{wallet.icon}</div>
                <div style={{ 
                  fontWeight: '500',
                  fontSize: currentStyle === 'brutalism' ? '14px' : '15px',
                  textTransform: currentStyle === 'brutalism' ? 'uppercase' : 'none'
                }}>
                  {wallet.name}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: colors.subText,
                  textAlign: 'center'
                }}>
                  {wallet.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* NFC 支付連接中 */}
      {paymentStatus === 'connecting' && selectedWalletInfo && (
        <PaymentCard style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: `3px solid ${selectedWalletInfo.themeColor}20`,
              borderTop: `3px solid ${selectedWalletInfo.themeColor}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '500', color: colors.text, margin: '0 0 8px 0' }}>
                連接 {selectedWalletInfo.name}
              </h3>
              <p style={{ color: colors.subText, margin: 0, fontSize: '14px' }}>
                請在手機上確認支付
              </p>
            </div>
          </div>
        </PaymentCard>
      )}

      {/* QR Code 支付等待中 */}
      {paymentStatus === 'waiting' && selectedWalletInfo && (
        <PaymentCard style={{ textAlign: 'center', padding: '32px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '500', color: colors.text, margin: '0 0 8px 0' }}>
                使用 {selectedWalletInfo.name} 掃描付款
              </h3>
              <p style={{ color: colors.subText, margin: 0, fontSize: '14px' }}>
                請使用 {selectedWalletInfo.name} App 掃描下方 QR Code
              </p>
            </div>

            {/* QR Code 模擬 */}
            <div style={{
              width: '200px',
              height: '200px',
              background: '#ffffff',
              border: `2px solid ${colors.border}`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '16px 0'
            }}>
              <QrCode style={{ width: '120px', height: '120px', color: '#333333' }} />
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: colors.warning 
            }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {formatTime(countdown)}
              </span>
              <span style={{ fontSize: '14px' }}>後過期</span>
            </div>

            <PaymentButton
              variant="secondary"
              onClick={handleRetry}
              style={{ fontSize: '14px', padding: '8px 16px' }}
            >
              重新選擇
            </PaymentButton>
          </div>
        </PaymentCard>
      )}

      {/* 支付成功 */}
      {paymentStatus === 'success' && selectedWalletInfo && (
        <PaymentCard style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <CheckCircle style={{ width: '64px', height: '64px', color: colors.success }} />
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.success, margin: '0 0 8px 0' }}>
                支付成功！
              </h3>
              <p style={{ color: colors.subText, margin: 0, fontSize: '14px' }}>
                {selectedWalletInfo.name} 付款完成
              </p>
            </div>
          </div>
        </PaymentCard>
      )}

      {/* 支付失敗 */}
      {paymentStatus === 'failed' && (
        <PaymentCard style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <X style={{ width: '64px', height: '64px', color: colors.danger }} />
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.danger, margin: '0 0 8px 0' }}>
                支付失敗
              </h3>
              <p style={{ color: colors.subText, margin: 0, fontSize: '14px' }}>
                {countdown === 0 ? '支付已超時' : '請重試或選擇其他支付方式'}
              </p>
            </div>
            <PaymentButton
              variant="primary"
              onClick={handleRetry}
            >
              重新支付
            </PaymentButton>
          </div>
        </PaymentCard>
      )}

      {/* 支援的錢包說明 */}
      {paymentStatus === 'selecting' && (
        <div style={{ 
          padding: '16px',
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: currentStyle === 'brutalism' ? '0' : '8px',
          fontSize: '12px',
          color: colors.subText
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>支援的支付方式：</p>
          <ul style={{ margin: 0, paddingLeft: '16px' }}>
            <li>🍎 Apple Pay - NFC 感應支付</li>
            <li>🔵 Google Pay - NFC 感應支付</li>
            <li>💚 LINE Pay - QR Code 掃描支付</li>
            <li>🟠 街口支付 - QR Code 掃描支付</li>
            <li>🟣 Pi 錢包 - QR Code 掃描支付</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default DigitalWalletPayment

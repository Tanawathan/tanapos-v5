import React, { useState } from 'react'
import { orderService, Order, OrderPaymentStatus, OrderStatus } from '../services/OrderService'
import PaymentModal from '../components/payment/PaymentModal'
import { PaymentResponse } from '../types/payment'

interface IntegratedPaymentProps {
  order: Order
  onPaymentSuccess?: (paymentId: string) => void
  onPaymentError?: (error: string) => void
}

const IntegratedPayment: React.FC<IntegratedPaymentProps> = ({
  order,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // 處理支付成功
  const handlePaymentSuccess = async (response: PaymentResponse) => {
    try {
      setIsProcessing(true)
      
      // 更新訂單支付狀態
      await orderService.updatePaymentStatus(
        order.id,
        OrderPaymentStatus.PAID,
        'card' // 預設支付方式，實際應用中需要從支付模態框傳遞
      )

      // 更新訂單狀態為已付款
      await orderService.updateOrderStatus(order.id, OrderStatus.PAID)

      setIsPaymentModalOpen(false)
      onPaymentSuccess?.(response.transactionId || 'unknown')
      
    } catch (error) {
      console.error('支付後處理失敗:', error)
      onPaymentError?.('支付成功但更新訂單狀態失敗')
    } finally {
      setIsProcessing(false)
    }
  }

  // 處理支付錯誤
  const handlePaymentError = async (error: string) => {
    try {
      // 更新支付狀態為失敗
      await orderService.updatePaymentStatus(order.id, OrderPaymentStatus.UNPAID)
      onPaymentError?.(error)
    } catch (updateError) {
      console.error('更新支付狀態失敗:', updateError)
      onPaymentError?.(`支付失敗: ${error}`)
    }
  }

  // 開始支付流程
  const startPayment = () => {
    setIsPaymentModalOpen(true)
  }

  return (
    <div>
      {/* 支付按鈕 */}
      <button
        onClick={startPayment}
        disabled={order.payment_status === OrderPaymentStatus.PAID || isProcessing}
        className={`px-4 py-2 rounded-lg transition-colors ${
          order.payment_status === OrderPaymentStatus.PAID
            ? 'bg-green-100 text-green-800 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {order.payment_status === OrderPaymentStatus.PAID ? '已付款' : 
         isProcessing ? '處理中...' : '立即支付'}
      </button>

      {/* 支付模態框 */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={order.total_amount}
        orderId={order.id}
        tableId={order.table_id || undefined}
        customerId={order.customer_name || undefined}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </div>
  )
}

export default IntegratedPayment

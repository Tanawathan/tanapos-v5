import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { 
  PaymentTransaction, 
  PaymentMethod, 
  PaymentStatus, 
  PaymentRequest,
  PaymentResponse,
  PaymentConfig,
  PaymentStatistics,
  RefundRequest,
  RefundResponse
} from '../types/payment'
import { orderService } from '../services/OrderService'

interface PaymentState {
  // 支付設定
  config: PaymentConfig
  
  // 當前支付
  currentPayment: PaymentRequest | null
  isProcessing: boolean
  
  // 支付歷史
  transactions: PaymentTransaction[]
  
  // 支付統計
  statistics: PaymentStatistics | null
  
  // 錯誤處理
  error: string | null
  
  // Actions
  setConfig: (config: PaymentConfig) => void
  startPayment: (request: PaymentRequest) => void
  processPayment: (request: PaymentRequest) => Promise<PaymentResponse>
  completePayment: (transaction: PaymentTransaction) => void
  cancelPayment: () => void
  
  // 交易管理
  addTransaction: (transaction: PaymentTransaction) => void
  updateTransaction: (id: string, updates: Partial<PaymentTransaction>) => void
  getTransaction: (id: string) => PaymentTransaction | undefined
  
  // 退款處理
  processRefund: (request: RefundRequest) => Promise<RefundResponse>
  
  // 統計資料
  loadStatistics: (startDate?: Date, endDate?: Date) => Promise<void>
  
  // 錯誤處理
  setError: (error: string | null) => void
  clearError: () => void
  
  // 重置狀態
  reset: () => void
}

// 預設支付設定
const defaultConfig: PaymentConfig = {
  enabledMethods: [
    PaymentMethod.CASH,
    PaymentMethod.CREDIT_CARD,
    PaymentMethod.DIGITAL_WALLET
  ],
  cashEnabled: true,
  cardEnabled: true,
  digitalWalletEnabled: true,
  memberPointsEnabled: false,
  voucherEnabled: false,
  splitPaymentEnabled: true,
  tipEnabled: true,
  maxTipPercentage: 25,
  currency: 'TWD',
  taxRate: 0.05,
  receiptFooter: '謝謝光臨，歡迎再次蒞臨！'
}

export const usePaymentStore = create<PaymentState>()(
  devtools(
    (set, get) => ({
      // 初始狀態
      config: defaultConfig,
      currentPayment: null,
      isProcessing: false,
      transactions: [],
      statistics: null,
      error: null,

      // 設定管理
      setConfig: (config) => set({ config }),

      // 支付流程
      startPayment: (request) => {
        set({ 
          currentPayment: request, 
          isProcessing: true, 
          error: null 
        })
      },

      processPayment: async (request) => {
        const { config } = get()
        
        try {
          set({ isProcessing: true, error: null })
          
          // 驗證支付方式是否啟用
          if (!config.enabledMethods.includes(request.paymentMethod)) {
            throw new Error('支付方式未啟用')
          }
          
          // 驗證金額
          if (request.amount <= 0) {
            throw new Error('支付金額必須大於零')
          }
          
          // 🔥 使用真實的 OrderService 處理支付
          const paymentMethodMap: { [key in PaymentMethod]: string } = {
            [PaymentMethod.CASH]: 'cash',
            [PaymentMethod.CREDIT_CARD]: 'card',
            [PaymentMethod.DEBIT_CARD]: 'card',
            [PaymentMethod.DIGITAL_WALLET]: 'mobile',
            [PaymentMethod.MEMBER_POINTS]: 'points',
            [PaymentMethod.VOUCHER]: 'voucher',
            [PaymentMethod.SPLIT]: 'split'
          }
          
          const result = await orderService.processPayment(
            request.orderId,
            request.amount,
            paymentMethodMap[request.paymentMethod]
          )
          
          if (result.success) {
            // 建立交易記錄
            const transaction: PaymentTransaction = {
              id: result.paymentId || generateTransactionId(),
              orderId: request.orderId,
              tableId: request.tableId,
              amount: request.amount,
              paymentMethod: request.paymentMethod,
              status: PaymentStatus.COMPLETED,
              transactionId: result.paymentId || generateTransactionId(),
              reference: `${paymentMethodMap[request.paymentMethod].toUpperCase()}-${Date.now()}`,
              timestamp: new Date(),
              cashier: getCurrentCashier(),
              customer: request.customerId ? await getCustomer(request.customerId) : undefined,
              tip: request.tip || 0,
              subtotal: request.amount - (request.tip || 0),
              total: request.amount,
              metadata: request.metadata
            }
            
            get().addTransaction(transaction)
            get().completePayment(transaction)
            
            return {
              success: true,
              transactionId: result.paymentId || generateTransactionId(),
              reference: transaction.reference,
              message: '支付成功完成'
            }
          } else {
            throw new Error(result.error || '支付處理失敗')
          }
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '支付處理失敗'
          set({ error: errorMessage, isProcessing: false })
          
          return {
            success: false,
            transactionId: '',
            error: errorMessage
          }
        }
      },

      completePayment: (transaction) => {
        set({ 
          currentPayment: null, 
          isProcessing: false,
          error: null
        })
        
        // 觸發完成事件
        console.log('支付完成:', transaction)
      },

      cancelPayment: () => {
        set({ 
          currentPayment: null, 
          isProcessing: false,
          error: null
        })
      },

      // 交易管理
      addTransaction: (transaction) => {
        set((state) => ({
          transactions: [transaction, ...state.transactions]
        }))
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map(t => 
            t.id === id ? { ...t, ...updates } : t
          )
        }))
      },

      getTransaction: (id) => {
        return get().transactions.find(t => t.id === id)
      },

      // 退款處理
      processRefund: async (request) => {
        try {
          const transaction = get().getTransaction(request.transactionId)
          if (!transaction) {
            throw new Error('找不到原始交易記錄')
          }
          
          if (transaction.status !== PaymentStatus.COMPLETED) {
            throw new Error('只能退款已完成的交易')
          }
          
          if (request.amount > transaction.amount) {
            throw new Error('退款金額不能超過原交易金額')
          }
          
          // 處理退款邏輯
          const refundResponse = await processRefundByMethod(request, transaction)
          
          if (refundResponse.success) {
            // 更新原交易狀態
            const isFullRefund = request.amount === transaction.amount
            get().updateTransaction(request.transactionId, {
              status: isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIAL_REFUND
            })
            
            // 建立退款交易記錄
            const refundTransaction: PaymentTransaction = {
              id: generateTransactionId(),
              orderId: transaction.orderId,
              tableId: transaction.tableId,
              amount: -request.amount,
              paymentMethod: transaction.paymentMethod,
              status: PaymentStatus.REFUNDED,
              transactionId: refundResponse.refundId,
              reference: `REFUND-${transaction.reference}`,
              timestamp: new Date(),
              cashier: request.cashier,
              subtotal: -request.amount,
              total: -request.amount,
              metadata: { 
                originalTransactionId: request.transactionId,
                refundReason: request.reason
              }
            }
            
            get().addTransaction(refundTransaction)
          }
          
          return refundResponse
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '退款處理失敗'
          set({ error: errorMessage })
          
          return {
            success: false,
            refundId: '',
            amount: 0,
            error: errorMessage
          }
        }
      },

      // 統計資料
      loadStatistics: async (startDate, endDate) => {
        try {
          const { transactions } = get()
          const filteredTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.timestamp)
            return (!startDate || transactionDate >= startDate) &&
                   (!endDate || transactionDate <= endDate)
          })
          
          const statistics = calculatePaymentStatistics(filteredTransactions)
          set({ statistics })
          
        } catch (error) {
          console.error('載入統計資料失敗:', error)
        }
      },

      // 錯誤處理
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // 重置狀態
      reset: () => set({
        currentPayment: null,
        isProcessing: false,
        transactions: [],
        statistics: null,
        error: null
      })
    }),
    { name: 'payment-store' }
  )
)

// 輔助函數
function generateTransactionId(): string {
  return `TXN${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function getCurrentCashier(): string {
  // TODO: 從用戶狀態獲取當前收銀員
  return 'CASHIER001'
}

async function getCustomer(customerId: string) {
  // TODO: 從會員系統獲取客戶資料
  return undefined
}

async function processPaymentByMethod(request: PaymentRequest): Promise<PaymentResponse> {
  // TODO: 根據支付方式調用相應的處理函數
  switch (request.paymentMethod) {
    case PaymentMethod.CASH:
      return await processCashPayment(request)
    case PaymentMethod.CREDIT_CARD:
      return await processCardPayment(request)
    case PaymentMethod.DIGITAL_WALLET:
      return await processDigitalWalletPayment(request)
    default:
      throw new Error('不支援的支付方式')
  }
}

async function processCashPayment(request: PaymentRequest): Promise<PaymentResponse> {
  // 現金支付邏輯 - 通常是立即成功
  return {
    success: true,
    transactionId: generateTransactionId(),
    reference: `CASH-${Date.now()}`,
    message: '現金支付成功'
  }
}

async function processCardPayment(request: PaymentRequest): Promise<PaymentResponse> {
  // 信用卡支付邏輯 - 需要串接支付閘道
  // 這裡模擬支付處理
  await new Promise(resolve => setTimeout(resolve, 2000)) // 模擬處理時間
  
  return {
    success: true,
    transactionId: generateTransactionId(),
    reference: `CARD-${Date.now()}`,
    message: '信用卡支付成功'
  }
}

async function processDigitalWalletPayment(request: PaymentRequest): Promise<PaymentResponse> {
  // 電子錢包支付邏輯
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  return {
    success: true,
    transactionId: generateTransactionId(),
    reference: `WALLET-${Date.now()}`,
    message: '電子錢包支付成功'
  }
}

async function processRefundByMethod(
  request: RefundRequest, 
  originalTransaction: PaymentTransaction
): Promise<RefundResponse> {
  // 退款處理邏輯
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    success: true,
    refundId: `REF-${Date.now()}`,
    amount: request.amount,
    message: '退款處理成功'
  }
}

function calculatePaymentStatistics(transactions: PaymentTransaction[]): PaymentStatistics {
  const completedTransactions = transactions.filter(t => 
    t.status === PaymentStatus.COMPLETED && t.amount > 0
  )
  
  const totalTransactions = completedTransactions.length
  const totalAmount = completedTransactions.reduce((sum, t) => sum + t.amount, 0)
  const averageTransaction = totalTransactions > 0 ? totalAmount / totalTransactions : 0
  
  // 支付方式分布
  const methodCounts = completedTransactions.reduce((acc, t) => {
    acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const methodAmounts = completedTransactions.reduce((acc, t) => {
    acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.amount
    return acc
  }, {} as Record<string, number>)
  
  const paymentMethodBreakdown = Object.keys(methodCounts).map(method => ({
    method: method as PaymentMethod,
    count: methodCounts[method],
    amount: methodAmounts[method],
    percentage: (methodCounts[method] / totalTransactions) * 100
  }))
  
  return {
    totalTransactions,
    totalAmount,
    averageTransaction,
    paymentMethodBreakdown,
    dailyStats: [], // TODO: 實現日統計
    hourlyStats: []  // TODO: 實現時統計
  }
}

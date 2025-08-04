// 支付方式枚舉
export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  DIGITAL_WALLET = 'digital_wallet',
  MEMBER_POINTS = 'member_points',
  VOUCHER = 'voucher',
  SPLIT = 'split'
}

// 支付狀態
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIAL_REFUND = 'partial_refund'
}

// 支付交易記錄
export interface PaymentTransaction {
  id: string
  orderId: string
  tableId?: string
  amount: number
  paymentMethod: PaymentMethod
  status: PaymentStatus
  transactionId?: string
  reference?: string
  timestamp: Date
  cashier: string
  splitDetails?: SplitPaymentDetail[]
  metadata?: Record<string, any>
  customer?: Customer
  tip?: number
  discount?: number
  tax?: number
  subtotal: number
  total: number
}

// 分帳詳細
export interface SplitPaymentDetail {
  id: string
  amount: number
  paymentMethod: PaymentMethod
  status: PaymentStatus
  transactionId?: string
  reference?: string
  timestamp: Date
}

// 支付請求
export interface PaymentRequest {
  orderId: string
  amount: number
  paymentMethod: PaymentMethod
  tableId?: string
  customerId?: string
  tip?: number
  splitPayments?: {
    method: PaymentMethod
    amount: number
  }[]
  metadata?: Record<string, any>
}

// 支付回應
export interface PaymentResponse {
  success: boolean
  transactionId: string
  reference?: string
  message?: string
  error?: string
  receiptData?: ReceiptData
}

// 退款請求
export interface RefundRequest {
  transactionId: string
  amount: number
  reason: string
  cashier: string
}

// 退款回應
export interface RefundResponse {
  success: boolean
  refundId: string
  amount: number
  message?: string
  error?: string
}

// 收據資料
export interface ReceiptData {
  transactionId: string
  receiptNumber: string
  storeName: string
  storeAddress: string
  items: ReceiptItem[]
  subtotal: number
  tax: number
  tip: number
  discount: number
  total: number
  paymentMethod: PaymentMethod
  cashReceived?: number
  change?: number
  timestamp: Date
  cashier: string
  customer?: Customer
  tableNumber?: string
}

// 收據項目
export interface ReceiptItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  category?: string
  modifiers?: string[]
}

// 客戶資訊
export interface Customer {
  id: string
  name?: string
  phone?: string
  email?: string
  memberLevel?: string
  points?: number
}

// 支付配置
export interface PaymentConfig {
  enabledMethods: PaymentMethod[]
  cashEnabled: boolean
  cardEnabled: boolean
  digitalWalletEnabled: boolean
  memberPointsEnabled: boolean
  voucherEnabled: boolean
  splitPaymentEnabled: boolean
  tipEnabled: boolean
  maxTipPercentage: number
  currency: string
  taxRate: number
  receiptFooter?: string
}

// 支付統計
export interface PaymentStatistics {
  totalTransactions: number
  totalAmount: number
  averageTransaction: number
  paymentMethodBreakdown: {
    method: PaymentMethod
    count: number
    amount: number
    percentage: number
  }[]
  dailyStats: {
    date: string
    transactions: number
    amount: number
  }[]
  hourlyStats: {
    hour: number
    transactions: number
    amount: number
  }[]
}

// 支付驗證錯誤
export interface PaymentValidationError {
  field: string
  message: string
  code: string
}

// 支付結果
export interface PaymentResult {
  success: boolean
  transaction?: PaymentTransaction
  error?: PaymentValidationError[]
  receipt?: ReceiptData
}

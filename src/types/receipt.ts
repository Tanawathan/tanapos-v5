import { PaymentMethod, PaymentTransaction, Customer } from './payment'

// 收據型別
export enum ReceiptType {
  SALE = 'sale',
  REFUND = 'refund',
  VOID = 'void',
  GIFT_CARD = 'gift_card'
}

// 收據格式
export enum ReceiptFormat {
  THERMAL = 'thermal',
  A4 = 'a4',
  DIGITAL = 'digital',
  EMAIL = 'email'
}

// 收據狀態
export enum ReceiptStatus {
  GENERATED = 'generated',
  PRINTED = 'printed',
  EMAILED = 'emailed',
  VOIDED = 'voided'
}

// 完整收據介面
export interface Receipt {
  id: string
  receiptNumber: string
  type: ReceiptType
  status: ReceiptStatus
  transaction: PaymentTransaction
  
  // 店鋪資訊
  store: {
    name: string
    address: string
    phone: string
    taxId?: string
    logo?: string
  }
  
  // 訂單資訊
  order: {
    items: ReceiptItem[]
    subtotal: number
    tax: number
    tip: number
    discount: number
    total: number
  }
  
  // 支付資訊
  payment: {
    method: PaymentMethod
    amount: number
    cashReceived?: number
    change?: number
    cardDetails?: {
      lastFourDigits: string
      cardType: string
      authCode?: string
    }
  }
  
  // 時間戳記
  timestamps: {
    created: Date
    printed?: Date
    emailed?: Date
  }
  
  // 人員資訊
  staff: {
    cashier: string
    server?: string
  }
  
  // 客戶資訊
  customer?: Customer
  
  // 桌號/訂單號
  tableNumber?: string
  orderNumber?: string
  
  // 其他設定
  settings: {
    showTax: boolean
    showTip: boolean
    showDiscount: boolean
    footer?: string
    qrCode?: string
  }
}

// 收據項目詳細
export interface ReceiptItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  category?: string
  modifiers?: ReceiptModifier[]
  notes?: string
  discountAmount?: number
  taxAmount?: number
}

// 收據修飾選項
export interface ReceiptModifier {
  id: string
  name: string
  price: number
}

// 收據設定
export interface ReceiptSettings {
  defaultFormat: ReceiptFormat
  enableEmail: boolean
  enableSMS: boolean
  autoSend: boolean
  showLogo: boolean
  showQRCode: boolean
  showTaxBreakdown: boolean
  showDiscountDetails: boolean
  footerText: string
  headerText?: string
  
  // 列印設定
  printer: {
    width: number // mm
    paperSize: 'thermal_58' | 'thermal_80' | 'a4'
    fontSize: number
    logoHeight?: number
  }
  
  // 數位收據設定
  digital: {
    enablePDF: boolean
    enableHTML: boolean
    template: string
    emailSubject: string
  }
}

// 收據模板
export interface ReceiptTemplate {
  id: string
  name: string
  type: ReceiptType
  format: ReceiptFormat
  template: string
  variables: string[]
  preview?: string
  active: boolean
}

// 收據搜尋條件
export interface ReceiptSearchFilter {
  startDate?: Date
  endDate?: Date
  receiptNumber?: string
  transactionId?: string
  cashier?: string
  paymentMethod?: PaymentMethod
  status?: ReceiptStatus
  type?: ReceiptType
  minAmount?: number
  maxAmount?: number
  customer?: string
  tableNumber?: string
}

// 收據統計
export interface ReceiptStatistics {
  totalReceipts: number
  printedReceipts: number
  emailedReceipts: number
  voidedReceipts: number
  
  breakdown: {
    type: ReceiptType
    count: number
    percentage: number
  }[]
  
  dailyCount: {
    date: string
    printed: number
    emailed: number
    total: number
  }[]
}

// 列印選項
export interface PrintOptions {
  format: ReceiptFormat
  copies: number
  printer?: string
  showPreview: boolean
  autoOpen: boolean
}

// 收據匯出選項
export interface ReceiptExportOptions {
  format: 'pdf' | 'excel' | 'csv'
  dateRange: {
    start: Date
    end: Date
  }
  filters?: ReceiptSearchFilter
  includeVoided: boolean
  groupBy?: 'day' | 'week' | 'month'
}

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { 
  Receipt, 
  ReceiptSettings, 
  ReceiptTemplate,
  ReceiptFormat,
  ReceiptType,
  ReceiptStatus,
  PrintOptions,
  ReceiptItem
} from '../types/receipt'
import { PaymentTransaction, Customer, PaymentMethod } from '../types/payment'

interface ReceiptState {
  // 收據設定
  settings: ReceiptSettings
  templates: ReceiptTemplate[]
  
  // 當前收據
  currentReceipt: Receipt | null
  isPrinting: boolean
  
  // 收據歷史
  receipts: Receipt[]
  
  // 錯誤處理
  error: string | null
  
  // Actions
  setSettings: (settings: ReceiptSettings) => void
  addTemplate: (template: ReceiptTemplate) => void
  updateTemplate: (id: string, template: Partial<ReceiptTemplate>) => void
  deleteTemplate: (id: string) => void
  
  // 收據生成
  generateReceipt: (transaction: PaymentTransaction) => Promise<Receipt>
  previewReceipt: (transaction: PaymentTransaction, template?: ReceiptTemplate) => Receipt
  
  // 列印功能
  printReceipt: (receipt: Receipt, options?: Partial<PrintOptions>) => Promise<boolean>
  printDuplicate: (receiptId: string) => Promise<boolean>
  
  // 收據管理
  saveReceipt: (receipt: Receipt) => void
  getReceipt: (id: string) => Receipt | undefined
  searchReceipts: (query: string) => Receipt[]
  updateReceiptStatus: (id: string, status: ReceiptStatus) => void
  
  // 匯出功能
  exportReceiptPDF: (receipt: Receipt) => Promise<Blob>
  exportReceiptImage: (receipt: Receipt, format: 'png' | 'jpg') => Promise<Blob>
  emailReceipt: (receipt: Receipt, email: string) => Promise<boolean>
  
  // 錯誤處理
  setError: (error: string | null) => void
  clearError: () => void
  
  // 重置狀態
  reset: () => void
}

// 預設收據設定
const defaultSettings: ReceiptSettings = {
  defaultFormat: ReceiptFormat.THERMAL,
  enableEmail: true,
  enableSMS: false,
  autoSend: false,
  showLogo: true,
  showQRCode: true,
  showTaxBreakdown: true,
  showDiscountDetails: true,
  footerText: '謝謝光臨，歡迎再次蒞臨！',
  headerText: 'TANA POS',
  printer: {
    width: 80,
    paperSize: 'thermal_80',
    fontSize: 12,
    logoHeight: 50
  },
  digital: {
    enablePDF: true,
    enableHTML: true,
    template: 'standard',
    emailSubject: '您的購物收據'
  }
}

// 預設模板
const defaultTemplates: ReceiptTemplate[] = [
  {
    id: 'standard',
    name: '標準收據',
    type: ReceiptType.SALE,
    format: ReceiptFormat.THERMAL,
    template: 'standard-template',
    variables: ['storeName', 'storeAddress', 'customerName', 'items', 'total'],
    active: true
  },
  {
    id: 'minimal',
    name: '簡約收據',
    type: ReceiptType.SALE,
    format: ReceiptFormat.THERMAL,
    template: 'minimal-template',
    variables: ['storeName', 'items', 'total'],
    active: true
  }
]

export const useReceiptStore = create<ReceiptState>()(
  devtools(
    (set, get) => ({
      // 初始狀態
      settings: defaultSettings,
      templates: defaultTemplates,
      currentReceipt: null,
      isPrinting: false,
      receipts: [],
      error: null,

      // 設定管理
      setSettings: (settings) => set({ settings }),

      // 模板管理
      addTemplate: (template) => {
        set((state) => ({
          templates: [...state.templates, template]
        }))
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map(t => 
            t.id === id ? { ...t, ...updates } : t
          )
        }))
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter(t => t.id !== id)
        }))
      },

      // 收據生成
      generateReceipt: async (transaction) => {
        try {
          set({ error: null })
          
          const { settings, templates } = get()
          const selectedTemplate = templates.find(t => t.active && t.type === ReceiptType.SALE) || templates[0]
          
          if (!selectedTemplate) {
            throw new Error('找不到可用的收據模板')
          }
          
          // 建立收據項目
          const receiptItems: ReceiptItem[] = []
          
          // 從交易 metadata 中提取商品資訊（如果存在）
          if (transaction.metadata?.items) {
            const items = transaction.metadata.items as any[]
            items.forEach((item, index) => {
              receiptItems.push({
                id: `item-${index}`,
                name: item.name || '商品',
                quantity: item.quantity || 1,
                unitPrice: item.price || 0,
                totalPrice: item.total || item.price || 0,
                category: item.category,
                notes: item.notes
              })
            })
          } else {
            // 預設單一商品
            receiptItems.push({
              id: 'item-1',
              name: '商品',
              quantity: 1,
              unitPrice: transaction.amount,
              totalPrice: transaction.amount
            })
          }
          
          const receipt: Receipt = {
            id: generateReceiptId(),
            receiptNumber: generateReceiptNumber(),
            type: ReceiptType.SALE,
            status: ReceiptStatus.GENERATED,
            transaction,
            
            store: {
              name: 'TANA POS',
              address: '台北市信義區信義路五段7號',
              phone: '02-1234-5678',
              taxId: '12345678'
            },
            
            order: {
              items: receiptItems,
              subtotal: transaction.amount - (transaction.tip || 0),
              tax: 0,
              tip: transaction.tip || 0,
              discount: 0,
              total: transaction.amount
            },
            
            payment: {
              method: transaction.paymentMethod,
              amount: transaction.amount
            },
            
            timestamps: {
              created: new Date()
            },
            
            staff: {
              cashier: transaction.cashier
            },
            
            customer: transaction.customer,
            tableNumber: transaction.tableId,
            orderNumber: transaction.orderId,
            
            settings: {
              showTax: settings.showTaxBreakdown,
              showTip: true,
              showDiscount: settings.showDiscountDetails,
              footer: settings.footerText,
              qrCode: settings.showQRCode ? `receipt-${generateReceiptNumber()}` : undefined
            }
          }
          
          set({ currentReceipt: receipt })
          get().saveReceipt(receipt)
          
          return receipt
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '收據生成失敗'
          set({ error: errorMessage })
          throw error
        }
      },

      previewReceipt: (transaction, template) => {
        const { settings, templates } = get()
        const selectedTemplate = template || templates.find(t => t.active) || templates[0]
        
        // 建立預覽收據
        const receiptItems: ReceiptItem[] = [{
          id: 'preview-item',
          name: '預覽商品',
          quantity: 1,
          unitPrice: transaction.amount,
          totalPrice: transaction.amount
        }]
        
        return {
          id: 'preview',
          receiptNumber: 'PREVIEW',
          type: ReceiptType.SALE,
          status: ReceiptStatus.GENERATED,
          transaction,
          
          store: {
            name: 'TANA POS',
            address: '台北市信義區信義路五段7號',
            phone: '02-1234-5678'
          },
          
          order: {
            items: receiptItems,
            subtotal: transaction.amount,
            tax: 0,
            tip: 0,
            discount: 0,
            total: transaction.amount
          },
          
          payment: {
            method: transaction.paymentMethod,
            amount: transaction.amount
          },
          
          timestamps: {
            created: new Date()
          },
          
          staff: {
            cashier: transaction.cashier
          },
          
          settings: {
            showTax: settings.showTaxBreakdown,
            showTip: true,
            showDiscount: settings.showDiscountDetails,
            footer: settings.footerText
          }
        }
      },

      // 列印功能
      printReceipt: async (receipt, options) => {
        try {
          set({ isPrinting: true, error: null })
          
          const printOptions: PrintOptions = {
            format: options?.format || ReceiptFormat.THERMAL,
            copies: options?.copies || 1,
            showPreview: options?.showPreview || false,
            autoOpen: options?.autoOpen || true,
            ...options
          }
          
          // 模擬列印過程
          const success = await simulatePrint(receipt, printOptions)
          
          if (success) {
            get().updateReceiptStatus(receipt.id, ReceiptStatus.PRINTED)
          }
          
          return success
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '列印失敗'
          set({ error: errorMessage })
          return false
        } finally {
          set({ isPrinting: false })
        }
      },

      printDuplicate: async (receiptId) => {
        const receipt = get().getReceipt(receiptId)
        if (!receipt) {
          set({ error: '找不到收據記錄' })
          return false
        }
        
        return await get().printReceipt(receipt)
      },

      // 收據管理
      saveReceipt: (receipt) => {
        set((state) => ({
          receipts: [receipt, ...state.receipts]
        }))
      },

      getReceipt: (id) => {
        return get().receipts.find(r => r.id === id)
      },

      searchReceipts: (query) => {
        const { receipts } = get()
        const searchTerm = query.toLowerCase()
        
        return receipts.filter(receipt => 
          receipt.receiptNumber.toLowerCase().includes(searchTerm) ||
          receipt.transaction.id.toLowerCase().includes(searchTerm) ||
          receipt.customer?.name?.toLowerCase().includes(searchTerm)
        )
      },

      updateReceiptStatus: (id, status) => {
        set((state) => ({
          receipts: state.receipts.map(r => 
            r.id === id ? { ...r, status } : r
          )
        }))
      },

      // 匯出功能
      exportReceiptPDF: async (receipt) => {
        try {
          // 模擬 PDF 生成
          const pdfContent = await generateReceiptPDF(receipt)
          return new Blob([pdfContent], { type: 'application/pdf' })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'PDF匯出失敗'
          set({ error: errorMessage })
          throw error
        }
      },

      exportReceiptImage: async (receipt, format) => {
        try {
          const imageContent = await generateReceiptImage(receipt, format)
          const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
          return new Blob([imageContent], { type: mimeType })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '圖片匯出失敗'
          set({ error: errorMessage })
          throw error
        }
      },

      emailReceipt: async (receipt, email) => {
        try {
          const success = await sendReceiptEmail(receipt, email)
          if (success) {
            get().updateReceiptStatus(receipt.id, ReceiptStatus.EMAILED)
          }
          return success
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '郵件發送失敗'
          set({ error: errorMessage })
          return false
        }
      },

      // 錯誤處理
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // 重置狀態
      reset: () => set({
        currentReceipt: null,
        isPrinting: false,
        receipts: [],
        error: null
      })
    }),
    { name: 'receipt-store' }
  )
)

// 輔助函數
function generateReceiptId(): string {
  return `RCP${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
}

function generateReceiptNumber(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const sequence = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  
  return `${year}${month}${day}${sequence}`
}

async function simulatePrint(receipt: Receipt, options: PrintOptions): Promise<boolean> {
  console.log('列印收據:', receipt.receiptNumber, options)
  await new Promise(resolve => setTimeout(resolve, 1000))
  return true
}

async function generateReceiptPDF(receipt: Receipt): Promise<string> {
  // 模擬 PDF 生成
  await new Promise(resolve => setTimeout(resolve, 500))
  return `PDF content for receipt ${receipt.receiptNumber}`
}

async function generateReceiptImage(receipt: Receipt, format: 'png' | 'jpg'): Promise<string> {
  // 模擬圖片生成
  await new Promise(resolve => setTimeout(resolve, 500))
  return `${format.toUpperCase()} content for receipt ${receipt.receiptNumber}`
}

async function sendReceiptEmail(receipt: Receipt, email: string): Promise<boolean> {
  console.log('發送收據至:', email, '收據編號:', receipt.receiptNumber)
  await new Promise(resolve => setTimeout(resolve, 1000))
  return true
}

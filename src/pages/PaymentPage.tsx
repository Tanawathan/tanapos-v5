import React, { useState } from 'react'
import { CreditCard, Receipt, Settings, TrendingUp } from 'lucide-react'
import PaymentModal from '../components/payment/PaymentModal'
import { PaymentResponse } from '../types/payment'

const PaymentPage: React.FC = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [testAmount, setTestAmount] = useState(520)
  const [lastPaymentResult, setLastPaymentResult] = useState<PaymentResponse | null>(null)

  // 測試訂單資料
  const testOrders = [
    { id: 'ORD001', table: 'T05', amount: 520, items: ['美式咖啡 x2', '起司蛋糕 x1'] },
    { id: 'ORD002', table: 'T03', amount: 350, items: ['拿鐵 x1', '三明治 x1'] },
    { id: 'ORD003', table: '外帶', amount: 180, items: ['卡布奇諾 x1'] },
  ]

  const handlePaymentSuccess = (response: PaymentResponse) => {
    setLastPaymentResult(response)
    setIsPaymentModalOpen(false)
    console.log('支付成功:', response)
  }

  const handlePaymentError = (error: string) => {
    console.error('支付失敗:', error)
    alert(`支付失敗: ${error}`)
  }

  const openPaymentModal = (amount: number) => {
    setTestAmount(amount)
    setIsPaymentModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* 頁面標題 */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">支付系統</h1>
              <p className="text-gray-600">多元支付方式，快速便捷的收款體驗</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側：待支付訂單 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">待支付訂單</h2>
                <p className="text-gray-600 mt-1">選擇訂單進行支付處理</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {testOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-medium text-gray-900">{order.id}</span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                              {order.table}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {order.items.join(', ')}
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            ${order.amount}
                          </div>
                        </div>
                        <button
                          onClick={() => openPaymentModal(order.amount)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          收款
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* 自訂金額支付 */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">自訂金額支付</h3>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      min="1"
                      value={testAmount}
                      onChange={(e) => setTestAmount(Number(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="輸入金額"
                    />
                    <button
                      onClick={() => openPaymentModal(testAmount)}
                      disabled={testAmount <= 0}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      開始收款
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右側：支付結果和統計 */}
          <div className="space-y-6">
            {/* 最近支付結果 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">最近支付</h3>
                </div>
              </div>
              <div className="p-6">
                {lastPaymentResult ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">交易編號:</span>
                      <span className="font-mono text-sm">{lastPaymentResult.transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">狀態:</span>
                      <span className="text-green-600 font-medium">
                        {lastPaymentResult.success ? '成功' : '失敗'}
                      </span>
                    </div>
                    {lastPaymentResult.reference && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">參考號:</span>
                        <span className="font-mono text-sm">{lastPaymentResult.reference}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600">{lastPaymentResult.message || '交易完成'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Receipt className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">尚無支付記錄</p>
                  </div>
                )}
              </div>
            </div>

            {/* 快速統計 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">今日統計</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">交易筆數:</span>
                    <span className="font-bold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">總金額:</span>
                    <span className="font-bold text-green-600">$3,450</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">平均客單:</span>
                    <span className="font-bold">$287</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">現金:</span>
                    <span>5筆 (42%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">信用卡:</span>
                    <span>4筆 (33%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">電子錢包:</span>
                    <span>3筆 (25%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 快速設定 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">快速設定</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-gray-900">支付方式設定</div>
                    <div className="text-sm text-gray-600">管理啟用的支付方式</div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-gray-900">收據設定</div>
                    <div className="text-sm text-gray-600">設定收據格式和列印</div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-gray-900">小費設定</div>
                    <div className="text-sm text-gray-600">設定小費選項和比例</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 支付模態框 */}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          amount={testAmount}
          orderId={`ORD${Date.now()}`}
          tableId="T05"
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </div>
    </div>
  )
}

export default PaymentPage

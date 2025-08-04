import React, { useState, useEffect } from 'react'
import { useRealData } from '../services/RealDataService'
import { orderService, CartItem as OrderCartItem } from '../services/OrderService'
import RealDataTableSelector from './RealDataTableSelector'
import IntegratedPayment from './IntegratedPayment'
// import RealDataKDS from './RealDataKDS' // 暫時停用 KDS 模組
import { useSmartCache } from '../hooks/useSmartCache'
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor'
import { supabase } from '../lib/supabase'

// 套餐相關類型定義
interface ComboProduct {
  id: string
  name: string
  description?: string
  price: number
  category_id: string
  image_url?: string
  is_available: boolean
  combo_type: 'fixed' | 'selectable'
}

interface ComboChoice {
  id: string
  combo_id: string
  category_id: string
  category_name: string
  min_selections: number
  max_selections: number
}

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  type: 'product' | 'combo'
  specialInstructions?: string
  combo_selections?: any
  instanceId?: string
}

const RealDataPOS: React.FC = () => {
  const { useCategories, useProducts, useTables, service } = useRealData()
  const { categories, loading: categoriesLoading } = useCategories()
  const { products, loading: productsLoading } = useProducts()
  const { tables, loading: tablesLoading } = useTables()
  const { setCache, getCache } = useSmartCache()
  const { measureRenderPerformance } = usePerformanceMonitor()

  // 狀態管理
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [partySize, setPartySize] = useState(2)
  const [isOrderPlacing, setIsOrderPlacing] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<any>(null)
  const [showPayment, setShowPayment] = useState(false)

  // 套餐相關狀態
  const [combos, setCombos] = useState<ComboProduct[]>([])
  const [showComboSelector, setShowComboSelector] = useState(false)
  const [selectedCombo, setSelectedCombo] = useState<ComboProduct | null>(null)
  const [comboChoices, setComboChoices] = useState<ComboChoice[]>([])
  const [comboSelections, setComboSelections] = useState<{[categoryId: string]: any[]}>({})

  // 載入套餐數據
  useEffect(() => {
    loadCombos()
  }, [])

  const loadCombos = async () => {
    try {
      const { data: combosData } = await supabase
        .from('combo_products')
        .select('*')
        .eq('is_available', true)
        .order('name')

      setCombos(combosData || [])
    } catch (error) {
      console.error('載入套餐失敗:', error)
    }
  }

  // 載入套餐選擇規則
  const loadComboChoices = async (comboId: string) => {
    try {
      const { data } = await supabase
        .from('combo_choices')
        .select(`
          *,
          categories!inner(name)
        `)
        .eq('combo_id', comboId)

      const choicesWithCategoryName = data?.map(choice => ({
        ...choice,
        category_name: choice.categories.name
      })) || []

      setComboChoices(choicesWithCategoryName)
    } catch (error) {
      console.error('載入套餐選擇規則失敗:', error)
    }
  }

  // 選擇桌位
  const handleTableSelect = (tableId: string) => {
    setSelectedTable(tableId)
  }

  // 支付成功處理
  const handlePaymentSuccess = (paymentId: string) => {
    alert(`支付成功！支付ID：${paymentId}`)
    setShowPayment(false)
    setCurrentOrder(null)
    setSelectedTable(null)
  }

  // 支付錯誤處理
  const handlePaymentError = (error: string) => {
    alert(`支付失敗：${error}`)
    // 可以選擇重試或取消訂單
  }

  // 添加到購物車
  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    const existingItem = cart.find(item => item.productId === productId && item.type === 'product')
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.productId === productId && item.type === 'product'
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random()}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        type: 'product',
        instanceId: `product_${product.id}_${Date.now()}`
      }
      setCart([...cart, newItem])
    }
  }

  // 添加套餐到購物車
  const addComboToCart = (combo: ComboProduct, selections: any) => {
    const instanceId = `combo_${combo.id}_${Date.now()}`
    const newItem: CartItem = {
      id: instanceId,
      productId: combo.id,
      name: combo.name,
      price: combo.price,
      quantity: 1,
      type: 'combo',
      combo_selections: selections,
      instanceId
    }
    setCart(prev => [...prev, newItem])
    setShowComboSelector(false)
    setSelectedCombo(null)
    setComboSelections({})
  }

  // 處理套餐點擊
  const handleComboClick = async (combo: ComboProduct) => {
    if (combo.combo_type === 'fixed') {
      // 固定套餐直接加入購物車
      addComboToCart(combo, null)
    } else {
      // 可選套餐打開選擇器
      setSelectedCombo(combo)
      await loadComboChoices(combo.id)
      setShowComboSelector(true)
    }
  }

  // 移除購物車項目
  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId))
  }

  // 更新購物車數量
  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    
    setCart(cart.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ))
  }

  // 更新特殊說明
  const updateSpecialInstructions = (itemId: string, instructions: string) => {
    setCart(cart.map(item => 
      item.id === itemId ? { ...item, specialInstructions: instructions } : item
    ))
  }

  // 計算總額
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = Math.round(subtotal * 0.1) // 10% 稅
  const total = subtotal + tax

  // 送出訂單
  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert('購物車是空的')
      return
    }

    if (!selectedTable) {
      alert('請先選擇桌位')
      return
    }

    setIsOrderPlacing(true)
    
    try {
      const selectedTableData = tables.find(t => t.id === selectedTable)
      const tableNumber = selectedTableData?.table_number || 0
      
      // 轉換購物車格式為訂單服務格式
      const cartItems: OrderCartItem[] = cart.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions
      }))

      // 使用新的訂單服務創建訂單
      const result = await orderService.createOrder(
        tableNumber,
        customerName || '匿名客戶',
        cartItems
      )

      if (result.success) {
        // 保存訂單信息並顯示支付界面
        setCurrentOrder(result.order)
        setShowPayment(true)
        
        // 清空購物車但保留訂單信息
        setCart([])
        setCustomerName('')
      } else {
        throw new Error(result.error || '創建訂單失敗')
      }
      
    } catch (error: any) {
      console.error('下單失敗:', error)
      alert(`下單失敗: ${error.message}`)
    } finally {
      setIsOrderPlacing(false)
    }
  }

  // 取得選中桌位資訊
  const selectedTableData = selectedTable ? tables.find(t => t.id === selectedTable) : null

  // 套餐選擇器組件
  const ComboSelector = () => {
    if (!selectedCombo || !showComboSelector) return null

    const handleSelectionToggle = (categoryId: string, product: any) => {
      const choice = comboChoices.find(c => c.category_id === categoryId)
      if (!choice) return

      const currentSelections = comboSelections[categoryId] || []
      const isSelected = currentSelections.some(p => p.id === product.id)

      if (isSelected) {
        // 移除選擇
        setComboSelections(prev => ({
          ...prev,
          [categoryId]: currentSelections.filter(p => p.id !== product.id)
        }))
      } else {
        // 添加選擇
        if (currentSelections.length < choice.max_selections) {
          setComboSelections(prev => ({
            ...prev,
            [categoryId]: [...currentSelections, product]
          }))
        }
      }
    }

    const canConfirm = () => {
      return comboChoices.every(choice => {
        const selections = comboSelections[choice.category_id] || []
        return selections.length >= choice.min_selections && selections.length <= choice.max_selections
      })
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-auto w-full">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            選擇套餐內容：{selectedCombo.name}
          </h2>
          <p className="mb-6 text-gray-600">
            套餐價格：NT$ {selectedCombo.price}
          </p>

          {comboChoices.map(choice => (
            <div key={choice.id} className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">
                {choice.category_name}
                <span className="text-sm text-gray-500 ml-2">
                  (請選擇 {choice.min_selections}-{choice.max_selections} 項)
                </span>
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {products
                  .filter(p => p.category_id === choice.category_id)
                  .map(product => {
                    const isSelected = (comboSelections[choice.category_id] || []).some(p => p.id === product.id)
                    return (
                      <div
                        key={product.id}
                        onClick={() => handleSelectionToggle(choice.category_id, product)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900 mb-1">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          原價: NT$ {product.price}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => {
                setShowComboSelector(false)
                setSelectedCombo(null)
                setComboSelections({})
              }}
              className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={() => addComboToCart(selectedCombo, comboSelections)}
              disabled={!canConfirm()}
              className={`flex-1 py-3 px-6 rounded-lg text-white font-medium transition-colors ${
                canConfirm() 
                  ? 'bg-blue-500 hover:bg-blue-600' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              確認加入購物車
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左側 - 產品選擇 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 訂單信息 */}
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">用餐人數</label>
                    <select
                      value={partySize}
                      onChange={(e) => setPartySize(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1,2,3,4,5,6,7,8].map(num => (
                        <option key={num} value={num}>{num} 人</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">選擇桌位</label>
                    <div className="text-sm">
                      {selectedTableData ? (
                        <span className="px-3 py-2 bg-green-100 text-green-800 rounded-md">
                          {selectedTableData.table_number}號桌 ({selectedTableData.capacity}人)
                        </span>
                      ) : (
                        <select
                          value={selectedTable || ''}
                          onChange={(e) => setSelectedTable(e.target.value || null)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">選擇桌位</option>
                          {tables.map((table) => (
                            <option key={table.id} value={table.id}>
                              {table.table_number}號桌 ({table.capacity}人)
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">客戶姓名 (選填)</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="輸入客戶姓名"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 分類選擇 */}
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">商品分類</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      selectedCategory === null
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    全部
                  </button>
                  <button
                    onClick={() => setSelectedCategory('combo')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      selectedCategory === 'combo'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    套餐
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 產品網格 */}
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">選擇商品</h3>
                {productsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* 套餐產品 */}
                    {(selectedCategory === null || selectedCategory === 'combo') &&
                      combos.map(combo => (
                        <div
                          key={combo.id}
                          onClick={() => handleComboClick(combo)}
                          className="p-4 border-2 border-red-300 rounded-lg hover:shadow-md hover:border-red-400 transition-all cursor-pointer bg-red-50"
                        >
                          {combo.image_url && (
                            <img
                              src={combo.image_url}
                              alt={combo.name}
                              className="w-full h-24 object-cover rounded-md mb-3"
                            />
                          )}
                          <h4 className="font-medium text-gray-900 mb-1">
                            🍽️ {combo.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">{combo.description}</p>
                          <div className="text-lg font-bold text-red-600">
                            NT${combo.price}
                          </div>
                          <div className="text-xs text-red-500 mt-1">
                            {combo.combo_type === 'fixed' ? '固定套餐' : '可選套餐'}
                          </div>
                        </div>
                      ))}

                    {/* 一般產品 */}
                    {products
                      .filter(product => 
                        product.is_available && 
                        (selectedCategory === null || 
                         (selectedCategory !== 'combo' && product.category_id === selectedCategory))
                      )
                      .map(product => (
                        <div
                          key={product.id}
                          onClick={() => addToCart(product.id)}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                        >
                          {product.image_url && (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-24 object-cover rounded-md mb-3"
                            />
                          )}
                          <h4 className="font-medium text-gray-900 mb-1">{product.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                          <div className="text-lg font-bold text-blue-600">
                            NT${product.price}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>

            {/* 右側 - 購物車 */}
            <div className="lg:col-span-1">
              <div className="bg-white p-4 rounded-lg shadow-sm border sticky top-6">
                <h3 className="text-lg font-semibold mb-4">購物車</h3>
                
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-2xl mb-2">🛒</div>
                    <div>購物車是空的</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* 購物車項目 */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {cart.map(item => (
                        <div 
                          key={item.id} 
                          className={`flex items-start justify-between p-3 border rounded-md ${
                            item.type === 'combo' 
                              ? 'border-red-200 bg-red-50' 
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {item.type === 'combo' ? '🍽️ ' : ''}{item.name}
                            </h4>
                            <p className="text-sm text-gray-600">NT${item.price}</p>
                            
                            {/* 套餐選擇顯示 */}
                            {item.type === 'combo' && item.combo_selections && (
                              <div className="text-xs text-gray-500 mt-1">
                                套餐內容已選擇
                              </div>
                            )}
                            
                            {/* 數量控制 */}
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 bg-gray-100 rounded text-sm hover:bg-gray-200"
                              >
                                −
                              </button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 bg-gray-100 rounded text-sm hover:bg-gray-200"
                              >
                                +
                              </button>
                            </div>
                            
                            {/* 特殊說明 */}
                            <input
                              type="text"
                              placeholder="特殊說明..."
                              value={item.specialInstructions || ''}
                              onChange={(e) => updateSpecialInstructions(item.id, e.target.value)}
                              className="w-full mt-2 px-2 py-1 text-xs border border-gray-300 rounded"
                            />
                          </div>
                          
                          <div className="text-right ml-3">
                            <div className="font-medium">NT${item.price * item.quantity}</div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 text-sm hover:text-red-700 mt-1"
                            >
                              移除
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 總計 */}
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>小計:</span>
                        <span>NT${subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>稅額 (10%):</span>
                        <span>NT${tax}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>總計:</span>
                        <span>NT${total}</span>
                      </div>
                    </div>

                    {/* 下單按鈕 */}
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isOrderPlacing || cart.length === 0}
                      className="w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {isOrderPlacing ? '下單中...' : '確認下單'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
      </div>

      {/* 支付模態框 */}
      {showPayment && currentOrder && (
        <IntegratedPayment
          order={currentOrder}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      )}

      {/* 套餐選擇器 */}
      <ComboSelector />
    </div>
  )
}

export default RealDataPOS

import React, { useState } from 'react'
import { Order, OrderItem } from '../types'
import { orderStore } from '../store/orderStore'
import { useSound } from '../hooks/useSound'
import SmartTableSelectorComponent from './SmartTableSelector'

// 產品數據
const products = [
  { id: 1, name: '經典牛肉漢堡', price: 180, category: '主餐', image: '🍔' },
  { id: 2, name: '雞腿排飯', price: 160, category: '主餐', image: '🍗' },
  { id: 3, name: '海鮮義大利麵', price: 220, category: '主餐', image: '🍝' },
  { id: 4, name: '凱薩沙拉', price: 120, category: '沙拉', image: '🥗' },
  { id: 5, name: '田園沙拉', price: 100, category: '沙拉', image: '🥬' },
  { id: 6, name: '水果沙拉', price: 110, category: '沙拉', image: '🍇' },
  { id: 7, name: '可樂', price: 35, category: '飲料', image: '🥤' },
  { id: 8, name: '咖啡', price: 60, category: '飲料', image: '☕' },
  { id: 9, name: '柳橙汁', price: 45, category: '飲料', image: '🧃' },
  { id: 10, name: '提拉米蘇', price: 80, category: '甜點', image: '🍰' },
  { id: 11, name: '巧克力蛋糕', price: 90, category: '甜點', image: '🎂' },
  { id: 12, name: '冰淇淋', price: 65, category: '甜點', image: '🍦' },
]

const categories = ['全部', '套餐', '主餐', '沙拉', '飲料', '甜點']

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  type: 'single' | 'combo'
  comboItems?: {
    main?: typeof products[0]
    salad?: typeof products[0]
    drink?: typeof products[0]
    dessert?: typeof products[0]
  }
  itemNotes?: string // 單個商品的備註
}

interface ComboSelection {
  main?: typeof products[0]
  salad?: typeof products[0]
  drink?: typeof products[0]
  dessert?: typeof products[0]
}

const POSSystem: React.FC = () => {
  const { playSound } = useSound()
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerInfo, setCustomerInfo] = useState({
    tableNumber: '',
    tableId: '', // 新增桌位ID
    customerName: '',
    notes: '',
    partySize: 2 // 新增用餐人數
  })
  const [showTableSelector, setShowTableSelector] = useState(false) // 新增桌位選擇器顯示狀態
  const [showComboModal, setShowComboModal] = useState(false)
  const [comboSelection, setComboSelection] = useState<ComboSelection>({})
  const [comboStep, setComboStep] = useState<'main' | 'salad' | 'drink' | 'dessert'>('main')
  const [showItemNotesModal, setShowItemNotesModal] = useState(false)
  const [selectedItemForNotes, setSelectedItemForNotes] = useState<{
    id: number
    type: 'single' | 'combo'
    index: number
  } | null>(null)
  const [tempItemNotes, setTempItemNotes] = useState('')

  const filteredProducts = selectedCategory === '全部' 
    ? products 
    : selectedCategory === '套餐'
    ? []
    : products.filter(p => p.category === selectedCategory)

  const getProductsByCategory = (category: string) => {
    return products.filter(p => p.category === category)
  }

  const addToCart = (product: typeof products[0]) => {
    playSound('click')
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.type === 'single')
      if (existing) {
        return prev.map(item => 
          item.id === product.id && item.type === 'single'
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1, type: 'single' }]
    })
  }

  const startComboSelection = () => {
    setComboSelection({})
    setComboStep('main')
    setShowComboModal(true)
  }

  const selectComboItem = (product: typeof products[0]) => {
    const newSelection = { ...comboSelection, [comboStep]: product }
    setComboSelection(newSelection)

    // 移到下一步
    if (comboStep === 'main') setComboStep('salad')
    else if (comboStep === 'salad') setComboStep('drink')
    else if (comboStep === 'drink') setComboStep('dessert')
    else {
      // 完成套餐選擇
      addComboToCart(newSelection)
    }
  }

  const addComboToCart = (selection: ComboSelection) => {
    if (selection.main && selection.salad && selection.drink && selection.dessert) {
      const comboItem: CartItem = {
        id: Date.now(), // 使用時間戳作為唯一ID
        name: '超值套餐',
        price: 299,
        quantity: 1,
        image: '🍽️',
        type: 'combo',
        comboItems: selection
      }
      setCart(prev => [...prev, comboItem])
      setShowComboModal(false)
      setComboSelection({})
    }
  }

  const updateQuantity = (id: number, quantity: number, type: 'single' | 'combo') => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => !(item.id === id && item.type === type)))
    } else {
      setCart(prev => prev.map(item => 
        item.id === id && item.type === type ? { ...item, quantity } : item
      ))
    }
  }

  const openItemNotesModal = (id: number, type: 'single' | 'combo', index: number) => {
    const item = cart.find((item, i) => item.id === id && item.type === type && i === index)
    setSelectedItemForNotes({ id, type, index })
    setTempItemNotes(item?.itemNotes || '')
    setShowItemNotesModal(true)
  }

  const saveItemNotes = () => {
    if (selectedItemForNotes) {
      setCart(prev => prev.map((item, index) => 
        item.id === selectedItemForNotes.id && 
        item.type === selectedItemForNotes.type && 
        index === selectedItemForNotes.index
          ? { ...item, itemNotes: tempItemNotes }
          : item
      ))
    }
    setShowItemNotesModal(false)
    setSelectedItemForNotes(null)
    setTempItemNotes('')
  }

  const cancelItemNotes = () => {
    setShowItemNotesModal(false)
    setSelectedItemForNotes(null)
    setTempItemNotes('')
  }

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const clearCart = () => {
    setCart([])
    setCustomerInfo({ tableNumber: '', tableId: '', customerName: '', notes: '', partySize: 2 })
  }

  // 處理桌位選擇
  const handleTableSelect = (tableId: string, tableNumber: string) => {
    setCustomerInfo(prev => ({ 
      ...prev, 
      tableId, 
      tableNumber 
    }))
    setShowTableSelector(false)
    playSound('click')
  }

  // 處理用餐人數變更
  const handlePartySizeChange = (size: number) => {
    setCustomerInfo(prev => ({ ...prev, partySize: size }))
  }

  const processOrder = () => {
    if (cart.length === 0) {
      playSound('error')
      alert('購物車是空的！')
      return
    }
    if (!customerInfo.tableId) {
      playSound('error')
      alert('請選擇桌位！')
      return
    }
    if (!customerInfo.partySize) {
      playSound('error')
      alert('請選擇用餐人數！')
      return
    }
    
    playSound('processing')
    
    // 生成訂單號和ID
    const orderNumber = `#${String(Date.now()).slice(-3).padStart(3, '0')}`
    const orderId = `order_${Date.now()}`
    
    // 轉換購物車項目為訂單項目格式
    const orderItems: OrderItem[] = cart.map(item => {
      // 從products數組中找到對應的category
      const product = products.find(p => p.id === item.id)
      return {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        type: item.type,
        comboItems: item.comboItems,
        notes: item.itemNotes, // 將 itemNotes 轉換為 notes
        category: product?.category
      }
    })
    
    // 構建完整訂單
    const newOrder: Order = {
      id: orderId,
      orderNumber,
      tableNumber: customerInfo.tableId, // 使用 tableId 作為 tableNumber
      customerName: customerInfo.customerName || undefined,
      items: orderItems,
      totalAmount: getTotalAmount(),
      status: 'pending',
      orderTime: new Date(),
      priority: 'normal', // 預設為一般優先級
      specialInstructions: customerInfo.notes || undefined
    }
    
    // 發送訂單到廚房系統
    orderStore.addOrder(newOrder)
    
    // 播放新訂單音效
    playSound('newOrder')
    
    let alertMessage = `✅ 訂單已送出至廚房！\n\n📋 訂單號：${orderNumber}\n🪑 桌號：${customerInfo.tableNumber}\n💰 總金額：$${getTotalAmount()}`
    
    if (customerInfo.customerName) {
      alertMessage += `\n👤 客戶：${customerInfo.customerName}`
    }
    
    if (customerInfo.notes) {
      alertMessage += `\n📝 備註：${customerInfo.notes}`
    }
    
    alertMessage += `\n\n🍳 請到廚房顯示系統查看訂單狀態`
    
    alert(alertMessage)
    clearCart()
  }

  const getStepTitle = () => {
    switch (comboStep) {
      case 'main': return '選擇主餐'
      case 'salad': return '選擇沙拉'
      case 'drink': return '選擇飲料'
      case 'dessert': return '選擇甜點'
      default: return ''
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      height: 'calc(100vh - 60px)', 
      backgroundColor: '#f8fafc' 
    }}>
      {/* 商品備註彈窗 */}
      {showItemNotesModal && selectedItemForNotes && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                📝 商品備註
              </h3>
              <button
                onClick={cancelItemNotes}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.5rem' }}>
                  商品：{cart[selectedItemForNotes.index]?.name}
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  為此商品添加特殊說明（例如：不要洋蔥、辣度調整、溫度要求等）
                </p>
              </div>

              <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                備註內容
              </label>
              <textarea
                value={tempItemNotes}
                onChange={(e) => setTempItemNotes(e.target.value)}
                placeholder="請輸入這個商品的特殊要求..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={cancelItemNotes}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                取消
              </button>
              <button
                onClick={saveItemNotes}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                儲存備註
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 套餐選擇彈窗 */}
      {showComboModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                🍽️ 超值套餐 - {getStepTitle()}
              </h3>
              <button
                onClick={() => setShowComboModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>

            {/* 進度指示器 */}
            <div style={{ display: 'flex', marginBottom: '1.5rem', gap: '0.5rem' }}>
              {['main', 'salad', 'drink', 'dessert'].map((step, index) => (
                <div
                  key={step}
                  style={{
                    flex: 1,
                    height: '4px',
                    backgroundColor: ['main', 'salad', 'drink', 'dessert'].indexOf(comboStep) >= index ? '#4f46e5' : '#e5e7eb',
                    borderRadius: '2px'
                  }}
                />
              ))}
            </div>

            {/* 已選擇的項目 */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>
                已選擇項目：
              </h4>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {comboSelection.main && (
                  <span style={{ padding: '0.25rem 0.5rem', background: '#dbeafe', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                    主餐: {comboSelection.main.name}
                  </span>
                )}
                {comboSelection.salad && (
                  <span style={{ padding: '0.25rem 0.5rem', background: '#dcfce7', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                    沙拉: {comboSelection.salad.name}
                  </span>
                )}
                {comboSelection.drink && (
                  <span style={{ padding: '0.25rem 0.5rem', background: '#fef3c7', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                    飲料: {comboSelection.drink.name}
                  </span>
                )}
                {comboSelection.dessert && (
                  <span style={{ padding: '0.25rem 0.5rem', background: '#fce7f3', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                    甜點: {comboSelection.dessert.name}
                  </span>
                )}
              </div>
            </div>

            {/* 當前步驟的商品選擇 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '1rem'
            }}>
              {getProductsByCategory(comboStep === 'main' ? '主餐' : comboStep === 'salad' ? '沙拉' : comboStep === 'drink' ? '飲料' : '甜點').map(product => (
                <div
                  key={product.id}
                  onClick={() => selectComboItem(product)}
                  style={{
                    background: 'white',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {product.image}
                  </div>
                  <h4 style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: 'bold', 
                    marginBottom: '0.25rem',
                    color: '#1f2937'
                  }}>
                    {product.name}
                  </h4>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                套餐總價：<span style={{ fontWeight: 'bold', color: '#059669' }}>$299</span>
                （原價：${comboSelection.main?.price || 0} + ${comboSelection.salad?.price || 0} + ${comboSelection.drink?.price || 0} + ${comboSelection.dessert?.price || 0} = $
                {(comboSelection.main?.price || 0) + (comboSelection.salad?.price || 0) + (comboSelection.drink?.price || 0) + (comboSelection.dessert?.price || 0)}）
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 左側 - 產品選擇區 */}
      <div style={{ flex: 2, padding: '1rem', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>
          🍽️ 餐廳點餐系統
        </h2>
        
        {/* 分類選擇 */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '1rem',
          flexWrap: 'wrap'
        }}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: selectedCategory === category ? '#4f46e5' : '#e5e7eb',
                color: selectedCategory === category ? 'white' : '#374151',
                cursor: 'pointer',
                fontWeight: selectedCategory === category ? 'bold' : 'normal',
                transition: 'all 0.2s ease'
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 套餐特別區域 */}
        {selectedCategory === '套餐' && (
          <div style={{ marginBottom: '2rem' }}>
            <div
              onClick={startComboSelection}
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(79, 70, 229, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.3)'
              }}
            >
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍽️</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                超值套餐
              </h3>
              <p style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '1rem' }}>
                主餐 + 沙拉 + 飲料 + 甜點
              </p>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                $299
              </div>
              <p style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.5rem' }}>
                點擊開始自由組合
              </p>
            </div>
          </div>
        )}

        {/* 產品網格 */}
        {selectedCategory !== '套餐' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {filteredProducts.map(product => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                style={{
                  background: 'white',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: '1px solid #e5e7eb'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '0.5rem' }}>
                  {product.image}
                </div>
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: 'bold', 
                  marginBottom: '0.25rem',
                  color: '#1f2937',
                  textAlign: 'center'
                }}>
                  {product.name}
                </h3>
                <p style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold', 
                  color: '#059669',
                  textAlign: 'center',
                  margin: 0
                }}>
                  ${product.price}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 右側 - 購物車和結帳區 */}
      <div style={{ 
        flex: 1, 
        background: 'white', 
        borderLeft: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 客戶資訊 */}
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
            📝 訂單資訊
          </h3>
          {/* 人數選擇 */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.25rem' }}>
              用餐人數 *
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map(size => (
                <button
                  key={size}
                  onClick={() => handlePartySizeChange(size)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: customerInfo.partySize === size ? '2px solid #3b82f6' : '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    backgroundColor: customerInfo.partySize === size ? '#eff6ff' : 'white',
                    color: customerInfo.partySize === size ? '#3b82f6' : '#374151',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    fontWeight: customerInfo.partySize === size ? '600' : '400',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {size}人
                </button>
              ))}
            </div>
          </div>

          {/* 桌位選擇 */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.25rem' }}>
              桌位選擇 *
            </label>
            {customerInfo.tableId ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                backgroundColor: '#f9fafb'
              }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                  已選擇: {customerInfo.tableId}
                </span>
                <button
                  onClick={() => setShowTableSelector(true)}
                  style={{
                    marginLeft: 'auto',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    color: '#3b82f6',
                    border: '1px solid #3b82f6',
                    borderRadius: '0.25rem',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  更換
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowTableSelector(true)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px dashed #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.color = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                🎯 點擊選擇桌位
              </button>
            )}
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.25rem' }}>
              客戶姓名
            </label>
            <input
              type="text"
              value={customerInfo.customerName}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, customerName: e.target.value }))}
              placeholder="選填"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            />
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.25rem' }}>
              備註說明
            </label>
            <textarea
              value={customerInfo.notes}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="特殊要求、過敏提醒等..."
              rows={3}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>

        {/* 購物車 */}
        <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
            🛒 購物車 ({cart.length})
          </h3>
          
          {cart.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#6b7280', 
              padding: '2rem',
              fontSize: '0.875rem'
            }}>
              購物車是空的<br />
              點擊左側商品來添加
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {cart.map((item, index) => (
                <button
                  key={`${item.id}-${item.type}-${index}`}
                  onClick={() => openItemNotesModal(item.id, item.type, index)}
                  style={{
                    padding: '0.75rem',
                    background: '#f8fafc',
                    borderRadius: '0.5rem',
                    border: item.itemNotes ? '2px solid #4f46e5' : '1px solid #e5e7eb',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f1f5f9'
                    e.currentTarget.style.borderColor = '#4f46e5'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8fafc'
                    e.currentTarget.style.borderColor = item.itemNotes ? '#4f46e5' : '#e5e7eb'
                  }}
                >
                  {/* 備註指示器 */}
                  {item.itemNotes && (
                    <div style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      background: '#4f46e5',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      📝
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: item.type === 'combo' || item.itemNotes ? '0.5rem' : 0 }}>
                    <div style={{ fontSize: '1.5rem' }}>{item.image}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#1f2937' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#059669' }}>
                        ${item.price} x {item.quantity}
                      </div>
                    </div>
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.type)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: '1px solid #d1d5db',
                          background: 'white',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.875rem', fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.type)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: '1px solid #d1d5db',
                          background: 'white',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {/* 套餐詳情 */}
                  {item.type === 'combo' && item.comboItems && (
                    <div style={{ 
                      marginTop: '0.5rem', 
                      padding: '0.5rem', 
                      background: 'white', 
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      marginBottom: item.itemNotes ? '0.5rem' : 0
                    }}>
                      <div>主餐: {item.comboItems.main?.name}</div>
                      <div>沙拉: {item.comboItems.salad?.name}</div>
                      <div>飲料: {item.comboItems.drink?.name}</div>
                      <div>甜點: {item.comboItems.dessert?.name}</div>
                    </div>
                  )}

                  {/* 商品備註顯示 */}
                  {item.itemNotes && (
                    <div style={{
                      padding: '0.5rem',
                      background: '#ede9fe',
                      border: '1px solid #c4b5fd',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      color: '#5b21b6'
                    }}>
                      <span style={{ fontWeight: 'bold' }}>📝 備註：</span>
                      {item.itemNotes}
                    </div>
                  )}

                  {/* 點擊提示 */}
                  <div style={{
                    fontSize: '0.625rem',
                    color: '#9ca3af',
                    textAlign: 'center',
                    marginTop: '0.25rem',
                    fontStyle: 'italic'
                  }}>
                    {item.itemNotes ? '點擊修改備註' : '點擊添加備註'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 結帳區 */}
        <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem',
            fontSize: '1.25rem',
            fontWeight: 'bold'
          }}>
            <span>總計：</span>
            <span style={{ color: '#059669' }}>${getTotalAmount()}</span>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={clearCart}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              清空
            </button>
            <button
              onClick={processOrder}
              style={{
                flex: 2,
                padding: '0.75rem',
                background: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              送出訂單
            </button>
          </div>
        </div>
      </div>

      {/* 桌位選擇器模態窗口 */}
      {showTableSelector && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            maxWidth: '900px',
            maxHeight: '80vh',
            width: '90%',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: 0
              }}>
                🎯 智能桌位選擇
              </h2>
              <button
                onClick={() => setShowTableSelector(false)}
                style={{
                  padding: '0.5rem',
                  border: 'none',
                  borderRadius: '0.375rem',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  width: '2rem',
                  height: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
            
            <SmartTableSelectorComponent
              partySize={customerInfo.partySize}
              onTableSelect={handleTableSelect}
              selectedTableId={customerInfo.tableId}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default POSSystem

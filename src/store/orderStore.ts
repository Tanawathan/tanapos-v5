import { Order } from '../types'

// 簡單的全局狀態管理
class OrderStore {
  private orders: Order[] = []
  private listeners: Array<(orders: Order[]) => void> = []

  // 添加新訂單
  addOrder(order: Order) {
    this.orders.push(order)
    this.notifyListeners()
    console.log('🍽️ 新訂單已加入廚房系統:', order)
  }

  // 獲取所有訂單
  getOrders(): Order[] {
    return [...this.orders]
  }

  // 更新訂單狀態
  updateOrderStatus(orderId: string, status: Order['status']) {
    const order = this.orders.find(o => o.id === orderId)
    if (order) {
      order.status = status
      this.notifyListeners()
      console.log(`📋 訂單 ${order.orderNumber} 狀態更新為: ${status}`)
    }
  }

  // 更新項目完成狀態
  updateItemCompletion(orderId: string, itemIndex: number, completed: boolean) {
    const order = this.orders.find(o => o.id === orderId)
    if (order) {
      if (!order.itemCompletionStatus) {
        order.itemCompletionStatus = {}
      }
      order.itemCompletionStatus[itemIndex.toString()] = completed
      this.notifyListeners()
      console.log(`✅ 訂單 ${order.orderNumber} 項目 ${itemIndex} 完成狀態: ${completed}`)
    }
  }

  // 更新套餐組件完成狀態
  updateComboItemCompletion(orderId: string, itemIndex: number, comboType: string, completed: boolean) {
    const order = this.orders.find(o => o.id === orderId)
    if (order) {
      if (!order.comboItemCompletionStatus) {
        order.comboItemCompletionStatus = {}
      }
      if (!order.comboItemCompletionStatus[itemIndex.toString()]) {
        order.comboItemCompletionStatus[itemIndex.toString()] = {}
      }
      order.comboItemCompletionStatus[itemIndex.toString()][comboType] = completed
      this.notifyListeners()
      console.log(`✅ 訂單 ${order.orderNumber} 套餐項目 ${itemIndex} 的 ${comboType} 完成狀態: ${completed}`)
    }
  }

  // 更新廚房狀態
  updateKitchenStatus(orderId: string, status: 'pending' | 'preparing' | 'ready') {
    const order = this.orders.find(o => o.id === orderId)
    if (order) {
      order.kitchenStatus = status
      this.notifyListeners()
      console.log(`🍳 訂單 ${order.orderNumber} 廚房狀態更新為: ${status}`)
    }
  }

  // 更新吧台狀態
  updateBarStatus(orderId: string, status: 'pending' | 'preparing' | 'ready') {
    const order = this.orders.find(o => o.id === orderId)
    if (order) {
      order.barStatus = status
      this.notifyListeners()
      console.log(`🍹 訂單 ${order.orderNumber} 吧台狀態更新為: ${status}`)
    }
  }

  // 更新等餐後甜點狀態
  updateDessertAfterMealStatus(orderId: string, status: 'waiting' | 'ready' | 'served') {
    const order = this.orders.find(o => o.id === orderId)
    if (order) {
      order.dessertAfterMealStatus = status
      this.notifyListeners()
      console.log(`🍰 訂單 ${order.orderNumber} 等餐後甜點狀態更新為: ${status}`)
    }
  }

  // 訂閱狀態變化
  subscribe(listener: (orders: Order[]) => void) {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // 通知所有監聽者
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getOrders()))
  }

  // 初始化一些模擬數據
  initMockData() {
    const mockOrders: Order[] = [
      {
        id: '1',
        orderNumber: '#001',
        tableNumber: 'A-05',
        customerName: '王小明',
        items: [
          {
            id: 1,
            name: '超值套餐',
            price: 299,
            quantity: 1,
            image: '🍽️',
            type: 'combo',
            comboItems: {
              main: { id: 1, name: '經典牛肉漢堡', price: 180, category: '主餐', image: '🍔' },
              salad: { id: 4, name: '凱薩沙拉', price: 120, category: '沙拉', image: '🥗' },
              drink: { id: 7, name: '可樂', price: 35, category: '飲料', image: '🥤' },
              dessert: { id: 10, name: '提拉米蘇', price: 80, category: '甜點', image: '🍰' }
            }
          },
          {
            id: 8,
            name: '咖啡',
            price: 60,
            quantity: 2,
            image: '☕',
            type: 'single'
          }
        ],
        totalAmount: 419,
        status: 'pending',
        orderTime: new Date(Date.now() - 5 * 60000), // 5分鐘前
        estimatedTime: 15,
        priority: 'normal',
        comboItemCompletionStatus: {
          '0': {
            'main': false,   // 主餐未完成
            'salad': true,   // 沙拉已完成
            'drink': true,   // 飲料已完成  
            'dessert': false // 甜點未完成
          }
        },
        itemCompletionStatus: {
          '1': false // 咖啡未完成
        }
      },
      {
        id: '2',
        orderNumber: '#002',
        tableNumber: 'B-12',
        customerName: '李小華',
        items: [
          {
            id: 3,
            name: '海鮮義大利麵',
            price: 220,
            quantity: 1,
            image: '🍝',
            type: 'single'
          },
          {
            id: 5,
            name: '田園沙拉',
            price: 100,
            quantity: 1,
            image: '🥬',
            type: 'single'
          }
        ],
        totalAmount: 320,
        status: 'preparing',
        orderTime: new Date(Date.now() - 12 * 60000), // 12分鐘前
        estimatedTime: 8,
        priority: 'urgent',
        specialInstructions: '不要洋蔥，辣度加重',
        itemCompletionStatus: {
          '0': true, // 第一個項目已完成
          '2': false // 第三個項目未完成
        }
      },
      {
        id: '3',
        orderNumber: '#003',
        tableNumber: 'C-08',
        items: [
          {
            id: 5,
            name: '超值套餐',
            price: 299,
            quantity: 2,
            image: '🍽️',
            type: 'combo',
            comboItems: {
              main: { id: 2, name: '雞腿排飯', price: 160, category: '主餐', image: '🍗' },
              salad: { id: 6, name: '水果沙拉', price: 110, category: '沙拉', image: '🍇' },
              drink: { id: 9, name: '柳橙汁', price: 45, category: '飲料', image: '🧃' },
              dessert: { id: 12, name: '冰淇淋', price: 65, category: '甜點', image: '🍦' }
            }
          }
        ],
        totalAmount: 598,
        status: 'ready',
        orderTime: new Date(Date.now() - 20 * 60000), // 20分鐘前
        priority: 'vip',
        comboItemCompletionStatus: {
          '0': {
            'main': true,    // 主餐已完成
            'salad': true,   // 沙拉已完成
            'drink': false,  // 飲料未完成
            'dessert': false // 甜點未完成
          }
        }
      }
    ]

    this.orders = mockOrders
    this.notifyListeners()
  }
}

// 創建全局實例
export const orderStore = new OrderStore()

// 在開發環境下初始化模擬數據
if (process.env.NODE_ENV === 'development') {
  orderStore.initMockData()
}

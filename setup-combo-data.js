// 套餐數據初始化腳本
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'
)

async function setupComboData() {
  console.log('🍽️ 開始設置套餐數據...')

  try {
    // 1. 確保有基本分類
    const categories = [
      { id: 'cat-1', name: '主餐', description: '主要餐點' },
      { id: 'cat-2', name: '配菜', description: '配菜類' },
      { id: 'cat-3', name: '飲品', description: '飲料類' },
      { id: 'cat-4', name: '甜點', description: '甜點類' }
    ]

    console.log('📂 設置分類...')
    for (const category of categories) {
      await supabase.from('categories').upsert(category)
    }

    // 2. 確保有基本產品
    const products = [
      { id: 'prod-1', name: '經典漢堡', description: '牛肉漢堡配生菜番茄', price: 120, category_id: 'cat-1', is_available: true },
      { id: 'prod-2', name: '雞腿堡', description: '炸雞腿漢堡', price: 110, category_id: 'cat-1', is_available: true },
      { id: 'prod-3', name: '薯條', description: '酥脆黃金薯條', price: 60, category_id: 'cat-2', is_available: true },
      { id: 'prod-4', name: '雞塊', description: '酥脆雞塊 6 塊', price: 80, category_id: 'cat-2', is_available: true },
      { id: 'prod-5', name: '可樂', description: '冰涼可樂', price: 35, category_id: 'cat-3', is_available: true },
      { id: 'prod-6', name: '奶昔', description: '香草奶昔', price: 65, category_id: 'cat-3', is_available: true },
      { id: 'prod-7', name: '蘋果派', description: '熱騰騰蘋果派', price: 45, category_id: 'cat-4', is_available: true },
      { id: 'prod-8', name: '冰淇淋', description: '香草冰淇淋', price: 40, category_id: 'cat-4', is_available: true }
    ]

    console.log('🍕 設置產品...')
    for (const product of products) {
      await supabase.from('products').upsert(product)
    }

    // 3. 創建套餐產品
    const combos = [
      {
        id: 'combo-1',
        name: '經典套餐',
        description: '經典漢堡 + 薯條 + 飲品',
        price: 180,
        category_id: 'cat-1',
        is_available: true,
        combo_type: 'fixed'
      },
      {
        id: 'combo-2',
        name: '自選套餐',
        description: '任選主餐 + 配菜 + 飲品 + 甜點',
        price: 250,
        category_id: 'cat-1',
        is_available: true,
        combo_type: 'selectable'
      },
      {
        id: 'combo-3',
        name: '雞肉套餐',
        description: '雞腿堡 + 雞塊 + 飲品',
        price: 200,
        category_id: 'cat-1',
        is_available: true,
        combo_type: 'fixed'
      }
    ]

    console.log('🍽️ 設置套餐產品...')
    for (const combo of combos) {
      await supabase.from('combo_products').upsert(combo)
    }

    // 4. 創建可選套餐的選擇規則
    const comboChoices = [
      {
        id: 'choice-1',
        combo_id: 'combo-2',
        category_id: 'cat-1',
        min_selections: 1,
        max_selections: 1
      },
      {
        id: 'choice-2',
        combo_id: 'combo-2',
        category_id: 'cat-2',
        min_selections: 1,
        max_selections: 2
      },
      {
        id: 'choice-3',
        combo_id: 'combo-2',
        category_id: 'cat-3',
        min_selections: 1,
        max_selections: 1
      },
      {
        id: 'choice-4',
        combo_id: 'combo-2',
        category_id: 'cat-4',
        min_selections: 0,
        max_selections: 1
      }
    ]

    console.log('⚙️ 設置套餐選擇規則...')
    for (const choice of comboChoices) {
      await supabase.from('combo_choices').upsert(choice)
    }

    console.log('✅ 套餐數據設置完成！')
    console.log('')
    console.log('📋 套餐列表：')
    console.log('• 經典套餐 (固定套餐) - NT$ 180')
    console.log('• 自選套餐 (可選套餐) - NT$ 250')
    console.log('• 雞肉套餐 (固定套餐) - NT$ 200')
    console.log('')
    console.log('🎯 測試步驟：')
    console.log('1. 訪問 RealDataPOS 頁面')
    console.log('2. 點擊 "套餐" 分類')
    console.log('3. 選擇 "自選套餐" 測試套餐選擇器')
    console.log('4. 在選擇器中選擇不同分類的產品')
    console.log('5. 確認加入購物車')

  } catch (error) {
    console.error('❌ 設置套餐數據失敗:', error)
  }
}

setupComboData()

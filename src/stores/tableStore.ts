import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { Table, TableStatus, TableStatistics } from '../types'

interface TableStore {
  // 狀態
  tables: Table[]
  filteredTables: Table[]
  statistics: TableStatistics
  filterStatus: TableStatus | 'all'
  searchQuery: string
  selectedTable: Table | null
  isQuickOrderModalOpen: boolean

  // 動作
  initializeTables: () => void
  setFilterStatus: (status: TableStatus | 'all') => void
  setSearchQuery: (query: string) => void
  setSelectedTable: (table: Table | null) => void
  openQuickOrderModal: () => void
  closeQuickOrderModal: () => void
  updateTableStatus: (tableId: string, status: TableStatus) => void
  addTableNote: (tableId: string, note: string) => void
  setEstimatedLeaveTime: (tableId: string, time: Date) => void
  updateTableCustomersCount: (tableId: string, count: number) => void
  calculateStatistics: () => void
  filterTables: () => void
}

// 初始桌位資料生成器
const generateInitialTables = (): Table[] => {
  const tables: Table[] = []
  
  // A區 - 2人桌
  for (let i = 1; i <= 8; i++) {
    tables.push({
      id: `A${i}`,
      number: `A${i}`,
      capacity: 2,
      area: 'A區',
      status: 'available',
      lastStatusChange: new Date()
    })
  }

  // B區 - 4人桌
  for (let i = 1; i <= 10; i++) {
    tables.push({
      id: `B${i}`,
      number: `B${i}`,
      capacity: 4,
      area: 'B區',
      status: 'available',
      lastStatusChange: new Date()
    })
  }

  // C區 - 6人桌
  for (let i = 1; i <= 6; i++) {
    tables.push({
      id: `C${i}`,
      number: `C${i}`,
      capacity: 6,
      area: 'C區',
      status: 'available',
      lastStatusChange: new Date()
    })
  }

  // 設定一些初始狀態作為示範
  tables[0].status = 'dining'
  tables[0].seatedTime = new Date(Date.now() - 45 * 60 * 1000) // 45分鐘前入座
  tables[0].customersCount = 2
  tables[0].totalAmount = 850

  tables[5].status = 'seated'
  tables[5].seatedTime = new Date(Date.now() - 5 * 60 * 1000) // 5分鐘前入座
  tables[5].customersCount = 4

  tables[12].status = 'cleaning'
  tables[12].lastStatusChange = new Date(Date.now() - 10 * 60 * 1000) // 10分鐘前需要清理

  tables[18].status = 'reserved'
  tables[18].notes = '18:30預約'

  return tables
}

export const useTableStore = create<TableStore>()(
  subscribeWithSelector((set, get) => ({
    // 初始狀態
    tables: [],
    filteredTables: [],
    statistics: {
      totalTables: 0,
      usedTables: 0,
      availableRate: 0,
      averageDiningTime: 0,
      turnoverRate: 0,
      cleaningTables: 0
    },
    filterStatus: 'all',
    searchQuery: '',
    selectedTable: null,
    isQuickOrderModalOpen: false,

    // 初始化桌位
    initializeTables: () => {
      const tables = generateInitialTables()
      set({ tables })
      get().calculateStatistics()
      get().filterTables()
    },

    // 設定篩選狀態
    setFilterStatus: (status) => {
      set({ filterStatus: status })
      get().filterTables()
    },

    // 設定搜尋關鍵字
    setSearchQuery: (query) => {
      set({ searchQuery: query })
      get().filterTables()
    },

    // 設定選中的桌位
    setSelectedTable: (table) => {
      set({ selectedTable: table })
    },

    // 開啟快速點餐彈窗
    openQuickOrderModal: () => {
      set({ isQuickOrderModalOpen: true })
    },

    // 關閉快速點餐彈窗
    closeQuickOrderModal: () => {
      set({ 
        isQuickOrderModalOpen: false,
        selectedTable: null
      })
    },

    // 更新桌位狀態
    updateTableStatus: (tableId, status) => {
      set((state) => ({
        tables: state.tables.map((table) =>
          table.id === tableId
            ? {
                ...table,
                status,
                lastStatusChange: new Date(),
                seatedTime: status === 'seated' ? new Date() : table.seatedTime,
                customersCount: status === 'available' ? undefined : table.customersCount
              }
            : table
        )
      }))
      get().calculateStatistics()
      get().filterTables()
    },

    // 添加桌位備註
    addTableNote: (tableId, note) => {
      set((state) => ({
        tables: state.tables.map((table) =>
          table.id === tableId ? { ...table, notes: note } : table
        )
      }))
      get().filterTables()
    },

    // 設定預估離開時間
    setEstimatedLeaveTime: (tableId, time) => {
      set((state) => ({
        tables: state.tables.map((table) =>
          table.id === tableId ? { ...table, estimatedLeaveTime: time } : table
        )
      }))
      get().filterTables()
    },

    // 更新桌位人數
    updateTableCustomersCount: (tableId, count) => {
      set((state) => ({
        tables: state.tables.map((table) =>
          table.id === tableId ? { ...table, customersCount: count } : table
        )
      }))
      get().filterTables()
    },

    // 計算統計資訊
    calculateStatistics: () => {
      const { tables } = get()
      const totalTables = tables.length
      const usedTables = tables.filter(t => t.status !== 'available').length
      const availableRate = totalTables > 0 ? ((totalTables - usedTables) / totalTables) * 100 : 0
      const cleaningTables = tables.filter(t => t.status === 'cleaning').length

      // 計算平均用餐時間
      const diningTables = tables.filter(t => t.status === 'dining' && t.seatedTime)
      const avgDiningTime = diningTables.length > 0
        ? diningTables.reduce((acc, table) => {
            if (table.seatedTime) {
              return acc + (Date.now() - table.seatedTime.getTime()) / (1000 * 60)
            }
            return acc
          }, 0) / diningTables.length
        : 0

      // 簡單的翻桌率計算（這裡可以根據實際需求調整）
      const turnoverRate = totalTables > 0 ? (usedTables / totalTables) * 2.5 : 0

      set({
        statistics: {
          totalTables,
          usedTables,
          availableRate: Math.round(availableRate),
          averageDiningTime: Math.round(avgDiningTime),
          turnoverRate: Math.round(turnoverRate * 10) / 10,
          cleaningTables
        }
      })
    },

    // 篩選桌位
    filterTables: () => {
      const { tables, filterStatus, searchQuery } = get()
      
      let filtered = tables

      // 按狀態篩選
      if (filterStatus !== 'all') {
        filtered = filtered.filter(table => table.status === filterStatus)
      }

      // 按搜尋關鍵字篩選
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        filtered = filtered.filter(table => 
          table.number.toLowerCase().includes(query) ||
          table.area?.toLowerCase().includes(query) ||
          table.notes?.toLowerCase().includes(query)
        )
      }

      set({ filteredTables: filtered })
    }
  }))
)

// 訂閱狀態變化，自動重新計算
useTableStore.subscribe(
  (state) => state.tables,
  () => {
    useTableStore.getState().calculateStatistics()
  }
)

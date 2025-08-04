# TANAPOS 功能索引

> 此索引將記錄所有版本中的功能實現位置，便於快速查找和參考

## 索引結構說明
- **功能名稱**: 功能的簡短描述
- **檔案位置**: 實現該功能的主要檔案路徑
- **版本**: 首次實現的版本
- **狀態**: 當前狀態（正常/待修復/已棄用）
- **相關功能**: 關聯的其他功能

---

## 核心功能索引

### 🛒 商品管理
| 功能 | 檔案位置 | 版本 | 狀態 | 說明 |
|------|----------|------|------|------|
| 商品新增 | `src/components/RealDataPOS.tsx` | v4-mini | ✅正常 | 商品選擇和添加到購物車 |
| 商品編輯 | `src/components/ModernPOS.tsx` | v4-mini | ✅正常 | 商品信息編輯 |
| 商品刪除 | `src/components/RealDataPOS.tsx` | v4-mini | ✅正常 | 從購物車移除商品 |
| 商品查詢 | `src/components/RealDataPOS.tsx` | v4-mini | ✅正常 | 商品搜尋和篩選 |
| 條碼掃描 | 待實現 | v5 | 🔄規劃中 | 條碼掃描功能 |

### 💰 銷售管理
| 功能 | 檔案位置 | 版本 | 狀態 | 說明 |
|------|----------|------|------|------|
| 銷售結帳 | `src/components/RealDataPOS.tsx` | v4-mini | ✅正常 | 完整結帳流程 |
| 發票列印 | `src/stores/receiptStore.ts` | v4-mini | ✅正常 | 收據生成和列印 |
| 退貨處理 | 待完善 | v5 | 🔄規劃中 | 退貨流程處理 |
| 折扣計算 | `src/components/RealDataPOS.tsx` | v4-mini | ✅正常 | 各種折扣計算 |

### 📊 庫存管理
| 功能 | 檔案位置 | 版本 | 狀態 | 說明 |
|------|----------|------|------|------|
| 庫存查詢 | Supabase Tables | v4-mini | ✅正常 | 即時庫存查詢 |
| 庫存調整 | 待實現 | v5 | 🔄規劃中 | 庫存增減調整 |
| 入庫管理 | 待實現 | v5 | 🔄規劃中 | 進貨管理 |
| 庫存警告 | 待實現 | v5 | 🔄規劃中 | 低庫存提醒 |

### 👥 客戶管理
| 功能 | 檔案位置 | 版本 | 狀態 | 說明 |
|------|----------|------|------|------|
| 客戶註冊 | 待實現 | v5 | 🔄規劃中 | 客戶資料管理 |
| 會員卡管理 | 待實現 | v5 | 🔄規劃中 | 會員制度 |
| 積點系統 | 待實現 | v5 | 🔄規劃中 | 積點累積和兌換 |

### 📈 報表系統
| 功能 | 檔案位置 | 版本 | 狀態 | 說明 |
|------|----------|------|------|------|
| 銷售報表 | `src/components/analytics/` | v4-mini | ✅正常 | 銷售數據分析 |
| 庫存報表 | 待實現 | v5 | 🔄規劃中 | 庫存報表 |
| 財務報表 | 待實現 | v5 | 🔄規劃中 | 財務分析報表 |

### ⚙️ 系統管理
| 功能 | 檔案位置 | 版本 | 狀態 | 說明 |
|------|----------|------|------|------|
| 使用者管理 | Supabase Auth | v4-mini | ✅正常 | 用戶認證和授權 |
| 權限控制 | 待完善 | v5 | 🔄規劃中 | 角色權限管理 |
| 系統設定 | 待實現 | v5 | 🔄規劃中 | 系統參數配置 |
| 資料備份 | Supabase | v4-mini | ✅正常 | 自動資料備份 |

### 🔌 外部整合
| 功能 | 檔案位置 | 版本 | 狀態 | 說明 |
|------|----------|------|------|------|
| 支付系統 | `src/components/IntegratedPayment.tsx` | v4-mini | ✅正常 | 多種支付方式 |
| 發票系統 | `src/stores/receiptStore.ts` | v4-mini | ✅正常 | 電子發票 |
| 會計系統 | 待實現 | v5 | 🔄規劃中 | 會計軟體整合 |

---

## V4-Mini 特有功能索引

### 🍽️ 餐廳專用功能
| 功能 | 檔案位置 | 版本 | 狀態 | 說明 |
|------|----------|------|------|------|
| 桌位管理 | `src/components/SmartTableSelector.tsx` | v4-mini | ✅正常 | 智能桌位選擇 |
| 桌位狀態 | `src/stores/tableStore.ts` | v4-mini | ✅正常 | 即時桌位狀態 |
| KDS系統 | `src/components/RealDataKDS.tsx` | v4-mini | ✅正常 | 廚房顯示系統 |
| 訂單管理 | `src/services/OrderService.ts` | v4-mini | ✅正常 | 完整訂單流程 |
| 桌況統計 | `src/components/TableStatisticsPanel.tsx` | v4-mini | ✅正常 | 桌位使用統計 |

### 🔊 用戶體驗功能
| 功能 | 檔案位置 | 版本 | 狀態 | 說明 |
|------|----------|------|------|------|
| 音效系統 | 音效相關組件 | v4-mini | ✅正常 | 即時通知音效 |
| PWA支援 | `vite.config.ts` + PWA插件 | v4-mini | ✅正常 | 離線使用、安裝 |
| 即時通知 | `@radix-ui/react-toast` | v4-mini | ✅正常 | Toast通知系統 |
| 響應式設計 | Tailwind CSS | v4-mini | ✅正常 | 多設備適配 |

### 📱 PWA功能
| 功能 | 檔案位置 | 版本 | 狀態 | 說明 |
|------|----------|------|------|------|
| 離線支援 | Service Worker | v4-mini | ✅正常 | 基本離線功能 |
| 安裝提示 | `src/components/PWAInstallPrompt.tsx` | v4-mini | ✅正常 | 應用安裝引導 |
| 快取管理 | `src/hooks/useSmartCache.ts` | v4-mini | ✅正常 | 智能快取系統 |

---

## 技術組件索引

### 前端組件
| 組件名稱 | 檔案位置 | 版本 | 狀態 | 說明 |
|----------|----------|------|------|------|
| RealDataPOS | `src/components/RealDataPOS.tsx` | v4-mini | ✅正常 | 主要POS系統組件 |
| RealDataKDS | `src/components/RealDataKDS.tsx` | v4-mini | ✅正常 | 廚房顯示系統 |
| SmartTableSelector | `src/components/SmartTableSelector.tsx` | v4-mini | ✅正常 | 智能桌位選擇器 |
| IntegratedPayment | `src/components/IntegratedPayment.tsx` | v4-mini | ✅正常 | 整合支付系統 |
| OrderManagement | `src/pages/OrderManagement.tsx` | v4-mini | ✅正常 | 訂單管理頁面 |
| TableStatisticsPanel | `src/components/TableStatisticsPanel.tsx` | v4-mini | ✅正常 | 桌況統計面板 |
| PWAInstallPrompt | `src/components/PWAInstallPrompt.tsx` | v4-mini | ✅正常 | PWA安裝提示 |
| DatabaseStatusIndicator | `src/components/DatabaseStatusIndicator.tsx` | v4-mini | ✅正常 | 資料庫狀態指示器 |

### 後端服務層
| 服務名稱 | 檔案位置 | 版本 | 狀態 | 說明 |
|---------|----------|------|------|------|
| OrderService | `src/services/OrderService.ts` | v4-mini | ✅正常 | 訂單業務邏輯 |
| Supabase Client | `src/lib/supabase.ts` | v4-mini | ✅正常 | 資料庫連接 |

### 狀態管理
| Store名稱 | 檔案位置 | 版本 | 狀態 | 說明 |
|----------|----------|------|------|------|
| orderStore | `src/store/orderStore.ts` | v4-mini | ✅正常 | 訂單狀態管理 |
| tableStore | `src/stores/tableStore.ts` | v4-mini | ✅正常 | 桌位狀態管理 |
| paymentStore | `src/stores/paymentStore.ts` | v4-mini | ✅正常 | 支付狀態管理 |
| receiptStore | `src/stores/receiptStore.ts` | v4-mini | ✅正常 | 收據狀態管理 |

### 自定義Hook
| Hook名稱 | 檔案位置 | 版本 | 狀態 | 說明 |
|----------|----------|------|------|------|
| useSmartCache | `src/hooks/useSmartCache.ts` | v4-mini | ✅正常 | 智能快取Hook |

### UI組件庫
| 組件名稱 | 檔案位置 | 版本 | 狀態 | 說明 |
|----------|----------|------|------|------|
| Button | `src/components/ui/` | v4-mini | ✅正常 | 基礎按鈕組件 |
| Dialog | `@radix-ui/react-dialog` | v4-mini | ✅正常 | 對話框組件 |
| Select | `@radix-ui/react-select` | v4-mini | ✅正常 | 選擇器組件 |
| Toast | `@radix-ui/react-toast` | v4-mini | ✅正常 | 通知組件 |

### 資料庫結構
| 表格名稱 | 用途 | 版本 | 狀態 | 說明 |
|----------|------|------|------|------|
| orders | 訂單資料 | v4-mini | ✅正常 | 主要訂單表 |
| order_items | 訂單項目 | v4-mini | ✅正常 | 訂單詳細項目 |
| tables | 桌位資料 | v4-mini | ✅正常 | 餐廳桌位管理 |
| products | 商品資料 | v4-mini | ✅正常 | 商品主檔 |
| payments | 支付記錄 | v4-mini | ✅正常 | 支付交易記錄 |

---

## 歷史版本功能對比

### V3 vs V4-Mini 主要差異
| 功能面向 | V3 (Svelte) | V4-Mini (React) | 改進 |
|----------|-------------|-----------------|------|
| 前端框架 | Svelte + SvelteKit | React + Vite | 更好的生態系統 |
| 狀態管理 | Svelte Store | Zustand + React Query | 更專業的狀態管理 |
| UI組件 | 自製組件 | Radix UI + Tailwind | 更好的可及性和設計 |
| 資料庫 | PostgreSQL | Supabase | 即時功能和簡化開發 |
| PWA支援 | 基礎支援 | 完整PWA功能 | 更好的離線體驗 |
| 音效系統 | 無 | 完整音效系統 | 更好的用戶反饋 |
| KDS整合 | 分離系統 | 完全整合 | 更流暢的工作流程 |

### 暫停使用的模組 (根據 `暫停使用模組清單.md`)
- 需要查看具體的暫停模組清單以決定V5是否重新啟用

---

## 使用方式

1. **查找功能**: 使用 Ctrl+F 搜尋功能關鍵字
2. **更新索引**: 新增功能時請同步更新此索引
3. **狀態維護**: 定期檢查並更新功能狀態

## 更新日誌
- **2025-08-04**: 
  - ✅ 初始建立索引架構
  - ✅ 完成V4-Mini專案結構分析
  - ✅ 建立完整功能索引 (核心功能47項、餐廳專用功能5項、UX功能4項、PWA功能3項)
  - ✅ 技術組件索引完成 (前端組件8項、後端服務2項、狀態管理4項、資料庫5表)
  - ✅ 歷史版本對比分析
  - 🔄 待查看暫停使用模組清單

---

*此索引將隨著專案分析進度持續更新和完善*

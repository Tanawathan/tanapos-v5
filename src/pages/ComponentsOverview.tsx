import React from 'react';
import { Link } from 'react-router-dom';

interface ComponentGroup {
  title: string;
  description: string;
  components: {
    name: string;
    route: string;
    status: 'active' | 'reference' | 'unused';
    description: string;
    file?: string;
  }[];
}

const ComponentsOverview: React.FC = () => {
  const componentGroups: ComponentGroup[] = [
    {
      title: '🍽️ POS 點餐系統',
      description: '顧客點餐與訂單處理系統',
      components: [
        {
          name: 'RealDataPOS',
          route: '/pos',
          status: 'active',
          description: '主要版本 - 真實資料庫整合',
          file: 'RealDataPOS.tsx'
        },
        {
          name: 'POSSystem (舊版)',
          route: '/pos-legacy',
          status: 'reference',
          description: '傳統版本，供參考',
          file: 'POSSystem.tsx'
        },
        {
          name: 'NewPOSSystem',
          route: '/cleanup/new-pos',
          status: 'unused',
          description: '實驗性功能版本',
          file: 'NewPOSSystem.tsx'
        },
        {
          name: 'ModernPOS',
          route: '/cleanup/modern-pos',
          status: 'unused',
          description: '現代化設計版本 (已損壞)',
          file: 'ModernPOS.tsx'
        }
      ]
    },
    {
      title: '🍳 KDS 廚房顯示系統',
      description: '廚房訂單顯示與管理系統',
      components: [
        {
          name: 'RealDataKDS',
          route: '/kds',
          status: 'active',
          description: '主要版本 - 真實資料庫整合',
          file: 'RealDataKDS.tsx'
        },
        {
          name: 'EnhancedKDSSystem',
          route: '/kds-enhanced',
          status: 'active',
          description: '智能版本 - 優先級排序',
          file: 'EnhancedKDSSystem.tsx'
        },
        {
          name: 'KDSSystem (舊版)',
          route: '/kds-legacy',
          status: 'reference',
          description: '傳統版本，供參考',
          file: 'KDSSystem.tsx'
        },
        {
          name: 'KDSSystem_new',
          route: '/cleanup/kds-new',
          status: 'unused',
          description: '重構版本 - 未完成',
          file: 'KDSSystem_new.tsx'
        },
        {
          name: 'KDSSystem_simple',
          route: '#',
          status: 'unused',
          description: '簡化功能版本 (空文件)',
          file: 'KDSSystem_simple.tsx'
        },
        {
          name: 'KDSSystemComplete',
          route: '#',
          status: 'unused',
          description: '完整功能集版本 (空文件)',
          file: 'KDSSystemComplete.tsx'
        },
        {
          name: 'KDSView',
          route: '#',
          status: 'unused',
          description: '基本顯示組件',
          file: 'basic/KDSView.tsx'
        }
      ]
    },
    {
      title: '🏢 桌位管理系統',
      description: '餐廳桌位狀態與安排管理',
      components: [
        {
          name: 'RealDataTableSelector',
          route: '/tables',
          status: 'active',
          description: '主要版本 - 智能推薦',
          file: 'RealDataTableSelector.tsx'
        },
        {
          name: 'EnhancedTableManagement',
          route: '/tables-enhanced',
          status: 'active',
          description: '智能版本 - 三方聯動',
          file: 'EnhancedTableManagement.tsx'
        },
        {
          name: 'ModernTableManagement',
          route: '/tables-modern',
          status: 'reference',
          description: '現代化界面設計',
          file: 'modern/ModernTableManagement.tsx'
        },
        {
          name: 'TableStatus (舊版)',
          route: '/tables-old',
          status: 'reference',
          description: '桌位狀態顯示',
          file: 'pages/TableStatus.tsx'
        },
        {
          name: 'TableManagement',
          route: '/cleanup/table-management',
          status: 'unused',
          description: '基本桌位管理',
          file: 'TableManagement.tsx'
        },
        {
          name: 'TableStatusNew',
          route: '#',
          status: 'unused',
          description: '改進的狀態顯示 (不存在)',
          file: 'pages/TableStatusNew.tsx'
        },
        {
          name: 'SmartTableSelector',
          route: '/cleanup/smart-table',
          status: 'unused',
          description: '智能桌位選擇器',
          file: 'SmartTableSelector.tsx'
        }
      ]
    },
    {
      title: '📊 數據分析系統',
      description: '營業數據分析與報表',
      components: [
        {
          name: 'SimpleAnalyticsDashboard',
          route: '/analytics',
          status: 'active',
          description: '主要版本 - 簡潔易用',
          file: 'analytics/SimpleAnalyticsDashboard.tsx'
        },
        {
          name: 'AnalyticsDashboard',
          route: '#',
          status: 'unused',
          description: '標準數據分析功能',
          file: 'analytics/AnalyticsDashboard.tsx'
        },
        {
          name: 'AdvancedAnalytics',
          route: '#',
          status: 'unused',
          description: '進階分析功能',
          file: 'analytics/AdvancedAnalytics.tsx'
        },
        {
          name: 'InventoryAnalytics',
          route: '#',
          status: 'unused',
          description: '專門的庫存分析',
          file: 'analytics/InventoryAnalytics.tsx'
        },
        {
          name: 'PerformanceMonitor',
          route: '#',
          status: 'unused',
          description: '系統性能監控',
          file: 'analytics/PerformanceMonitor.tsx'
        },
        {
          name: 'RealTimeMonitor',
          route: '#',
          status: 'unused',
          description: '即時數據監控',
          file: 'analytics/RealTimeMonitor.tsx'
        },
        {
          name: 'SmartAlerts',
          route: '#',
          status: 'unused',
          description: '智能警報系統',
          file: 'analytics/SmartAlerts.tsx'
        }
      ]
    },
    {
      title: '💳 支付系統',
      description: '訂單結帳與支付處理',
      components: [
        {
          name: 'PaymentPage',
          route: '/payment',
          status: 'active',
          description: '主要版本 - 完整支付流程',
          file: 'pages/PaymentPage.tsx'
        },
        {
          name: 'IntegratedPayment',
          route: '/cleanup/integrated-payment',
          status: 'unused',
          description: '整合支付功能組件',
          file: 'IntegratedPayment.tsx'
        },
        {
          name: 'PaymentMethods',
          route: '#',
          status: 'unused',
          description: '支付方式選擇組件',
          file: 'payment/PaymentMethods.tsx'
        },
        {
          name: 'CardPayment',
          route: '#',
          status: 'unused',
          description: '信用卡支付處理',
          file: 'payment/CardPayment.tsx'
        },
        {
          name: 'CardPayment-New',
          route: '#',
          status: 'unused',
          description: '改進的信用卡支付',
          file: 'payment/CardPayment-New.tsx'
        },
        {
          name: 'DigitalWalletPayment',
          route: '#',
          status: 'unused',
          description: '數位錢包支付',
          file: 'payment/DigitalWalletPayment.tsx'
        },
        {
          name: 'DigitalWalletPayment-New',
          route: '#',
          status: 'unused',
          description: '改進的數位錢包支付',
          file: 'payment/DigitalWalletPayment-New.tsx'
        }
      ]
    },
    {
      title: '📋 訂單管理系統',
      description: '訂單查詢與管理',
      components: [
        {
          name: 'OrderManagement',
          route: '/orders',
          status: 'active',
          description: '主要版本 - 完整訂單管理',
          file: 'pages/OrderManagement.tsx'
        },
        {
          name: 'QuickOrderModal',
          route: '/cleanup/quick-order',
          status: 'unused',
          description: '快速訂單彈窗組件',
          file: 'QuickOrderModal.tsx'
        }
      ]
    },
    {
      title: '⚡ 性能優化系統',
      description: '系統性能監控與優化',
      components: [
        {
          name: 'SystemPerformanceOptimizer',
          route: '/performance',
          status: 'active',
          description: '系統性能優化與監控',
          file: 'SystemPerformanceOptimizer.tsx'
        }
      ]
    },
    {
      title: '🎨 測試系統',
      description: '開發測試與UI測試',
      components: [
        {
          name: 'UITestPage',
          route: '/ui-test',
          status: 'active',
          description: 'UI 樣式測試頁面',
          file: 'pages/UITestPage.tsx'
        },
        {
          name: 'TestPage',
          route: '/test',
          status: 'reference',
          description: '通用測試頁面',
          file: 'pages/TestPage.tsx'
        }
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            🟢 活躍使用
          </span>
        );
      case 'reference':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            🟡 保留參考
          </span>
        );
      case 'unused':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            🔴 未使用
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 頁面標題 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏪 TanaPOS V5 功能組件總覽
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            查看所有功能組件的實際呈現效果，點擊卡片直接跳轉到對應頁面進行測試
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-sm text-gray-600">活躍使用 (10個)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              <span className="text-sm text-gray-600">保留參考 (5個)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="text-sm text-gray-600">待清理 (22個)</span>
            </div>
          </div>
        </div>

        {/* 功能組件分組 */}
        <div className="space-y-12">
          {componentGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="bg-white rounded-lg shadow-lg p-6">
              {/* 分組標題 */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {group.title}
                </h2>
                <p className="text-gray-600">{group.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.components.map((component, componentIndex) => (
                  component.status === 'unused' && component.route === '#' ? (
                    // 無法預覽的未使用組件 - 不可點擊
                    <div
                      key={componentIndex}
                      className="block cursor-not-allowed"
                    >
                      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border-2 border-red-200 opacity-75">
                        {/* 組件名稱與狀態 */}
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-700">
                            {component.name}
                          </h3>
                          {getStatusBadge(component.status)}
                        </div>

                        {/* 組件描述 */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {component.description}
                        </p>

                        {/* 路由與文件信息 */}
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <span className="text-gray-500 font-medium mr-2">狀態:</span>
                            <code className="bg-red-100 px-2 py-1 rounded text-red-600 font-mono">
                              無法預覽
                            </code>
                          </div>
                          {component.file && (
                            <div className="flex items-center text-sm">
                              <span className="text-gray-500 font-medium mr-2">文件:</span>
                              <span className="text-gray-700 font-mono text-xs">
                                {component.file}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* 清理提示 */}
                        <div className="mt-4 pt-4 border-t border-red-200">
                          <div className="flex items-center text-sm text-red-600 font-medium">
                            <span>🗑️ 建議刪除此組件</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : component.status === 'unused' ? (
                    // 可預覽的未使用組件 - 可點擊
                    <Link
                      key={componentIndex}
                      to={component.route}
                      className="block group"
                    >
                      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border-2 border-red-300 group-hover:border-red-400 group-hover:shadow-lg transition-all duration-200 transform group-hover:-translate-y-1">
                        {/* 組件名稱與狀態 */}
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-red-800 group-hover:text-red-900 transition-colors">
                            {component.name}
                          </h3>
                          {getStatusBadge(component.status)}
                        </div>

                        {/* 組件描述 */}
                        <p className="text-red-700 text-sm mb-4 line-clamp-2">
                          {component.description}
                        </p>

                        {/* 路由與文件信息 */}
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <span className="text-red-600 font-medium mr-2">路由:</span>
                            <code className="bg-red-200 px-2 py-1 rounded text-red-800 font-mono">
                              {component.route}
                            </code>
                          </div>
                          {component.file && (
                            <div className="flex items-center text-sm">
                              <span className="text-red-600 font-medium mr-2">文件:</span>
                              <span className="text-red-800 font-mono text-xs">
                                {component.file}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* 懸停效果指示 */}
                        <div className="mt-4 pt-4 border-t border-red-300">
                          <div className="flex items-center text-sm text-red-700 font-medium">
                            <span>⚠️ 點擊查看待清理組件</span>
                            <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    // 活躍/參考組件 - 可點擊
                    <Link
                      key={componentIndex}
                      to={component.route}
                      className="block group"
                    >
                      <div className={`${
                        component.status === 'active' 
                          ? 'bg-gradient-to-br from-blue-50 to-indigo-50' 
                          : 'bg-gradient-to-br from-yellow-50 to-amber-50'
                      } rounded-lg p-6 border-2 border-transparent group-hover:border-blue-300 group-hover:shadow-lg transition-all duration-200 transform group-hover:-translate-y-1`}>
                        {/* 組件名稱與狀態 */}
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {component.name}
                          </h3>
                          {getStatusBadge(component.status)}
                        </div>

                        {/* 組件描述 */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {component.description}
                        </p>

                        {/* 路由與文件信息 */}
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <span className="text-gray-500 font-medium mr-2">路由:</span>
                            <code className="bg-gray-100 px-2 py-1 rounded text-blue-600 font-mono">
                              {component.route}
                            </code>
                          </div>
                          {component.file && (
                            <div className="flex items-center text-sm">
                              <span className="text-gray-500 font-medium mr-2">文件:</span>
                              <span className="text-gray-700 font-mono text-xs">
                                {component.file}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* 懸停效果指示 */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center text-sm text-blue-600 font-medium">
                            <span>點擊查看實際效果</span>
                            <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 返回首頁按鈕 */}
        <div className="text-center mt-12">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首頁
          </Link>
        </div>

        {/* 清理建議區域 */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🧹 程式碼清理建議
            </h2>
            <p className="text-lg text-gray-600">
              基於以上分析，以下是優化專案結構的建議
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 保留核心功能 */}
            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
                <h3 className="ml-3 text-xl font-semibold text-green-800">保留核心 (10個)</h3>
              </div>
              <ul className="space-y-2 text-sm text-green-700">
                <li>• RealDataPOS (主要POS)</li>
                <li>• RealDataKDS + Enhanced版本</li>
                <li>• 智能桌位管理系統</li>
                <li>• 支付與訂單管理</li>
                <li>• 數據分析與性能監控</li>
              </ul>
            </div>

            {/* 考慮保留 */}
            <div className="bg-yellow-50 rounded-lg p-6 border-2 border-yellow-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">?</span>
                </div>
                <h3 className="ml-3 text-xl font-semibold text-yellow-800">參考保留 (5個)</h3>
              </div>
              <ul className="space-y-2 text-sm text-yellow-700">
                <li>• 舊版POS/KDS (學習參考)</li>
                <li>• 舊版桌位管理</li>
                <li>• ModernTableManagement</li>
                <li>• 測試頁面組件</li>
              </ul>
              <p className="mt-3 text-xs text-yellow-600">
                可根據需要選擇性保留或移至 legacy 資料夾
              </p>
            </div>

            {/* 建議清理 */}
            <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">✗</span>
                </div>
                <h3 className="ml-3 text-xl font-semibold text-red-800">建議清理 (22個)</h3>
              </div>
              <ul className="space-y-2 text-sm text-red-700">
                <li>• 6個未使用的數據分析組件</li>
                <li>• 6個未使用的支付組件</li>
                <li>• 4個未使用的KDS組件</li>
                <li>• 3個未使用的桌位組件</li>
                <li>• 2個未使用的POS組件</li>
                <li>• 1個未使用的訂單組件</li>
              </ul>
              <p className="mt-3 text-xs text-red-600">
                這些組件沒有活躍路由，建議安全刪除
              </p>
            </div>
          </div>

          {/* 清理效果預估 */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              📊 清理效果預估
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-2xl font-bold text-blue-600">59.5%</div>
                <div className="text-sm text-gray-600">文件數量減少</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-2xl font-bold text-green-600">37→15</div>
                <div className="text-sm text-gray-600">組件簡化</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-2xl font-bold text-purple-600">更專注</div>
                <div className="text-sm text-gray-600">開發效率</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-2xl font-bold text-orange-600">更清晰</div>
                <div className="text-sm text-gray-600">專案結構</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentsOverview;

import React, { useState, useEffect } from 'react'
import LoadingSpinner from './LoadingSpinner'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Clock,
  Calendar,
  Target,
  Award
} from 'lucide-react'

// 假設數據接口 (後續可連接真實API)
const mockAnalyticsData = {
  todayStats: {
    revenue: 24850,
    orders: 127,
    customers: 98,
    avgOrderValue: 195.67
  },
  salesTrend: [
    { time: '09:00', revenue: 1200, orders: 8 },
    { time: '10:00', revenue: 2100, orders: 12 },
    { time: '11:00', revenue: 3800, orders: 18 },
    { time: '12:00', revenue: 5200, orders: 24 },
    { time: '13:00', revenue: 4800, orders: 22 },
    { time: '14:00', revenue: 3200, orders: 15 },
    { time: '15:00', revenue: 2800, orders: 13 },
    { time: '16:00', revenue: 1650, orders: 9 },
    { time: '17:00', revenue: 2100, orders: 12 }
  ],
  topProducts: [
    { name: '招牌咖啡', sales: 45, revenue: 2250 },
    { name: '經典漢堡', sales: 32, revenue: 4800 },
    { name: '鮮果汁', sales: 28, revenue: 1400 },
    { name: '蛋糕套餐', sales: 23, revenue: 3450 },
    { name: '沙拉輕食', sales: 19, revenue: 2280 }
  ],
  paymentMethods: [
    { name: '現金', value: 35, amount: 8697.5 },
    { name: '信用卡', value: 45, amount: 11182.5 },
    { name: '電子支付', value: 20, amount: 4970 }
  ],
  tableUtilization: [
    { table: '1號桌', utilization: 85, orders: 6 },
    { table: '2號桌', utilization: 92, orders: 7 },
    { table: '3號桌', utilization: 78, orders: 5 },
    { table: '4號桌', utilization: 88, orders: 6 },
    { table: '5號桌', utilization: 71, orders: 4 }
  ]
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  trendUp?: boolean
  color?: string
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendUp, 
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${
              trendUp ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${
                !trendUp ? 'transform rotate-180' : ''
              }`} />
              {trend}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

const AnalyticsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('today')

  useEffect(() => {
    // 模擬數據載入
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* 頂部標題與時間範圍選擇 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">營業分析儀表板</h1>
          <p className="text-gray-600 mt-1">即時營業數據與趨勢分析</p>
        </div>
        <div className="flex space-x-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="today">今日</option>
            <option value="week">本週</option>
            <option value="month">本月</option>
            <option value="quarter">本季</option>
          </select>
        </div>
      </div>

      {/* 核心指標卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="今日營收"
          value={formatCurrency(mockAnalyticsData.todayStats.revenue)}
          icon={<DollarSign className="w-6 h-6" />}
          trend="+12.5%"
          trendUp={true}
          color="green"
        />
        <StatsCard
          title="訂單數量"
          value={mockAnalyticsData.todayStats.orders}
          icon={<ShoppingCart className="w-6 h-6" />}
          trend="+8.3%"
          trendUp={true}
          color="blue"
        />
        <StatsCard
          title="客戶數量"
          value={mockAnalyticsData.todayStats.customers}
          icon={<Users className="w-6 h-6" />}
          trend="+5.7%"
          trendUp={true}
          color="purple"
        />
        <StatsCard
          title="平均客單價"
          value={formatCurrency(mockAnalyticsData.todayStats.avgOrderValue)}
          icon={<Target className="w-6 h-6" />}
          trend="+3.2%"
          trendUp={true}
          color="yellow"
        />
      </div>

      {/* 圖表區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 營收趨勢圖 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">今日營收趨勢</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockAnalyticsData.salesTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'revenue' ? formatCurrency(value as number) : value,
                name === 'revenue' ? '營收' : '訂單數'
              ]} />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3}
              />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="#10B981" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 熱銷商品 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">熱銷商品排行</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockAnalyticsData.topProducts} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip formatter={(value, name) => [
                name === 'revenue' ? formatCurrency(value as number) : value,
                name === 'revenue' ? '營收' : '銷量'
              ]} />
              <Bar dataKey="sales" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 支付方式分佈 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">支付方式分佈</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockAnalyticsData.paymentMethods}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {mockAnalyticsData.paymentMethods.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [
                `${value}筆`,
                name
              ]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 桌位使用率 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">桌位使用率</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockAnalyticsData.tableUtilization}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="table" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'utilization' ? `${value}%` : `${value}筆`,
                name === 'utilization' ? '使用率' : '訂單數'
              ]} />
              <Bar dataKey="utilization" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 快速洞察與建議 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2 text-yellow-500" />
          智能洞察與建議
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800">營收表現優異</h4>
            <p className="text-sm text-green-600 mt-1">
              今日營收較昨日成長 12.5%，建議維持當前策略
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800">尖峰時段優化</h4>
            <p className="text-sm text-yellow-600 mt-1">
              12-13點為尖峰時段，建議增加人手配置
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800">商品推廣機會</h4>
            <p className="text-sm text-blue-600 mt-1">
              沙拉輕食銷量增長潛力大，可考慮促銷活動
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard

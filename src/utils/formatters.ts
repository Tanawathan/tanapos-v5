// 時間格式化工具
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

// 日期格式化工具
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 日期時間格式化工具
export const formatDateTime = (date: Date): string => {
  return `${formatDate(date)} ${formatTime(date)}`
}

// 貨幣格式化工具
export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString('zh-TW')}`
}

// 持續時間格式化工具（分鐘轉為時分）
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}分鐘`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}小時`
  }
  
  return `${hours}小時${remainingMinutes}分鐘`
}

// 相對時間格式化工具（多久之前）
export const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (minutes < 1) {
    return '剛剛'
  } else if (minutes < 60) {
    return `${minutes}分鐘前`
  } else if (minutes < 1440) { // 24小時
    const hours = Math.floor(minutes / 60)
    return `${hours}小時前`
  } else {
    const days = Math.floor(minutes / 1440)
    return `${days}天前`
  }
}

// 百分比格式化工具
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}

// 訂單號格式化工具
export const formatOrderNumber = (orderNumber: string): string => {
  // 如果訂單號太長，只顯示後面幾位
  if (orderNumber.length > 8) {
    return `...${orderNumber.slice(-6)}`
  }
  return orderNumber
}

// 電話號碼格式化工具
export const formatPhoneNumber = (phone: string): string => {
  // 簡單的台灣手機號碼格式化
  if (phone.length === 10 && phone.startsWith('09')) {
    return `${phone.slice(0, 4)}-${phone.slice(4, 7)}-${phone.slice(7)}`
  }
  return phone
}

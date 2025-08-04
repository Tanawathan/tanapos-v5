import { useState, useEffect } from 'react'

interface PWAInstallPrompt {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAState {
  isInstallable: boolean
  isInstalled: boolean
  isOnline: boolean
  updateAvailable: boolean
  showInstallPrompt: boolean
}

interface PWAActions {
  installApp: () => Promise<void>
  dismissInstallPrompt: () => void
  checkForUpdates: () => void
  reloadApp: () => void
}

export const usePWA = (): PWAState & PWAActions => {
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  // 檢查是否已安裝為 PWA
  useEffect(() => {
    const checkIfInstalled = () => {
      // 檢查是否在獨立模式下運行
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      // 檢查是否有 navigator.standalone (iOS Safari)
      const isIOSStandalone = (window.navigator as any).standalone === true
      
      setIsInstalled(isStandalone || isIOSStandalone)
    }

    checkIfInstalled()
  }, [])

  // 監聽安裝提示事件
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      const e = event as BeforeInstallPromptEvent
      setInstallPrompt(e)
      setIsInstallable(true)
      
      // 如果尚未安裝且用戶尚未關閉提示，則顯示安裝提示
      if (!isInstalled && !localStorage.getItem('pwa-install-dismissed')) {
        setShowInstallPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [isInstalled])

  // 監聽網路狀態
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // 監聽 Service Worker 更新
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setUpdateAvailable(true)
      })

      // 檢查是否有等待中的 Service Worker
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration?.waiting) {
          setUpdateAvailable(true)
        }
      })
    }
  }, [])

  // 安裝 PWA
  const installApp = async (): Promise<void> => {
    if (!installPrompt) return

    try {
      await installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('✅ PWA 安裝成功')
        setIsInstalled(true)
        setShowInstallPrompt(false)
        setInstallPrompt(null)
        
        // 追蹤安裝事件
        if ('gtag' in window) {
          (window as any).gtag('event', 'pwa_install', {
            event_category: 'PWA',
            event_label: 'User installed PWA'
          })
        }
      } else {
        console.log('❌ 用戶取消 PWA 安裝')
      }
    } catch (error) {
      console.error('❌ PWA 安裝失敗:', error)
    }
  }

  // 關閉安裝提示
  const dismissInstallPrompt = (): void => {
    setShowInstallPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
    
    // 7 天後重新顯示提示
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed')
    }, 7 * 24 * 60 * 60 * 1000)
  }

  // 檢查更新
  const checkForUpdates = (): void => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          registration.update()
        }
      })
    }
  }

  // 重新載入應用程式
  const reloadApp = (): void => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
      })
    }
    window.location.reload()
  }

  return {
    // 狀態
    isInstallable,
    isInstalled,
    isOnline,
    updateAvailable,
    showInstallPrompt,
    
    // 操作
    installApp,
    dismissInstallPrompt,
    checkForUpdates,
    reloadApp
  }
}

// PWA 工具函數
export const PWAUtils = {
  // 註冊 Service Worker
  registerServiceWorker: async (): Promise<ServiceWorkerRegistration | null> => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })
        
        console.log('✅ Service Worker 註冊成功:', registration.scope)
        
        // 監聽更新
        registration.addEventListener('updatefound', () => {
          console.log('🔄 Service Worker 更新發現')
        })

        return registration
      } catch (error) {
        console.error('❌ Service Worker 註冊失敗:', error)
        return null
      }
    }
    return null
  },

  // 檢查瀏覽器支援
  checkPWASupport: (): {
    serviceWorker: boolean
    manifest: boolean
    notification: boolean
    backgroundSync: boolean
  } => {
    return {
      serviceWorker: 'serviceWorker' in navigator,
      manifest: 'serviceWorker' in navigator && 'PushManager' in window,
      notification: 'Notification' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype
    }
  },

  // 獲取安裝狀態
  getInstallStatus: (): {
    isStandalone: boolean
    isIOSStandalone: boolean
    isPWA: boolean
  } => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIOSStandalone = (window.navigator as any).standalone === true
    
    return {
      isStandalone,
      isIOSStandalone,
      isPWA: isStandalone || isIOSStandalone
    }
  }
}

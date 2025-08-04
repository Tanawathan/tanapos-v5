// TanaPOS V4-Mini Service Worker
// 提供離線功能和快取管理

const CACHE_NAME = 'tanapos-v4-mini-v1.0.0'
const STATIC_CACHE_NAME = 'tanapos-static-v1'
const DYNAMIC_CACHE_NAME = 'tanapos-dynamic-v1'

// 需要快取的核心資源
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
]

// 離線時的後備頁面
const OFFLINE_PAGE = '/offline.html'

// 安裝 Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('📦 Service Worker: Caching core assets')
        return cache.addAll(CORE_ASSETS)
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete')
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('❌ Service Worker: Installation failed', error)
      })
  )
})

// 啟動 Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName !== STATIC_CACHE_NAME && 
              cacheName !== DYNAMIC_CACHE_NAME
            )
            .map(cacheName => {
              console.log(`🗑️ Service Worker: Deleting old cache ${cacheName}`)
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete')
        return self.clients.claim()
      })
  )
})

// 攔截網路請求
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // 只處理同源請求
  if (url.origin !== location.origin) {
    return
  }
  
  // HTML 請求 - 網路優先策略
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // 成功獲取，更新快取
          const responseClone = response.clone()
          caches.open(DYNAMIC_CACHE_NAME)
            .then(cache => cache.put(request, responseClone))
          return response
        })
        .catch(() => {
          // 網路失敗，從快取獲取
          return caches.match(request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse
              }
              // 如果沒有快取，返回離線頁面
              return caches.match(OFFLINE_PAGE)
            })
        })
    )
    return
  }
  
  // 靜態資源 - 快取優先策略
  if (
    request.url.includes('.js') ||
    request.url.includes('.css') ||
    request.url.includes('.png') ||
    request.url.includes('.jpg') ||
    request.url.includes('.svg') ||
    request.url.includes('.ico')
  ) {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse
          }
          
          return fetch(request)
            .then(response => {
              // 只快取成功的回應
              if (response.status === 200) {
                const responseClone = response.clone()
                caches.open(STATIC_CACHE_NAME)
                  .then(cache => cache.put(request, responseClone))
              }
              return response
            })
        })
    )
    return
  }
  
  // API 請求 - 網路優先，快取作為後備
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // 只快取 GET 請求的成功回應
          if (request.method === 'GET' && response.status === 200) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE_NAME)
              .then(cache => cache.put(request, responseClone))
          }
          return response
        })
        .catch(() => {
          // 網路失敗時，嘗試從快取獲取 GET 請求
          if (request.method === 'GET') {
            return caches.match(request)
          }
          // 非 GET 請求，返回離線錯誤
          return new Response(
            JSON.stringify({
              error: 'Network unavailable',
              message: '網路連線中斷，請稍後重試'
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        })
    )
    return
  }
})

// 背景同步 - 處理離線時的資料同步
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync triggered')
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // 這裡可以添加離線時收集的資料同步邏輯
      console.log('📡 Service Worker: Syncing offline data...')
    )
  }
})

// 推送通知
self.addEventListener('push', (event) => {
  console.log('📢 Service Worker: Push notification received')
  
  const options = {
    body: event.data ? event.data.text() : '您有新的訂單通知',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.png',
    vibrate: [200, 100, 200],
    data: {
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: '查看詳情',
        icon: '/icons/view.png'
      },
      {
        action: 'dismiss',
        title: '關閉',
        icon: '/icons/close.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('TanaPOS 通知', options)
  )
})

// 通知點擊處理
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Service Worker: Notification clicked')
  
  event.notification.close()
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// 錯誤處理
self.addEventListener('error', (event) => {
  console.error('❌ Service Worker Error:', event.error)
})

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Service Worker Unhandled Promise Rejection:', event.reason)
})

console.log('🎉 TanaPOS Service Worker loaded successfully!')

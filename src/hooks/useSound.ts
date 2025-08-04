import { useCallback, useRef } from 'react'

interface SoundOptions {
  volume?: number
  duration?: number
  frequency?: number
  type?: 'sine' | 'square' | 'sawtooth' | 'triangle'
}

export const useSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null)

  // 初始化 AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  // 程式化生成音效
  const playTone = useCallback((options: SoundOptions = {}) => {
    const {
      volume = 0.3,
      duration = 200,
      frequency = 800,
      type = 'sine'
    } = options

    try {
      const ctx = getAudioContext()
      
      // 創建振盪器和增益節點
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      // 設定音調
      oscillator.type = type
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
      
      // 設定音量包絡
      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000)
      
      // 連接節點
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      // 播放音效
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration / 1000)
      
    } catch (error) {
      console.warn('無法播放音效:', error)
    }
  }, [getAudioContext])

  // 預定義音效
  const sounds = {
    // 成功音效：愉悦的和弦
    success: () => {
      playTone({ frequency: 523, duration: 150 }) // C
      setTimeout(() => playTone({ frequency: 659, duration: 150 }), 100) // E
      setTimeout(() => playTone({ frequency: 784, duration: 200 }), 200) // G
    },

    // 錯誤音效：低沉的警告音
    error: () => {
      playTone({ frequency: 200, duration: 100, type: 'square' })
      setTimeout(() => playTone({ frequency: 150, duration: 100, type: 'square' }), 150)
    },

    // 支付成功：清脆的鈴聲
    paymentSuccess: () => {
      playTone({ frequency: 1000, duration: 100 })
      setTimeout(() => playTone({ frequency: 1200, duration: 100 }), 120)
      setTimeout(() => playTone({ frequency: 1500, duration: 150 }), 240)
    },

    // 支付失敗：下降音調
    paymentFailed: () => {
      playTone({ frequency: 400, duration: 200, type: 'square' })
      setTimeout(() => playTone({ frequency: 300, duration: 300, type: 'square' }), 200)
    },

    // 新訂單：注意力提醒
    newOrder: () => {
      playTone({ frequency: 800, duration: 200 })
      setTimeout(() => playTone({ frequency: 1000, duration: 200 }), 300)
      setTimeout(() => playTone({ frequency: 800, duration: 200 }), 600)
    },

    // 訂單完成：滿足的音調
    orderReady: () => {
      playTone({ frequency: 600, duration: 100 })
      setTimeout(() => playTone({ frequency: 750, duration: 100 }), 100)
      setTimeout(() => playTone({ frequency: 900, duration: 200 }), 200)
    },

    // 按鈕點擊：簡短清脆
    click: () => {
      playTone({ frequency: 1200, duration: 50, volume: 0.2 })
    },

    // 桌位狀態變更：柔和提醒
    tableStatus: () => {
      playTone({ frequency: 500, duration: 150, type: 'triangle' })
      setTimeout(() => playTone({ frequency: 600, duration: 150, type: 'triangle' }), 150)
    },

    // 處理中：循環脈衝音
    processing: () => {
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          playTone({ frequency: 400, duration: 100, volume: 0.2 })
        }, i * 200)
      }
    },

    // 庫存警告：緊急但不刺耳
    inventoryAlert: () => {
      playTone({ frequency: 700, duration: 150, type: 'square', volume: 0.4 })
      setTimeout(() => playTone({ frequency: 700, duration: 150, type: 'square', volume: 0.4 }), 300)
    }
  }

  // 播放預定義音效
  const playSound = useCallback((soundName: keyof typeof sounds, customOptions?: SoundOptions) => {
    try {
      if (sounds[soundName]) {
        sounds[soundName]()
      } else {
        // 自定義音效
        playTone(customOptions)
      }
    } catch (error) {
      console.warn('音效播放失敗:', error)
    }
  }, [playTone])

  // 檢查音效支援
  const isAudioSupported = useCallback(() => {
    return !!(window.AudioContext || (window as any).webkitAudioContext)
  }, [])

  return {
    playSound,
    playTone,
    isAudioSupported,
    sounds: Object.keys(sounds) as Array<keyof typeof sounds>
  }
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_CURRENCY_SYMBOL?: string
  readonly VITE_DEFAULT_TAX_RATE?: string
  readonly VITE_ENABLE_VIBRATION?: string
  readonly VITE_ENABLE_SOUND_NOTIFICATIONS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

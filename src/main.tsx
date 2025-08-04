import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/ui-styles.css'

console.log('🚀 TanaPOS V4-Mini loading...')

// Create root and render app
const container = document.getElementById('root')
if (!container) {
  throw new Error('Root element not found')
}

console.log('📦 Root container found, initializing POS system...')

const root = createRoot(container)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

console.log('✅ TanaPOS V4-Mini system loaded successfully')
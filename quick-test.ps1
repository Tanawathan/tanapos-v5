# TanaPOS V5 功能快速測試腳本

Write-Host "🚀 TanaPOS V5 功能快速測試" -ForegroundColor Green
Write-Host ""

# 測試 1: 編譯檢查
Write-Host "1️⃣ 編譯檢查..." -ForegroundColor Cyan
$compileResult = & npm run type-check 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ TypeScript 編譯通過" -ForegroundColor Green
} else {
    Write-Host "   ❌ TypeScript 編譯失敗" -ForegroundColor Red
    Write-Host "   錯誤: $($compileResult | Select-Object -Last 3 | Out-String)" -ForegroundColor Red
}

# 測試 2: 建置測試
Write-Host ""
Write-Host "2️⃣ 建置測試..." -ForegroundColor Cyan
$buildResult = & npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ 專案建置成功" -ForegroundColor Green
} else {
    Write-Host "   ❌ 專案建置失敗" -ForegroundColor Red
    Write-Host "   錯誤: $($buildResult | Select-Object -Last 3 | Out-String)" -ForegroundColor Red
}

# 測試 3: 開發伺服器狀態
Write-Host ""
Write-Host "3️⃣ 開發伺服器測試..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 3 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ 開發伺服器正常運行 (http://localhost:5173)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ 開發伺服器響應異常: $($response.StatusCode)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "   ⚠️ 開發伺服器未運行，啟動中..." -ForegroundColor Yellow
    Write-Host "   提示: 請執行 'npm run dev' 啟動開發伺服器" -ForegroundColor Gray
}

# 測試 4: 核心組件檢查
Write-Host ""
Write-Host "4️⃣ 核心組件檢查..." -ForegroundColor Cyan

$components = @{
    "POS系統" = "src/components/RealDataPOS.tsx"
    "KDS系統" = "src/components/RealDataKDS.tsx"
    "桌位管理" = "src/components/SmartTableSelector.tsx"
    "訂單服務" = "src/services/OrderService.ts"
    "支付整合" = "src/components/IntegratedPayment.tsx"
}

foreach ($comp in $components.GetEnumerator()) {
    if (Test-Path $comp.Value) {
        $content = Get-Content $comp.Value -Raw
        if ($content -match "export.*default" -or $content -match "export.*=") {
            Write-Host "   ✅ $($comp.Key): 正常" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️ $($comp.Key): 匯出可能有問題" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ $($comp.Key): 檔案不存在" -ForegroundColor Red
    }
}

# 測試 5: 路由配置檢查
Write-Host ""
Write-Host "5️⃣ 路由配置檢查..." -ForegroundColor Cyan

if (Test-Path "src/App.tsx") {
    $appContent = Get-Content "src/App.tsx" -Raw
    $routes = @("/pos", "/kds", "/tables", "/orders", "/payment")
    
    foreach ($route in $routes) {
        if ($appContent -match "path=`"$route`"") {
            Write-Host "   ✅ 路由 ${route}: 已配置" -ForegroundColor Green
        } else {
            Write-Host "   ❌ 路由 ${route}: 未找到" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   ❌ App.tsx 不存在" -ForegroundColor Red
}

# 測試 6: 環境配置檢查
Write-Host ""
Write-Host "6️⃣ 環境配置檢查..." -ForegroundColor Cyan

if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "VITE_SUPABASE_URL") {
        Write-Host "   ✅ Supabase URL: 已配置" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Supabase URL: 未配置" -ForegroundColor Yellow
    }
    
    if ($envContent -match "VITE_SUPABASE_ANON_KEY") {
        Write-Host "   ✅ Supabase Key: 已配置" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Supabase Key: 未配置" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️ .env 檔案不存在，請從 .env.example 複製" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 快速測試完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 建議檢查項目:" -ForegroundColor Yellow
Write-Host "• 如果編譯失敗，請檢查 TypeScript 錯誤" -ForegroundColor Gray
Write-Host "• 如果建置失敗，請檢查依賴和配置" -ForegroundColor Gray
Write-Host "• 如果伺服器未運行，請執行 'npm run dev'" -ForegroundColor Gray
Write-Host "• 如果環境變數未配置，請設定 .env 檔案" -ForegroundColor Gray
Write-Host ""

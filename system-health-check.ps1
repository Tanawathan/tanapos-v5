# TanaPOS V5 系統功能檢測腳本

Write-Host "🔍 開始 TanaPOS V5 系統功能檢測..." -ForegroundColor Green
Write-Host ""

$errors = @()
$warnings = @()
$passed = 0
$total = 0

function Test-Function {
    param(
        [string]$TestName,
        [scriptblock]$TestScript,
        [string]$Category = "General"
    )
    
    $global:total++
    Write-Host "[$Category] 測試: $TestName" -ForegroundColor Cyan
    
    try {
        $result = & $TestScript
        if ($result -eq $true -or $null -eq $result) {
            Write-Host "  ✅ 通過" -ForegroundColor Green
            $global:passed++
        } else {
            Write-Host "  ❌ 失敗: $result" -ForegroundColor Red
            $global:errors += "[$Category] $TestName - $result"
        }
    }
    catch {
        Write-Host "  ❌ 錯誤: $($_.Exception.Message)" -ForegroundColor Red
        $global:errors += "[$Category] $TestName - $($_.Exception.Message)"
    }
    Write-Host ""
}

# 1. 檔案結構檢測
Write-Host "📁 檔案結構檢測" -ForegroundColor Yellow
Write-Host "=" * 50

Test-Function "package.json 存在且為 V5" {
    if (-not (Test-Path "package.json")) { return "package.json 不存在" }
    $pkg = Get-Content "package.json" | ConvertFrom-Json
    if ($pkg.name -ne "tanapos-v5") { return "專案名稱不正確: $($pkg.name)" }
    if ($pkg.version -ne "5.0.0") { return "版本號不正確: $($pkg.version)" }
    return $true
} "檔案結構"

Test-Function "核心目錄存在" {
    $requiredDirs = @("src", "public", "src/components", "src/pages", "src/services", "src/stores")
    foreach ($dir in $requiredDirs) {
        if (-not (Test-Path $dir)) { return "目錄不存在: $dir" }
    }
    return $true
} "檔案結構"

Test-Function "核心組件檔案存在" {
    $requiredFiles = @(
        "src/components/RealDataPOS.tsx",
        "src/components/RealDataKDS.tsx", 
        "src/components/SmartTableSelector.tsx",
        "src/services/OrderService.ts",
        "src/stores/tableStore.ts"
    )
    foreach ($file in $requiredFiles) {
        if (-not (Test-Path $file)) { return "檔案不存在: $file" }
    }
    return $true
} "檔案結構"

# 2. 配置檔案檢測
Write-Host "⚙️ 配置檔案檢測" -ForegroundColor Yellow
Write-Host "=" * 50

Test-Function "TypeScript 配置正確" {
    if (-not (Test-Path "tsconfig.json")) { return "tsconfig.json 不存在" }
    if (-not (Test-Path "src/vite-env.d.ts")) { return "vite-env.d.ts 不存在" }
    return $true
} "配置"

Test-Function "Vite 配置存在" {
    if (-not (Test-Path "vite.config.ts")) { return "vite.config.ts 不存在" }
    return $true
} "配置"

Test-Function "環境變數檔案" {
    if (-not (Test-Path ".env.example")) { return ".env.example 不存在" }
    if (-not (Test-Path ".env")) { 
        $global:warnings += "⚠️ .env 檔案不存在，可能影響功能"
    }
    return $true
} "配置"

# 3. 依賴檢測
Write-Host "📦 依賴檢測" -ForegroundColor Yellow
Write-Host "=" * 50

Test-Function "node_modules 存在" {
    if (-not (Test-Path "node_modules")) { return "node_modules 不存在，請執行 npm install" }
    return $true
} "依賴"

Test-Function "關鍵依賴套件" {
    $requiredPackages = @("react", "typescript", "vite", "@supabase/supabase-js", "zustand")
    foreach ($pkg in $requiredPackages) {
        if (-not (Test-Path "node_modules/$pkg")) { return "缺少套件: $pkg" }
    }
    return $true
} "依賴"

# 4. TypeScript 編譯檢測
Write-Host "🔧 TypeScript 編譯檢測" -ForegroundColor Yellow
Write-Host "=" * 50

Test-Function "TypeScript 類型檢查" {
    $result = & npm run type-check 2>&1
    if ($LASTEXITCODE -ne 0) { 
        return "TypeScript 編譯失敗: $($result | Select-Object -Last 5 | Out-String)"
    }
    return $true
} "編譯"

# 5. 程式碼品質檢測
Write-Host "📋 程式碼品質檢測" -ForegroundColor Yellow
Write-Host "=" * 50

Test-Function "核心服務類型檢查" {
    $orderService = Get-Content "src/services/OrderService.ts" -Raw
    if ($orderService -notmatch "export.*OrderService") { return "OrderService 匯出問題" }
    if ($orderService -notmatch "enum OrderStatus") { return "OrderStatus 定義缺失" }
    if ($orderService -notmatch "enum OrderPaymentStatus") { return "OrderPaymentStatus 定義缺失" }
    return $true
} "品質"

Test-Function "RealDataKDS 匯出檢查" {
    $kdsFile = Get-Content "src/components/RealDataKDS.tsx" -Raw
    if ($kdsFile -notmatch "export default RealDataKDS") { return "RealDataKDS 沒有 default export" }
    return $true
} "品質"

Test-Function "App.tsx 路由檢查" {
    $appFile = Get-Content "src/App.tsx" -Raw
    if ($appFile -match "//.*import.*RealDataKDS") { return "RealDataKDS 仍被註解" }
    if ($appFile -notmatch 'path="/kds"') { return "KDS 路由缺失" }
    return $true
} "品質"

# 6. 功能索引驗證
Write-Host "📚 功能索引驗證" -ForegroundColor Yellow
Write-Host "=" * 50

Test-Function "功能索引文件存在" {
    $docs = @("FUNCTION_INDEX.md", "PROJECT_ANALYSIS.md", "V5_DEVELOPMENT_PLAN.md")
    foreach ($doc in $docs) {
        if (-not (Test-Path $doc)) { return "文檔不存在: $doc" }
    }
    return $true
} "文檔"

Test-Function "功能索引內容檢查" {
    $indexFile = Get-Content "FUNCTION_INDEX.md" -Raw
    if ($indexFile -notmatch "商品管理") { return "功能索引缺少商品管理" }
    if ($indexFile -notmatch "RealDataPOS") { return "功能索引缺少 RealDataPOS 記錄" }
    return $true
} "文檔"

# 7. 開發伺服器檢測 (如果正在運行)
Write-Host "🚀 開發伺服器檢測" -ForegroundColor Yellow
Write-Host "=" * 50

Test-Function "開發伺服器狀態" {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            return $true
        } else {
            $global:warnings += "⚠️ 開發伺服器響應異常: $($response.StatusCode)"
        }
    }
    catch {
        $global:warnings += "⚠️ 開發伺服器未運行或無法連接"
    }
    return $true
} "伺服器"

# 結果報告
Write-Host "📊 檢測結果報告" -ForegroundColor Yellow
Write-Host "=" * 50

Write-Host "✅ 通過測試: $passed / $total" -ForegroundColor Green
Write-Host "❌ 失敗測試: $($errors.Count)" -ForegroundColor Red
Write-Host "⚠️  警告: $($warnings.Count)" -ForegroundColor Yellow

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ 錯誤詳情:" -ForegroundColor Red
    foreach ($err in $errors) {
        Write-Host "  • $err" -ForegroundColor Red
    }
}

if ($warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️ 警告詳情:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  • $warning" -ForegroundColor Yellow
    }
}

Write-Host ""
$successRate = [math]::Round(($passed / $total) * 100, 1)
Write-Host "🎯 系統健康度: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" })

if ($successRate -ge 90) {
    Write-Host "🎉 系統狀態優秀！準備進入下一階段開發。" -ForegroundColor Green
} elseif ($successRate -ge 70) {
    Write-Host "⚠️ 系統基本正常，但有部分問題需要修復。" -ForegroundColor Yellow
} else {
    Write-Host "🚨 系統存在重大問題，需要立即修復！" -ForegroundColor Red
}

Write-Host ""
Write-Host "檢測完成時間: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

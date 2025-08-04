# TanaPOS V5 快速啟動腳本

Write-Host "🚀 正在初始化 TanaPOS V5..." -ForegroundColor Green

# 檢查是否存在V4-mini源碼
$sourcePath = "C:\TANAPOS\tanapos-v4-mini"
$targetPath = "c:\TANAPOS\tanapos-v5"

if (-not (Test-Path $sourcePath)) {
    Write-Host "❌ 找不到 V4-mini 源碼路徑: $sourcePath" -ForegroundColor Red
    exit 1
}

Write-Host "📂 複製 V4-mini 基礎結構到 V5..." -ForegroundColor Yellow

# 複製核心檔案和資料夾
$foldersToCopy = @(
    "src",
    "public", 
    "docs",
    "scripts"
)

$filesToCopy = @(
    "package.json",
    "package-lock.json", 
    "vite.config.ts",
    "tailwind.config.js",
    "postcss.config.js",
    "tsconfig.json",
    "tsconfig.node.json",
    "index.html",
    ".env.example",
    ".gitignore"
)

# 複製資料夾
foreach ($folder in $foldersToCopy) {
    $source = Join-Path $sourcePath $folder
    $target = Join-Path $targetPath $folder
    
    if (Test-Path $source) {
        Write-Host "📁 複製資料夾: $folder" -ForegroundColor Cyan
        if (Test-Path $target) {
            Remove-Item $target -Recurse -Force
        }
        Copy-Item $source $target -Recurse
    }
}

# 複製檔案
foreach ($file in $filesToCopy) {
    $source = Join-Path $sourcePath $file
    $target = Join-Path $targetPath $file
    
    if (Test-Path $source) {
        Write-Host "📄 複製檔案: $file" -ForegroundColor Cyan
        Copy-Item $source $target
    }
}

# 更新 package.json 的名稱和版本
$packageJsonPath = Join-Path $targetPath "package.json"
if (Test-Path $packageJsonPath) {
    Write-Host "📝 更新 package.json..." -ForegroundColor Yellow
    $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
    $packageJson.name = "tanapos-v5"
    $packageJson.version = "5.0.0"
    $packageJson.description = "TanaPOS V5 - AI-Enhanced POS System"
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content $packageJsonPath
}

# 建立 .env 檔案
$envPath = Join-Path $targetPath ".env"
if (-not (Test-Path $envPath)) {
    Write-Host "🔧 建立 .env 檔案..." -ForegroundColor Yellow
    Copy-Item (Join-Path $targetPath ".env.example") $envPath
}

Write-Host ""
Write-Host "✅ V5 初始化完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 下一步操作:" -ForegroundColor Yellow
Write-Host "1. cd c:\TANAPOS\tanapos-v5" -ForegroundColor White
Write-Host "2. npm install" -ForegroundColor White  
Write-Host "3. 編輯 .env 檔案設定環境變數" -ForegroundColor White
Write-Host "4. npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📚 參考文檔:" -ForegroundColor Yellow
Write-Host "- PROJECT_ANALYSIS.md - 專案分析報告" -ForegroundColor White
Write-Host "- FUNCTION_INDEX.md - 功能索引" -ForegroundColor White
Write-Host "- V5_DEVELOPMENT_PLAN.md - V5開發計劃" -ForegroundColor White
Write-Host ""

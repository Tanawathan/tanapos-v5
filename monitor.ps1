# TanaPOS V5 自動監控腳本

param(
    [int]$IntervalSeconds = 30,
    [switch]$Continuous
)

Write-Host "🔍 TanaPOS V5 自動監控啟動" -ForegroundColor Green
Write-Host "監控間隔: $IntervalSeconds 秒" -ForegroundColor Gray
if ($Continuous) {
    Write-Host "模式: 持續監控 (按 Ctrl+C 停止)" -ForegroundColor Gray
} else {
    Write-Host "模式: 單次檢查" -ForegroundColor Gray
}
Write-Host ""

function Get-SystemStatus {
    $status = @{
        Timestamp = Get-Date
        DevServer = $false
        Compilation = $false
        FileStructure = $true
        Warnings = @()
        Errors = @()
    }

    # 檢查開發伺服器
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 2 -UseBasicParsing
        $status.DevServer = ($response.StatusCode -eq 200)
    }
    catch {
        $status.DevServer = $false
    }

    # 檢查編譯狀態
    try {
        $null = & npm run type-check 2>&1
        $status.Compilation = ($LASTEXITCODE -eq 0)
        if (-not $status.Compilation) {
            $status.Errors += "TypeScript 編譯錯誤"
        }
    }
    catch {
        $status.Compilation = $false
        $status.Errors += "編譯檢查失敗"
    }

    # 檢查核心檔案
    $coreFiles = @(
        "src/components/RealDataPOS.tsx",
        "src/components/RealDataKDS.tsx",
        "src/services/OrderService.ts"
    )

    foreach ($file in $coreFiles) {
        if (-not (Test-Path $file)) {
            $status.FileStructure = $false
            $status.Errors += "核心檔案缺失: $file"
        }
    }

    # 檢查環境配置
    if (-not (Test-Path ".env")) {
        $status.Warnings += "環境配置檔案(.env)不存在"
    }

    return $status
}

function Show-Status {
    param($Status)
    
    Clear-Host
    Write-Host "🔍 TanaPOS V5 系統監控" -ForegroundColor Green
    Write-Host "=" * 50
    Write-Host "檢查時間: $($Status.Timestamp.ToString('HH:mm:ss'))" -ForegroundColor Gray
    Write-Host ""

    # 整體狀態
    $overallStatus = $Status.DevServer -and $Status.Compilation -and $Status.FileStructure
    if ($overallStatus) {
        Write-Host "🟢 系統狀態: 正常運行" -ForegroundColor Green
    } else {
        Write-Host "🔴 系統狀態: 發現問題" -ForegroundColor Red
    }
    Write-Host ""

    # 詳細狀態
    Write-Host "📊 詳細狀態:" -ForegroundColor Yellow
    
    $serverIcon = if ($Status.DevServer) { "✅" } else { "❌" }
    $serverColor = if ($Status.DevServer) { "Green" } else { "Red" }
    Write-Host "  $serverIcon 開發伺服器: $(if ($Status.DevServer) { '運行中' } else { '未運行' })" -ForegroundColor $serverColor

    $compileIcon = if ($Status.Compilation) { "✅" } else { "❌" }
    $compileColor = if ($Status.Compilation) { "Green" } else { "Red" }
    Write-Host "  $compileIcon TypeScript編譯: $(if ($Status.Compilation) { '通過' } else { '失敗' })" -ForegroundColor $compileColor

    $fileIcon = if ($Status.FileStructure) { "✅" } else { "❌" }
    $fileColor = if ($Status.FileStructure) { "Green" } else { "Red" }
    Write-Host "  $fileIcon 檔案結構: $(if ($Status.FileStructure) { '完整' } else { '缺失' })" -ForegroundColor $fileColor

    # 警告和錯誤
    if ($Status.Warnings.Count -gt 0) {
        Write-Host ""
        Write-Host "⚠️ 警告:" -ForegroundColor Yellow
        foreach ($warning in $Status.Warnings) {
            Write-Host "  • $warning" -ForegroundColor Yellow
        }
    }

    if ($Status.Errors.Count -gt 0) {
        Write-Host ""
        Write-Host "❌ 錯誤:" -ForegroundColor Red
        foreach ($err in $Status.Errors) {
            Write-Host "  • $err" -ForegroundColor Red
        }
    }

    Write-Host ""
    Write-Host "💡 快速操作:" -ForegroundColor Cyan
    if (-not $Status.DevServer) {
        Write-Host "  • 啟動開發伺服器: npm run dev" -ForegroundColor Gray
    }
    if (-not $Status.Compilation) {
        Write-Host "  • 檢查編譯錯誤: npm run type-check" -ForegroundColor Gray
    }
    if ($Status.Warnings -contains "環境配置檔案(.env)不存在") {
        Write-Host "  • 建立環境檔案: Copy-Item .env.example .env" -ForegroundColor Gray
    }
}

do {
    $status = Get-SystemStatus
    Show-Status $status
    
    if ($Continuous) {
        Write-Host ""
        Write-Host "下次檢查: $((Get-Date).AddSeconds($IntervalSeconds).ToString('HH:mm:ss')) (按 Ctrl+C 停止)" -ForegroundColor DarkGray
        Start-Sleep -Seconds $IntervalSeconds
    }
} while ($Continuous)

if (-not $Continuous) {
    Write-Host ""
    Write-Host "🎯 監控完成 - $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 持續監控模式: .\monitor.ps1 -Continuous" -ForegroundColor Cyan
    Write-Host "💡 自訂間隔: .\monitor.ps1 -Continuous -IntervalSeconds 10" -ForegroundColor Cyan
}

# TanaPOS V5 System Test Script (English)

Write-Host "Testing TanaPOS V5 System..." -ForegroundColor Green
Write-Host ""

$passed = 0
$total = 0

function Test-Item {
    param([string]$Name, [scriptblock]$Test)
    $global:total++
    Write-Host "Testing: $Name" -ForegroundColor Cyan
    try {
        $result = & $Test
        if ($result -eq $true) {
            Write-Host "  PASS" -ForegroundColor Green
            $global:passed++
        } else {
            Write-Host "  FAIL: $result" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 1: File Structure
Test-Item "Package.json exists and is V5" {
    if (-not (Test-Path "package.json")) { return "package.json missing" }
    $pkg = Get-Content "package.json" | ConvertFrom-Json
    if ($pkg.name -ne "tanapos-v5") { return "Wrong project name: $($pkg.name)" }
    return $true
}

Test-Item "Core directories exist" {
    $dirs = @("src", "public", "src/components", "src/services")
    foreach ($dir in $dirs) {
        if (-not (Test-Path $dir)) { return "Missing directory: $dir" }
    }
    return $true
}

Test-Item "Core component files exist" {
    $files = @("src/components/RealDataPOS.tsx", "src/components/RealDataKDS.tsx", "src/services/OrderService.ts")
    foreach ($file in $files) {
        if (-not (Test-Path $file)) { return "Missing file: $file" }
    }
    return $true
}

# Test 2: TypeScript
Test-Item "TypeScript compilation" {
    $result = & npm run type-check 2>&1
    if ($LASTEXITCODE -ne 0) { return "TypeScript errors found" }
    return $true
}

# Test 3: Build
Test-Item "Project build" {
    $result = & npm run build 2>&1
    if ($LASTEXITCODE -ne 0) { return "Build failed" }
    return $true
}

# Test 4: Dev Server
Test-Item "Development server status" {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 3 -UseBasicParsing
        if ($response.StatusCode -eq 200) { return $true }
        return "Server responded with status: $($response.StatusCode)"
    }
    catch {
        return "Dev server not running"
    }
}

# Test 5: KDS Module
Test-Item "KDS module export" {
    if (-not (Test-Path "src/components/RealDataKDS.tsx")) { return "File missing" }
    $content = Get-Content "src/components/RealDataKDS.tsx" -Raw
    if ($content -notmatch "export default RealDataKDS") { return "Missing default export" }
    return $true
}

# Test 6: App routing
Test-Item "App.tsx routing" {
    if (-not (Test-Path "src/App.tsx")) { return "App.tsx missing" }
    $content = Get-Content "src/App.tsx" -Raw
    if ($content -match "//.*import.*RealDataKDS") { return "KDS still commented out" }
    if ($content -notmatch 'path="/kds"') { return "KDS route missing" }
    return $true
}

# Results
Write-Host ""
Write-Host "=== RESULTS ===" -ForegroundColor Yellow
Write-Host "Passed: $passed / $total" -ForegroundColor Green
$successRate = [math]::Round(($passed / $total) * 100, 1)
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" })

if ($successRate -ge 90) {
    Write-Host "System Status: EXCELLENT - Ready for next phase!" -ForegroundColor Green
} elseif ($successRate -ge 70) {
    Write-Host "System Status: GOOD - Minor issues need fixing" -ForegroundColor Yellow
} else {
    Write-Host "System Status: POOR - Major issues found!" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test completed at: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Gray

# TanaPOS V5 Quick Setup Script

Write-Host "🚀 Initializing TanaPOS V5..." -ForegroundColor Green

# Check if V4-mini source exists
$sourcePath = "C:\TANAPOS\tanapos-v4-mini"
$targetPath = "c:\TANAPOS\tanapos-v5"

if (-not (Test-Path $sourcePath)) {
    Write-Host "❌ V4-mini source path not found: $sourcePath" -ForegroundColor Red
    exit 1
}

Write-Host "📂 Copying V4-mini structure to V5..." -ForegroundColor Yellow

# Core folders and files to copy
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

# Copy folders
foreach ($folder in $foldersToCopy) {
    $source = Join-Path $sourcePath $folder
    $target = Join-Path $targetPath $folder
    
    if (Test-Path $source) {
        Write-Host "📁 Copying folder: $folder" -ForegroundColor Cyan
        if (Test-Path $target) {
            Remove-Item $target -Recurse -Force
        }
        Copy-Item $source $target -Recurse
    }
}

# Copy files
foreach ($file in $filesToCopy) {
    $source = Join-Path $sourcePath $file
    $target = Join-Path $targetPath $file
    
    if (Test-Path $source) {
        Write-Host "📄 Copying file: $file" -ForegroundColor Cyan
        Copy-Item $source $target
    }
}

# Update package.json
$packageJsonPath = Join-Path $targetPath "package.json"
if (Test-Path $packageJsonPath) {
    Write-Host "📝 Updating package.json..." -ForegroundColor Yellow
    $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
    $packageJson.name = "tanapos-v5"
    $packageJson.version = "5.0.0"
    $packageJson.description = "TanaPOS V5 - AI-Enhanced POS System"
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content $packageJsonPath
}

# Create .env file
$envPath = Join-Path $targetPath ".env"
if (-not (Test-Path $envPath)) {
    Write-Host "🔧 Creating .env file..." -ForegroundColor Yellow
    Copy-Item (Join-Path $targetPath ".env.example") $envPath
}

Write-Host ""
Write-Host "✅ V5 initialization completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. cd c:\TANAPOS\tanapos-v5" -ForegroundColor White
Write-Host "2. npm install" -ForegroundColor White  
Write-Host "3. Edit .env file for environment variables" -ForegroundColor White
Write-Host "4. npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📚 Reference docs:" -ForegroundColor Yellow
Write-Host "- PROJECT_ANALYSIS.md - Project analysis report" -ForegroundColor White
Write-Host "- FUNCTION_INDEX.md - Function index" -ForegroundColor White
Write-Host "- V5_DEVELOPMENT_PLAN.md - V5 development plan" -ForegroundColor White
Write-Host ""

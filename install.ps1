# Check Node.js installation and install dependencies
Write-Host "Checking Node.js installation..." -ForegroundColor Cyan

$nodeInstalled = $false
$npmInstalled = $false

try {
    $nodeVersion = node --version
    $nodeInstalled = $true
    Write-Host "Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed or not in PATH" -ForegroundColor Red
}

try {
    $npmVersion = npm --version
    $npmInstalled = $true
    Write-Host "npm is installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "npm is not installed or not in PATH" -ForegroundColor Red
}

if ($nodeInstalled -and $npmInstalled) {
    Write-Host "`nInstalling dependencies for price-monitor..." -ForegroundColor Cyan
    Set-Location -Path "$PSScriptRoot"
    
    Write-Host "Running: npm install" -ForegroundColor Yellow
    npm install
    
    Write-Host "`nChecking if .env file exists..." -ForegroundColor Cyan
    if (-not (Test-Path -Path ".env")) {
        Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
        Copy-Item -Path ".env.example" -Destination ".env"
        Write-Host ".env file created. Please edit it with your settings." -ForegroundColor Green
    } else {
        Write-Host ".env file already exists." -ForegroundColor Green
    }
    
    Write-Host "`nSetup completed successfully!" -ForegroundColor Green
    Write-Host "`nYou can now run the following commands:" -ForegroundColor Cyan
    Write-Host "- npm run add-product   (to add a product to monitor)" -ForegroundColor White
    Write-Host "- npm run check-prices  (to check current prices)" -ForegroundColor White
    Write-Host "- npm start             (to start continuous monitoring)" -ForegroundColor White
} else {
    Write-Host "`nNode.js installation is incomplete or not in PATH." -ForegroundColor Red
    Write-Host "Please make sure Node.js is installed and added to PATH." -ForegroundColor Yellow
    Write-Host "`nAfter installing Node.js, you may need to restart your computer" -ForegroundColor Yellow
    Write-Host "or open a new PowerShell window, then run this script again." -ForegroundColor Yellow
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host "Price Monitor Demo" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan

$dataDir = Join-Path -Path $PSScriptRoot -ChildPath "data"
if (-not (Test-Path $dataDir)) {
    New-Item -Path $dataDir -ItemType Directory | Out-Null
    Write-Host "Created data directory at $dataDir" -ForegroundColor Green
}

$productsFile = Join-Path -Path $dataDir -ChildPath "products.json"

# Sample product for demonstration
$product = @{
    Name = "Sample Product"
    URL = "https://example.com/product"
    TargetPrice = 99.99
    CurrentPrice = 109.95
    LastUpdated = Get-Date
}

Write-Host "`nSimulating price monitoring for: $($product.Name)" -ForegroundColor Yellow
Write-Host "URL: $($product.URL)"
Write-Host "Target Price: $$ $($product.TargetPrice)"
Write-Host "Current Price: $$ $($product.CurrentPrice)"

# Simulate price check
Write-Host "`nSimulating price checks..." -ForegroundColor Yellow
$prices = @(109.95, 105.50, 102.75, 99.85, 97.50)

foreach ($price in $prices) {
    $product.CurrentPrice = $price
    $product.LastUpdated = Get-Date
    
    Write-Host "`n[$(Get-Date)] Checking price..." -ForegroundColor Gray
    Write-Host "Current price: $$ $price" -ForegroundColor White
    
    if ($price -le $product.TargetPrice) {
        Write-Host "✅ PRICE DROP ALERT! Below target of $$ $($product.TargetPrice)" -ForegroundColor Green
    } else {
        $difference = $price - $product.TargetPrice
        Write-Host "Still $$ $difference above your target price" -ForegroundColor Yellow
    }
    
    Write-Host "Waiting for next check..." -ForegroundColor Gray
    Start-Sleep -Seconds 2
}

Write-Host "`nDemo completed!" -ForegroundColor Green
Write-Host "This script demonstrates the core functionality of the price monitor." -ForegroundColor Cyan
Write-Host "With Node.js installed, you'll be able to run the full application with additional features." -ForegroundColor Cyan

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
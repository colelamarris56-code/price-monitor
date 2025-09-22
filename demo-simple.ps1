# Demo Price Monitor - PowerShell Edition (Simple Version)
# This is a simplified version of the price monitor to demonstrate functionality

# Create the data directory if it doesn't exist
$dataDir = Join-Path -Path $PSScriptRoot -ChildPath "data"
if (-not (Test-Path $dataDir)) {
    New-Item -Path $dataDir -ItemType Directory | Out-Null
    Write-Host "Created data directory at $dataDir" -ForegroundColor Green
}

$productsFile = Join-Path -Path $dataDir -ChildPath "products.json"

# Main menu function
function Show-Menu {
    Clear-Host
    Write-Host "===== Price Monitor (PowerShell Demo) =====" -ForegroundColor Cyan
    Write-Host "1: Add a product to monitor" 
    Write-Host "2: Check current prices"
    Write-Host "3: Start monitoring (checks every minute)"
    Write-Host "4: Exit"
    Write-Host "=====================================" -ForegroundColor Cyan
}

# Add a product function
function Add-Product {
    Clear-Host
    Write-Host "=== Add Product to Price Monitor ===" -ForegroundColor Cyan
    $name = Read-Host "Enter product name"
    $url = Read-Host "Enter product URL"
    $targetPriceStr = Read-Host "Enter target price (when to alert)"
    
    # Parse target price
    try {
        $targetPrice = [decimal]$targetPriceStr
    }
    catch {
        Write-Host "Error: Invalid price format." -ForegroundColor Red
        return
    }
    
    # Create product object
    $product = @{
        Id = [guid]::NewGuid().ToString()
        Name = $name
        URL = $url
        TargetPrice = $targetPrice
        PriceHistory = @(@{
            Price = [math]::Round(($targetPrice * (Get-Random -Minimum 0.9 -Maximum 1.2)), 2)
            Date = Get-Date
        })
        CreatedAt = Get-Date
        UpdatedAt = Get-Date
    }
    
    # Save product
    $products = @()
    if (Test-Path $productsFile) {
        $fileContent = Get-Content $productsFile -Raw
        if ($fileContent) {
            try {
                $products = $fileContent | ConvertFrom-Json -AsHashtable
                # If only one product, make sure it's in an array
                if ($products -isnot [array]) {
                    $products = @($products)
                }
            }
            catch {
                Write-Host "Warning: Could not parse existing products file. Creating new one." -ForegroundColor Yellow
                $products = @()
            }
        }
    }
    
    $products += $product
    $products | ConvertTo-Json -Depth 10 | Set-Content $productsFile
    
    $currentPrice = $product.PriceHistory[0].Price
    Write-Host "`n✅ Product '$name' added successfully!" -ForegroundColor Green
    Write-Host "Current price: $$ $currentPrice" -ForegroundColor Cyan
    
    if ($currentPrice -le $targetPrice) {
        Write-Host "`n⚠️ Note: The current price ($$ $currentPrice) is already below your target price ($$ $targetPrice)." -ForegroundColor Yellow
    }
    
    Write-Host "`nPress any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Check prices function
function Check-Prices {
    Clear-Host
    Write-Host "=== Price Monitor Check ===" -ForegroundColor Cyan
    
    if (-not (Test-Path $productsFile)) {
        Write-Host "No products found. Add products first." -ForegroundColor Yellow
        return
    }
    
    $fileContent = Get-Content $productsFile -Raw
    if (-not $fileContent) {
        Write-Host "No products found. Add products first." -ForegroundColor Yellow
        return
    }
    
    try {
        $products = $fileContent | ConvertFrom-Json
        # If only one product, make sure it's in an array
        if ($products -isnot [array]) {
            $products = @($products)
        }
    }
    catch {
        Write-Host "Error parsing products file." -ForegroundColor Red
        return
    }
    
    Write-Host "Checking prices for $($products.Count) products...`n"
    
    foreach ($product in $products) {
        # Get previous price
        $previousPrice = $null
        if ($product.PriceHistory.Count -gt 0) {
            $previousPrice = $product.PriceHistory[-1].Price
        }
        
        # Generate new price with a slight tendency to decrease
        $change = Get-Random -Minimum -0.1 -Maximum 0.07
        $newPrice = if ($previousPrice) {
            [math]::Round(($previousPrice * (1 + $change)), 2)
        } else {
            [math]::Round(($product.TargetPrice * (Get-Random -Minimum 0.9 -Maximum 1.1)), 2)
        }
        
        # Add to price history
        $product.PriceHistory += @{
            Price = $newPrice
            Date = Get-Date
        }
        
        # Update product
        $product.UpdatedAt = Get-Date
        
        # Display product info
        Write-Host "📋 $($product.Name): " -NoNewline
        
        # Calculate price change
        if ($previousPrice) {
            $diff = $newPrice - $previousPrice
            $percentChange = ($diff / $previousPrice) * 100
            $changeSymbol = if ($diff -eq 0) { "→" } elseif ($diff -gt 0) { "↑" } else { "↓" }
            $priceChange = " ($changeSymbol $([Math]::Abs($diff).ToString("F2")), $([Math]::Abs($percentChange).ToString("F2"))%)"
            
            $color = if ($diff -lt 0) { "Green" } elseif ($diff -gt 0) { "Red" } else { "White" }
            Write-Host "$$ $newPrice$priceChange" -ForegroundColor $color -NoNewline
        } else {
            Write-Host "$$ $newPrice" -ForegroundColor White -NoNewline
        }
        
        if ($newPrice -le $product.TargetPrice) {
            Write-Host " ✅ BELOW TARGET!" -ForegroundColor Green
        } else {
            Write-Host ""
        }
        
        Write-Host "  URL: $($product.URL)"
        Write-Host "  Target price: $$ $($product.TargetPrice)"
        Write-Host "  Price history:"
        
        # Display last 5 price points
        $historyCount = [Math]::Min($product.PriceHistory.Count, 5)
        $historyToShow = $product.PriceHistory | Select-Object -Last $historyCount
        
        foreach ($point in $historyToShow) {
            $date = [DateTime]$point.Date
            Write-Host "    $($date.ToString("MM/dd/yyyy HH:mm:ss")): $$ $($point.Price)"
        }
        
        Write-Host ""
    }
    
    # Save updated products
    $products | ConvertTo-Json -Depth 10 | Set-Content $productsFile
    
    Write-Host "Price check completed." -ForegroundColor Green
    
    if (-not $script:monitoring) {
        Write-Host "`nPress any key to continue..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
}

# Start monitoring function
function Start-Monitoring {
    Clear-Host
    $interval = 60 # seconds for demo (equivalent to 1 minute)
    
    Write-Host "Starting Price Monitor (Demo Mode)" -ForegroundColor Cyan
    Write-Host "Monitoring prices every $interval seconds (Press Ctrl+C to stop)" -ForegroundColor Yellow
    
    $script:monitoring = $true
    
    try {
        while ($true) {
            Write-Host "`n[$(Get-Date)] Running scheduled price check..." -ForegroundColor Gray
            Check-Prices
            Write-Host "Waiting for next check cycle..." -ForegroundColor Gray
            Start-Sleep -Seconds $interval
        }
    }
    catch {
        Write-Host "`nMonitoring stopped." -ForegroundColor Yellow
    }
    finally {
        $script:monitoring = $false
    }
}

# Main program
$script:monitoring = $false
$exit = $false

while (-not $exit) {
    Show-Menu
    $choice = Read-Host "Enter your choice (1-4)"
    
    switch ($choice) {
        "1" { Add-Product }
        "2" { Check-Prices }
        "3" { Start-Monitoring }
        "4" { $exit = $true }
        default {
            Write-Host "Invalid choice. Please try again." -ForegroundColor Red
            Start-Sleep -Seconds 2
        }
    }
}

Write-Host "Thank you for using Price Monitor!" -ForegroundColor Cyan
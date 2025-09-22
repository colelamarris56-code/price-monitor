# Demo Price Monitor - PowerShell Edition
# This is a simplified version of the price monitor to demonstrate functionality

function Write-ColorOutput {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Text,
        
        [Parameter(Mandatory=$false)]
        [ConsoleColor]$ForegroundColor = [ConsoleColor]::White,
        
        [switch]$NoNewline
    )
    
    $originalColor = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    
    if ($NoNewline) {
        Write-Host $Text -NoNewline
    } else {
        Write-Host $Text
    }
    
    $host.UI.RawUI.ForegroundColor = $originalColor
}

function Add-Product {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Name,
        
        [Parameter(Mandatory=$true)]
        [string]$URL,
        
        [Parameter(Mandatory=$true)]
        [decimal]$TargetPrice
    )
    
    # Create product data structure
    $product = @{
        Id = [Guid]::NewGuid().ToString()
        Name = $Name
        URL = $URL
        TargetPrice = $TargetPrice
        PriceHistory = @()
        CreatedAt = Get-Date
        UpdatedAt = Get-Date
    }
    
    # Simulate getting current price
    $currentPrice = Get-Random -Minimum ($TargetPrice * 0.8) -Maximum ($TargetPrice * 1.2)
    $currentPrice = [Math]::Round($currentPrice, 2)
    
    # Add price to history
    $product.PriceHistory += @{
        Price = $currentPrice
        Date = Get-Date
    }
    
    # Save product to "database" (a JSON file)
    $dataDir = Join-Path -Path $PSScriptRoot -ChildPath "data"
    if (-not (Test-Path $dataDir)) {
        New-Item -Path $dataDir -ItemType Directory | Out-Null
    }
    
    $productsFile = Join-Path -Path $dataDir -ChildPath "products.json"
    
    # Load existing products or create new array
    if (Test-Path $productsFile) {
        $products = Get-Content $productsFile | ConvertFrom-Json
    } else {
        $products = @()
    }
    
    # Add new product and save
    $products += $product
    $products | ConvertTo-Json -Depth 10 | Set-Content $productsFile
    
    Write-ColorOutput "`n✅ Product '$Name' added successfully!" -ForegroundColor Green
    Write-ColorOutput "Current price: $$ $currentPrice" -ForegroundColor Cyan
    
    if ($currentPrice -le $TargetPrice) {
        Write-ColorOutput "`n⚠️ Note: The current price ($$ $currentPrice) is already below your target price ($$ $TargetPrice)." -ForegroundColor Yellow
    }
}

function Check-Prices {
    # Load products from "database" (a JSON file)
    $dataDir = Join-Path -Path $PSScriptRoot -ChildPath "data"
    $productsFile = Join-Path -Path $dataDir -ChildPath "products.json"
    
    if (-not (Test-Path $productsFile)) {
        Write-ColorOutput "No products found. Add products first." -ForegroundColor Yellow
        return
    }
    
    $products = Get-Content $productsFile | ConvertFrom-Json
    
    Write-ColorOutput "=== Price Monitor Check ===" -ForegroundColor Cyan
    Write-ColorOutput "Checking prices for $($products.Count) products...`n"
    
    foreach ($product in $products) {
        Write-ColorOutput "📋 $($product.Name): " -ForegroundColor White -NoNewline
        
        # Simulate getting current price
        $previousPrice = if ($product.PriceHistory.Count -gt 0) { $product.PriceHistory[-1].Price } else { $null }
        
        # Simulate price change with a slight tendency to decrease
        $change = Get-Random -Minimum -0.1 -Maximum 0.07
        $newPrice = if ($previousPrice) { $previousPrice * (1 + $change) } else { $product.TargetPrice * (Get-Random -Minimum 0.9 -Maximum 1.1) }
        $newPrice = [Math]::Round($newPrice, 2)
        
        # Add to price history
        $product.PriceHistory += @{
            Price = $newPrice
            Date = Get-Date
        }
        
        # Update product
        $product.UpdatedAt = Get-Date
        
        # Calculate price change
        if ($previousPrice) {
            $diff = $newPrice - $previousPrice
            $percentChange = ($diff / $previousPrice) * 100
            $changeSymbol = if ($diff -eq 0) { "→" } elseif ($diff -gt 0) { "↑" } else { "↓" }
            $priceChange = " ($changeSymbol $([Math]::Abs($diff).ToString("F2")), $([Math]::Abs($percentChange).ToString("F2"))%)"
            
            $color = if ($diff -lt 0) { [ConsoleColor]::Green } elseif ($diff -gt 0) { [ConsoleColor]::Red } else { [ConsoleColor]::White }
            Write-Host "$$ $newPrice$priceChange" -ForegroundColor $color -NoNewline
            
            if ($newPrice -le $product.TargetPrice) {
                Write-Host " ✅ BELOW TARGET!" -ForegroundColor Green
            } else {
                Write-Host ""
            }
        } else {
            Write-Host "$$ $newPrice" -ForegroundColor White -NoNewline
            
            if ($newPrice -le $product.TargetPrice) {
                Write-Host " ✅ BELOW TARGET!" -ForegroundColor Green
            } else {
                Write-Host ""
            }
        }
        
        Write-ColorOutput "  URL: $($product.URL)"
        Write-ColorOutput "  Target price: $$ $($product.TargetPrice)"
        Write-ColorOutput "  Price history:"
        
        # Display last 5 price points
        $historyCount = [Math]::Min($product.PriceHistory.Count, 5)
        $historyToShow = $product.PriceHistory | Select-Object -Last $historyCount
        
        foreach ($point in $historyToShow) {
            $date = [DateTime]$point.Date
            Write-ColorOutput "    $($date.ToString("MM/dd/yyyy HH:mm:ss")): $$ $($point.Price)"
        }
        
        Write-ColorOutput ""
    }
    
    # Save updated products
    $products | ConvertTo-Json -Depth 10 | Set-Content $productsFile
    
    Write-ColorOutput "Price check completed." -ForegroundColor Green
}

function Start-Monitoring {
    $interval = 60 # seconds for demo (equivalent to 1 minute)
    
    Write-ColorOutput "Starting Price Monitor (Demo Mode)" -ForegroundColor Cyan
    Write-ColorOutput "Monitoring prices every $interval seconds (Press Ctrl+C to stop)" -ForegroundColor Yellow
    
    try {
        while ($true) {
            Write-ColorOutput "`n[$(Get-Date)] Running scheduled price check..." -ForegroundColor Gray
            Check-Prices
            Write-ColorOutput "Waiting for next check cycle..." -ForegroundColor Gray
            Start-Sleep -Seconds $interval
        }
    }
    catch {
        Write-ColorOutput "`nMonitoring stopped." -ForegroundColor Yellow
    }
}

# Main menu
function Show-Menu {
    Clear-Host
    Write-ColorOutput "===== Price Monitor (PowerShell Demo) =====" -ForegroundColor Cyan
    Write-ColorOutput "1: Add a product to monitor"
    Write-ColorOutput "2: Check current prices"
    Write-ColorOutput "3: Start monitoring (checks every minute)"
    Write-ColorOutput "4: Exit"
    Write-ColorOutput "=====================================" -ForegroundColor Cyan
}

# Main program loop
$exit = $false
while (-not $exit) {
    Show-Menu
    $choice = Read-Host "Enter your choice (1-4)"
    
    switch ($choice) {
        "1" {
            Clear-Host
            Write-ColorOutput "=== Add Product to Price Monitor ===" -ForegroundColor Cyan
            $name = Read-Host "Enter product name"
            $url = Read-Host "Enter product URL"
            $targetPriceStr = Read-Host "Enter target price (when to alert)"
            
            $targetPrice = 0
            if ([decimal]::TryParse($targetPriceStr, [ref]$targetPrice)) {
                Add-Product -Name $name -URL $url -TargetPrice $targetPrice
            } else {
                Write-ColorOutput "Error: Invalid price format." -ForegroundColor Red
            }
            
            Write-Host "Press any key to continue..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        "2" {
            Clear-Host
            Check-Prices
            Write-Host "Press any key to continue..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        "3" {
            Clear-Host
            Start-Monitoring
        }
        "4" {
            $exit = $true
        }
        default {
            Write-ColorOutput "Invalid choice. Please try again." -ForegroundColor Red
            Start-Sleep -Seconds 2
        }
    }
}

Write-ColorOutput "Thank you for using Price Monitor!" -ForegroundColor Cyan
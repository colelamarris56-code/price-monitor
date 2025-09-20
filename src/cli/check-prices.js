require('dotenv').config();
const productRepository = require('../models/product-repository');
const priceChecker = require('../scrapers/price-checker');
const logger = require('../utils/logger');

/**
 * Format price history for display
 * @param {Array<Object>} history - Price history
 * @returns {string} Formatted history
 */
function formatPriceHistory(history) {
  if (!history || history.length === 0) {
    return 'No price history available';
  }
  
  return history
    .map(point => {
      const date = new Date(point.date);
      return `  ${date.toLocaleDateString()} ${date.toLocaleTimeString()}: $${point.price.toFixed(2)}`;
    })
    .join('\n');
}

/**
 * Check prices for all products
 */
async function checkAllPrices() {
  try {
    console.log('=== Price Monitor Check ===\n');
    
    const products = await productRepository.getAll();
    if (products.length === 0) {
      console.log('No products found. Add products first using "npm run add-product".');
      return;
    }
    
    console.log(`Checking prices for ${products.length} products...\n`);
    
    for (const product of products) {
      process.stdout.write(`📋 ${product.name}: `);
      
      const price = await priceChecker.checkProductPrice(product);
      
      if (price === null) {
        console.log('❌ Failed to retrieve price');
        continue;
      }
      
      product.addPricePoint(price);
      await productRepository.save(product);
      
      const previousPrice = product.getPreviousPrice();
      let priceChange = '';
      
      if (previousPrice !== null) {
        const diff = price - previousPrice;
        const percentChange = (diff / previousPrice) * 100;
        const changeSymbol = diff === 0 ? '→' : diff > 0 ? '↑' : '↓';
        priceChange = ` (${changeSymbol} ${Math.abs(diff).toFixed(2)}, ${Math.abs(percentChange).toFixed(2)}%)`;
      }
      
      const targetStatus = price <= product.targetPrice ? ' ✅ BELOW TARGET!' : '';
      console.log(`$${price.toFixed(2)}${priceChange}${targetStatus}`);
      
      console.log(`  URL: ${product.url}`);
      console.log(`  Target price: $${product.targetPrice.toFixed(2)}`);
      console.log('  Price history:');
      console.log(formatPriceHistory(product.priceHistory.slice(-5)));
      console.log(''); // Empty line for spacing
    }
    
    console.log('Price check completed.');
  } catch (error) {
    logger.error('Error checking prices:', error);
    console.error('Failed to check prices:', error.message);
  }
}

checkAllPrices();
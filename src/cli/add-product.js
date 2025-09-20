require('dotenv').config();
const readline = require('readline');
const Product = require('../models/product');
const productRepository = require('../models/product-repository');
const { checkProductPrice } = require('../scrapers/price-checker');
const logger = require('../utils/logger');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Prompt for user input
 * @param {string} question - Question to ask
 * @returns {Promise<string>} User input
 */
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Main function to add a product
 */
async function addProduct() {
  try {
    console.log('=== Add Product to Price Monitor ===\n');
    
    // Get product details from user
    const url = await prompt('Enter product URL: ');
    const name = await prompt('Enter product name: ');
    const targetPriceStr = await prompt('Enter target price (when to alert): ');
    const targetPrice = parseFloat(targetPriceStr);
    
    if (isNaN(targetPrice)) {
      console.error('Error: Target price must be a number');
      process.exit(1);
    }
    
    const selector = await prompt('Enter price selector (leave empty for default ".price"): ');
    
    // Create product
    const product = new Product({
      name,
      url,
      targetPrice,
      selector: selector || '.price'
    });
    
    // Check if we can extract the price
    console.log('\nChecking if price can be extracted...');
    const currentPrice = await checkProductPrice(product);
    
    if (currentPrice === null) {
      console.log('\n⚠️ Warning: Could not extract price with the provided selector.');
      const proceed = await prompt('Do you want to proceed anyway? (y/n): ');
      
      if (proceed.toLowerCase() !== 'y') {
        console.log('Product not added.');
        process.exit(0);
      }
    } else {
      console.log(`\n✅ Current price: $${currentPrice}`);
      product.addPricePoint(currentPrice);
    }
    
    // Save product
    await productRepository.save(product);
    console.log(`\n✅ Product "${name}" added successfully!`);
    
    if (currentPrice !== null && currentPrice <= targetPrice) {
      console.log(`\n⚠️ Note: The current price ($${currentPrice}) is already below your target price ($${targetPrice}).`);
    }
  } catch (error) {
    logger.error('Error adding product:', error);
    console.error('Failed to add product:', error.message);
  } finally {
    rl.close();
  }
}

addProduct();
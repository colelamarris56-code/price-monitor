const axios = require('axios');
const cheerio = require('cheerio');
const productRepository = require('../models/product-repository');
const notificationService = require('../utils/notification-service');
const logger = require('../utils/logger');

/**
 * Price checker that handles scraping product prices
 */
class PriceChecker {
  /**
   * Extract price from HTML content
   * @param {string} html - HTML content
   * @param {string} selector - CSS selector for price
   * @returns {number|null} Extracted price or null if not found
   */
  extractPrice(html, selector) {
    try {
      const $ = cheerio.load(html);
      const priceText = $(selector).first().text();
      
      // Extract price using regex (handles different formats)
      const priceMatch = priceText.match(/[\d,.]+/);
      if (!priceMatch) return null;
      
      // Convert price string to number
      const price = parseFloat(priceMatch[0].replace(/,/g, ''));
      return isNaN(price) ? null : price;
    } catch (error) {
      logger.error('Error extracting price:', error);
      return null;
    }
  }

  /**
   * Check price for a single product
   * @param {Product} product - Product to check
   * @returns {Promise<number|null>} Current price or null if failed
   */
  async checkProductPrice(product) {
    try {
      logger.info(`Checking price for ${product.name} at ${product.url}`);
      
      // Add random user agent to avoid blocking
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      };
      
      const response = await axios.get(product.url, { headers });
      const price = this.extractPrice(response.data, product.selector);
      
      if (price === null) {
        logger.warn(`Failed to extract price for ${product.name}`);
        return null;
      }
      
      logger.info(`Current price for ${product.name}: $${price}`);
      return price;
    } catch (error) {
      logger.error(`Error checking price for ${product.name}:`, error.message);
      return null;
    }
  }

  /**
   * Check prices for all products
   */
  async checkPrices() {
    try {
      const products = await productRepository.getAll();
      logger.info(`Checking prices for ${products.length} products`);
      
      for (const product of products) {
        const currentPrice = await this.checkProductPrice(product);
        
        if (currentPrice === null) {
          continue;
        }
        
        const previousPrice = product.getPreviousPrice();
        
        // Add current price to history
        product.addPricePoint(currentPrice);
        await productRepository.save(product);
        
        // Check if price dropped below target
        if (product.isPriceBelowTarget(currentPrice) && 
            (previousPrice === null || currentPrice < previousPrice)) {
          await notificationService.sendPriceAlert(product, previousPrice || currentPrice, currentPrice);
        }
      }
      
      return true;
    } catch (error) {
      logger.error('Error checking prices:', error);
      throw error;
    }
  }
}

module.exports = new PriceChecker();
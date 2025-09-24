
// src/index.js

const logger = require('./utils/logger');
const { getProducts, updatePrice } = require('./services/firebase');
const { launchBrowser, closeBrowser } = require('./utils/browserManager');
const amazon = require('./adapters/amazon');
const newegg = require('./adapters/newegg'); // Import the newegg adapter

async function main() {
  try {
    logger.info('Starting Price Monitor application');
    const browser = await launchBrowser();
    const products = await getProducts();

    const adapters = [amazon, newegg]; // Add the newegg adapter to the array

    for (const product of products) {
      for (const adapter of adapters) {
        if (adapter.canHandle(product.url)) {
          const priceData = await adapter.scrapePrice(browser, product.url);
          await updatePrice(product.id, priceData);
          logger.info(`Updated price for ${product.name}`, priceData);
          break;
        }
      }
    }

    await closeBrowser();
    logger.info('Price Monitor application finished');
  } catch (error) {
    logger.error('Failed to start application:', error);
  }
}

main();

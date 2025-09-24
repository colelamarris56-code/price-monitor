
// src/jobs/scheduler.js

const cron = require('node-cron');
const { queue } = require('../services/queue');
const { getProducts } = require('../services/firebase');
const logger = require('../utils/logger');
const { retry } = require('../utils/retry');

/**
 * Enqueues price check jobs for all products.
 * @returns {Promise<number>} - The number of jobs enqueued.
 */
async function enqueuePriceChecks() {
  logger.info('Enqueuing price checks...');
  try {
    let products = await retry(getProducts, 3, 1000, (error) => {
        logger.warn('Retrying getProducts due to error:', error.message);
    });

    if (!products) {
        products = [];
    }

    // Add a hardcoded Newegg product for demonstration
    products.push({
        id: 'newegg-demo-product',
        url: 'https://www.newegg.com/p/N82E16834233545'
    });


    if (products.length === 0) {
        logger.info('No products to enqueue.');
        return 0;
    }
    for (const product of products) {
      if (product && product.id && product.url) {
        await retry(async () => {
            await queue.add('priceCheck', { productId: product.id, url: product.url });
        }, 3, 500, (error) => {
            logger.warn(`Retrying to enqueue product ${product.id} due to error:`, error.message);
        });
      } else {
        logger.error('Invalid product data, skipping enqueue:', product);
      }
    }
    logger.info(`Enqueued ${products.length} price checks.`);
    return products.length;
  } catch (error) {
    logger.error('Error enqueuing price checks after multiple retries:', error);
    throw error; // Re-throw to allow caller to handle
  }
}

/**
 * Schedules price check jobs for all products to run periodically.
 */
function schedulePriceChecks() {
  // Schedule to run every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('Running scheduled price checks...');
    try {
      await enqueuePriceChecks();
    } catch (error) {
      logger.error('Error running scheduled price checks:', error);
    }
  });
}

module.exports = { schedulePriceChecks, enqueuePriceChecks };

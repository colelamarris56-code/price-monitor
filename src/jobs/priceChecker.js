
// src/jobs/priceChecker.js

const { queue } = require('../services/queue');
const amazonAdapter = require('../adapters/amazon');
const { updatePrice } = require('../services/firebase');
const logger = require('../utils/logger');

/**
 * Processes price check jobs from the queue.
 */
function processPriceChecks() {
  queue.process('priceCheck', async (job) => {
    const { productId, url } = job.data;
    logger.info(`Checking price for ${productId} at ${url}...`);

    try {
        const result = await amazonAdapter.fetchPrice(url);

        if (result.price) {
          await updatePrice(productId, result);
          logger.info(`Price updated for ${productId}:`, result);
        } else {
          logger.info(`Could not fetch price for ${productId}.`);
        }
    } catch (error) {
        logger.error(`Error checking price for ${productId}:`, error);
    }
  });
}

module.exports = { processPriceChecks };


// src/jobs/priceChecker.js

const { queue } = require('../services/queue');
const amazonAdapter = require('../adapters/amazon');
const { updatePrice } = require('../services/firebase');
const logger = require('../utils/logger');
const { retry } = require('../utils/retry');

/**
 * Processes price check jobs from the queue.
 */
function processPriceChecks() {
  queue.process('priceCheck', async (job) => {
    const { productId, url } = job.data;
    logger.info(`Checking price for ${productId} at ${url}...`);

    try {
        const result = await retry(async () => {
            const priceResult = await amazonAdapter.fetchPrice(url);
            if (!priceResult || !priceResult.price) {
                throw new Error(`Price not found for ${url}`);
            }
            return priceResult;
        }, 3, 2000, (error) => {
            logger.warn(`Retrying fetchPrice for ${productId} due to error:`, error.message);
        });

        await retry(async () => {
            await updatePrice(productId, result);
        }, 3, 1000, (error) => {
            logger.warn(`Retrying updatePrice for ${productId} due to error:`, error.message);
        });
        
        logger.info(`Price updated for ${productId}:`, result);

    } catch (error) {
        logger.error(`Failed to process price check for ${productId} after multiple retries:`, error.message);
        // Optionally re-throw to use queue's retry mechanism
        // throw error;
    }
  });
}

module.exports = { processPriceChecks };

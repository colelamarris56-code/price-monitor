const { queue } = require('../services/queue');
const amazonAdapter = require('../adapters/amazon');
const neweggAdapter = require('../adapters/newegg'); // Import the new adapter
const { updatePrice } = require('../services/firebase');
const logger = require('../utils/logger');
const { retry } = require('../utils/retry');

const adapters = {
    'amazon.com': amazonAdapter,
    'newegg.com': neweggAdapter
};

function getAdapter(url) {
    const domain = new URL(url).hostname.replace('www.', '');
    return adapters[domain];
}

/**
 * Processes price check jobs from the queue.
 */
function processPriceChecks() {
  queue.process('priceCheck', async (job) => {
    const { productId, url } = job.data;
    logger.info(`Checking price for ${productId} at ${url}...`);

    const adapter = getAdapter(url);
    if (!adapter) {
        logger.error(`No adapter found for URL: ${url}`);
        return;
    }

    try {
        const result = await retry(async () => {
            const priceResult = await adapter.fetchPrice(url);
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
    }
  });
}

module.exports = { processPriceChecks };
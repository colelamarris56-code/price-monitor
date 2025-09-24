require('dotenv').config();
const { schedulePriceChecks } = require('./jobs/scheduler');
const { processPriceChecks } = require('./jobs/priceChecker');
const { launchBrowser, closeBrowser } = require('./utils/browserManager');
const logger = require('./utils/logger');

async function main() {
    try {
        logger.info('Starting Price Monitor application');
        await launchBrowser();
        processPriceChecks();
        schedulePriceChecks();
        logger.info(`Price monitoring jobs are scheduled and workers are running.`);
    } catch (error) {
        logger.error('Failed to start application:', error);
        await closeBrowser();
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    logger.info('Application shutting down');
    await closeBrowser();
    process.exit(0);
});

main();
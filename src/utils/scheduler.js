const cron = require('node-cron');
const { checkPrices } = require('../scrapers/price-checker');
const logger = require('./logger');

/**
 * Schedule jobs to run at specific intervals
 */
function scheduleJobs() {
    const interval = process.env.MONITORING_INTERVAL_MINUTES || 60;

    // Convert minutes to cron expression
    const cronExpression = `*/${interval} * * * *`;

    // Schedule price checking job
    cron.schedule(cronExpression, async () => {
        logger.info('Running scheduled price check');
        try {
            await checkPrices();
            logger.info('Price check completed successfully');
        } catch (error) {
            logger.error('Error during price check:', error);
        }
    });

    logger.info(`Scheduled price checks every ${interval} minutes`);
}

module.exports = {
    scheduleJobs
};
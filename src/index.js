require('dotenv').config();
const { scheduleJobs } = require('./utils/scheduler');
const logger = require('./utils/logger');

async function main() {
    try {
        logger.info('Starting Price Monitor application');
        scheduleJobs();
        logger.info(`Price monitoring started with interval: ${process.env.MONITORING_INTERVAL_MINUTES} minutes`);
    } catch (error) {
        logger.error('Failed to start application:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    logger.info('Application shutting down');
    process.exit(0);
});

main();
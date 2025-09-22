
// src/utils/logger.js

const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', '..', 'logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'app.log');

const logger = {
  log: (level, message, ...args) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message} ${args.length > 0 ? JSON.stringify(args) : ''}\n`;
    fs.appendFileSync(logFile, logMessage);
    // Also log to console
    console.log(logMessage);
  },
  info: (message, ...args) => {
    logger.log('info', message, ...args);
  },
  error: (message, ...args) => {
    logger.log('error', message, ...args);
  },
  debug: (message, ...args) => {
    logger.log('debug', message, ...args);
  },
};

module.exports = logger;

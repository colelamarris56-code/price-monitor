
// src/api/index.js

const express = require('express');
const routes = require('./routes');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  logger.info(`Request received: ${req.method} ${req.originalUrl}`);
  res.on('finish', () => {
    logger.info(`Response sent: ${res.statusCode} for ${req.method} ${req.originalUrl}`);
  });
  next();
});

app.use('/api', routes);

// Route to get logs
app.get('/api/logs', (req, res) => {
  try {
    const logDir = path.join(__dirname, '..', '..', 'logs');
    const logFile = path.join(logDir, 'app.log');
    if (fs.existsSync(logFile)) {
      const logs = fs.readFileSync(logFile, 'utf8');
      res.type('text/plain').send(logs);
    } else {
      res.status(404).send('Log file not found.');
    }
  } catch (error) {
    logger.error('Error reading log file:', error);
    res.status(500).send('Internal Server Error');
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  logger.info(`API server listening on port ${port}`);
});

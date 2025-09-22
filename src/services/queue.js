
// src/services/queue.js

const Bull = require('bull');

// Initialize Bull queue (replace with your Redis connection details)
const queue = new Bull('priceCheck', 'redis://127.0.0.1:6379');

module.exports = { queue };

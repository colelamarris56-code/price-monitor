
// src/api/routes.js

const express = require('express');
const { db } = require('../services/firebase');
const { queue } = require('../services/queue');
const { enqueuePriceChecks } = require('../jobs/scheduler');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/price-data
router.get('/price-data', async (req, res) => {
  try {
    logger.info('Fetching price data');
    const trendingSnap = await db.ref('/trending/daily').limitToLast(10).once('value');
    const alertsSnap = await db.ref('/alerts').limitToLast(10).once('value');
    const statsSnap = await db.ref('/stats/global').once('value');

    res.json({
      trending: trendingSnap.val() || {},
      recentAlerts: alertsSnap.val() || {},
      stats: statsSnap.val() || {},
    });
  } catch (error) {
    logger.error('Error fetching price data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// GET /api/products/:id
router.get('/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    logger.info(`Fetching product ${productId}`);
    const productSnap = await db.ref(`/products/${productId}`).once('value');
    const pricesSnap = await db.ref(`/prices/${productId}`).limitToLast(50).once('value');

    if (!productSnap.exists()) {
      logger.info(`Product ${productId} not found`);
      return res.status(404).send('Product not found');
    }

    res.json({
      ...productSnap.val(),
      prices: pricesSnap.val() || {},
    });
  } catch (error) {
    logger.error(`Error fetching product ${req.params.id}:`, error);
    res.status(500).send('Internal Server Error');
  }
});

// POST /api/track
router.post('/track', async (req, res) => {
  try {
    const { url, targetPrice, tags } = req.body;
    if (!url || !targetPrice) {
      return res.status(400).send('Missing required fields: url, targetPrice');
    }

    const productId = Buffer.from(url).toString('base64');
    logger.info(`Tracking product ${productId}`);
    const productRef = db.ref(`/products/${productId}`);

    await productRef.set({
      url,
      targetPrice,
      tags: tags || [],
      createdAt: Date.now(),
    });

    await queue.add('priceCheck', { productId, url });

    res.status(201).json({ productId });
  } catch (error) {
    logger.error('Error tracking product:', error);
    res.status(500).send('Internal Server Error');
  }
});

// POST /api/trigger-check
router.post('/trigger-check', async (req, res) => {
  try {
    logger.info('Triggering price checks');
    const count = await enqueuePriceChecks();
    res.json({ message: `Successfully enqueued ${count} price checks.` });
  } catch (error) {
    logger.error('Error triggering price checks:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;

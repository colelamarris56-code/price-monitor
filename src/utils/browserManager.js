
// src/utils/browserManager.js

const playwright = require('playwright');
const logger = require('./logger');

let browser;

async function launchBrowser() {
  if (!browser) {
    try {
      logger.info('Launching browser...');
      browser = await playwright.chromium.launch();
    } catch (error) {
      logger.error('Error launching browser:', error);
      throw error;
    }
  }
  return browser;
}

async function getBrowser() {
  if (!browser) {
    return await launchBrowser();
  }
  return browser;
}

async function closeBrowser() {
  if (browser) {
    try {
      await browser.close();
      browser = null;
      logger.info('Browser closed.');
    } catch (error) {
      logger.error('Error closing browser:', error);
      throw error;
    }
  }
}

module.exports = { getBrowser, closeBrowser };

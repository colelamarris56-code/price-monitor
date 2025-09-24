
// src/adapters/amazon.js

const { getBrowser } = require('../utils/browserManager');
const logger = require('../utils/logger');

/**
 * Fetches the price of a product from an Amazon URL.
 *
 * @param {string} url - The Amazon product URL.
 * @returns {Promise<object>} - A promise that resolves to an object containing the price, currency, and availability.
 */
async function fetchPrice(url) {
  let context;
  try {
    const browser = await getBrowser();
    context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

    const priceElement = await page.$('.a-price-whole');
    if (!priceElement) {
      throw new Error('Price element not found on page.');
    }

    const priceText = await priceElement.innerText();
    const price = parseFloat(priceText.replace(/,/g, ''));

    if (isNaN(price)) {
      throw new Error(`Could not parse price from text: "${priceText}"`);
    }

    const currencyElement = await page.$('.a-price-symbol');
    const currency = currencyElement ? await currencyElement.innerText() : null;

    const availabilityElement = await page.$('#availability');
    const availabilityText = availabilityElement ? (await availabilityElement.innerText()).toLowerCase() : 'in stock';
    const availability = availabilityText.includes('in stock') ? 'in_stock' : 'out_of_stock';

    return {
      price,
      currency,
      availability,
    };
  } catch (error) {
    logger.error(`Error fetching price from ${url}:`, error.message);
    throw error; // Re-throw to allow for retries
  } finally {
    if (context) {
      await context.close();
    }
  }
}

module.exports = { fetchPrice };

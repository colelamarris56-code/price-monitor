
// src/adapters/amazon.js

const playwright = require('playwright');

/**
 * Fetches the price of a product from an Amazon URL.
 *
 * @param {string} url - The Amazon product URL.
 * @returns {Promise<object>} - A promise that resolves to an object containing the price, currency, and availability.
 */
async function fetchPrice(url) {
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle' });

    const priceElement = await page.$('.a-price-whole');
    const currencyElement = await page.$('.a-price-symbol');
    const availabilityElement = await page. $('#availability');

    const price = priceElement ? await priceElement.innerText() : null;
    const currency = currencyElement ? await currencyElement.innerText() : null;
    const availability = availabilityElement ? await availabilityElement.innerText() : 'in_stock'; // Default to in_stock

    return {
      price: parseFloat(price.replace(/,/g, '')),
      currency,
      availability,
    };
  } catch (error) {
    console.error(`Error fetching price for ${url}:`, error);
    return { price: null, currency: null, availability: 'out_of_stock' };
  } finally {
    await browser.close();
  }
}

module.exports = { fetchPrice };

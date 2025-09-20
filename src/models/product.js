/**
 * Product model representing an item being tracked
 */
class Product {
  /**
   * Create a new product
   * @param {Object} data - Product data
   * @param {string} data.id - Unique identifier
   * @param {string} data.name - Product name
   * @param {string} data.url - Product URL
   * @param {number} data.targetPrice - Target price for alerts
   * @param {string} data.selector - CSS selector to find the price
   * @param {Array<Object>} data.priceHistory - History of price checks
   */
  constructor(data) {
    this.id = data.id || Date.now().toString();
    this.name = data.name;
    this.url = data.url;
    this.targetPrice = data.targetPrice;
    this.selector = data.selector || '.price';
    this.priceHistory = data.priceHistory || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = new Date();
  }

  /**
   * Add a price point to history
   * @param {number} price - The current price
   */
  addPricePoint(price) {
    this.priceHistory.push({
      price,
      date: new Date()
    });
    this.updatedAt = new Date();
  }

  /**
   * Check if current price is below target
   * @param {number} currentPrice - Current product price
   * @returns {boolean} True if price is below target
   */
  isPriceBelowTarget(currentPrice) {
    return currentPrice <= this.targetPrice;
  }

  /**
   * Get the previous price
   * @returns {number|null} Previous price or null if no history
   */
  getPreviousPrice() {
    if (this.priceHistory.length < 2) {
      return null;
    }
    return this.priceHistory[this.priceHistory.length - 2].price;
  }

  /**
   * Check if price has dropped since last check
   * @param {number} currentPrice - Current product price
   * @returns {boolean} True if price dropped
   */
  hasPriceDropped(currentPrice) {
    const previousPrice = this.getPreviousPrice();
    if (previousPrice === null) {
      return false;
    }
    return currentPrice < previousPrice;
  }

  /**
   * Convert to plain object for storage
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      url: this.url,
      targetPrice: this.targetPrice,
      selector: this.selector,
      priceHistory: this.priceHistory,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Product;
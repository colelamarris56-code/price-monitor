const nodemailer = require('nodemailer');
const logger = require('./logger');

/**
 * Service to handle sending notifications
 */
class NotificationService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    /**
     * Send price alert email
     * @param {Object} product - The product with price drop
     * @param {number} oldPrice - Previous price
     * @param {number} newPrice - Current price
     */
    async sendPriceAlert(product, oldPrice, newPrice) {
        try {
            const priceDrop = oldPrice - newPrice;
            const percentDrop = (priceDrop / oldPrice) * 100;

            const mailOptions = {
                from: process.env.SMTP_USER,
                to: process.env.NOTIFICATION_EMAIL,
                subject: `Price Drop Alert: ${product.name}`,
                html: `
          <h2>Price Drop Alert!</h2>
          <p><strong>${product.name}</strong> is now cheaper!</p>
          <ul>
            <li>Old price: $${oldPrice.toFixed(2)}</li>
            <li>New price: $${newPrice.toFixed(2)}</li>
            <li>Price drop: $${priceDrop.toFixed(2)} (${percentDrop.toFixed(2)}%)</li>
            <li>URL: <a href="${product.url}">${product.url}</a></li>
          </ul>
          <p>This is below your target price of $${product.targetPrice.toFixed(2)}.</p>
        `
            };

            await this.transporter.sendMail(mailOptions);
            logger.info(`Price alert sent for ${product.name}`);
        } catch (error) {
            logger.error('Failed to send price alert email:', error);
            throw error;
        }
    }
}

module.exports = new NotificationService();
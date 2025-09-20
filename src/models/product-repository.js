const fs = require('fs').promises;
const path = require('path');
const Product = require('./product');
const logger = require('../utils/logger');

/**
 * Repository for managing product data persistence
 */
class ProductRepository {
    constructor() {
        this.dataPath = path.join(process.cwd(), 'data');
        this.filePath = path.join(this.dataPath, 'products.json');
    }

    /**
     * Ensure data directory exists
     */
    async ensureDataDirectory() {
        try {
            await fs.mkdir(this.dataPath, { recursive: true });
        } catch (error) {
            logger.error('Failed to create data directory:', error);
            throw error;
        }
    }

    /**
     * Get all products
     * @returns {Promise<Array<Product>>} List of products
     */
    async getAll() {
        try {
            await this.ensureDataDirectory();

            try {
                const data = await fs.readFile(this.filePath, 'utf8');
                const products = JSON.parse(data);
                return products.map(p => new Product(p));
            } catch (error) {
                if (error.code === 'ENOENT') {
                    // File doesn't exist yet, return empty array
                    return [];
                }
                throw error;
            }
        } catch (error) {
            logger.error('Failed to get products:', error);
            throw error;
        }
    }

    /**
     * Get product by ID
     * @param {string} id - Product ID
     * @returns {Promise<Product|null>} Product or null if not found
     */
    async getById(id) {
        const products = await this.getAll();
        const product = products.find(p => p.id === id);
        return product || null;
    }

    /**
     * Save a product
     * @param {Product} product - Product to save
     * @returns {Promise<Product>} Saved product
     */
    async save(product) {
        try {
            const products = await this.getAll();
            const index = products.findIndex(p => p.id === product.id);

            if (index !== -1) {
                // Update existing product
                products[index] = product;
            } else {
                // Add new product
                products.push(product);
            }

            await this.ensureDataDirectory();
            await fs.writeFile(this.filePath, JSON.stringify(products, null, 2));
            return product;
        } catch (error) {
            logger.error('Failed to save product:', error);
            throw error;
        }
    }

    /**
     * Delete a product
     * @param {string} id - Product ID to delete
     * @returns {Promise<boolean>} True if deleted, false if not found
     */
    async delete(id) {
        try {
            const products = await this.getAll();
            const initialLength = products.length;
            const filtered = products.filter(p => p.id !== id);

            if (filtered.length === initialLength) {
                return false;
            }

            await this.ensureDataDirectory();
            await fs.writeFile(this.filePath, JSON.stringify(filtered, null, 2));
            return true;
        } catch (error) {
            logger.error('Failed to delete product:', error);
            throw error;
        }
    }
}

module.exports = new ProductRepository();
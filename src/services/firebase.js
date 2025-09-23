
// src/services/firebase.js

const firebase = require("firebase-admin");

// Initialize Firebase Admin SDK (replace with your credentials)
const serviceAccount = require("../../firebase-credentials.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://galnanized-hall-472603-g2.firebaseio.com", // Replace with your database URL
});

const db = firebase.database();

/**
 * Fetches all products from the database.
 *
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of products.
 */
async function getProducts() {
  const snapshot = await db.ref("/products").once("value");
  const products = snapshot.val() || {};
  return Object.keys(products).map((id) => ({ id, ...products[id] }));
}

/**
 * Updates the price of a product in the database.
 *
 * @param {string} productId - The ID of the product.
 * @param {object} priceData - The new price data (price, currency, availability).
 * @returns {Promise<void>} - A promise that resolves when the price is updated.
 */
async function updatePrice(productId, priceData) {
  const timestamp = Date.now();
  const updates = {};
  updates[`/prices/${productId}/${timestamp}`] = priceData;
  updates[`/products/${productId}/lastSeenAt`] = timestamp;
  await db.ref().update(updates);
}

module.exports = { db, getProducts, updatePrice };

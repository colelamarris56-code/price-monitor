
// src/services/firebase.js

const firebase = require("firebase-admin");

// Initialize Firebase Admin SDK (replace with your credentials)
const serviceAccount = require("../../firebase-credentials.json");

/**
 * Initializes the Firebase Admin SDK.
 *
 * The service account credentials are used to authenticate with your Firebase project.
 * These credentials contain the following information:
 *
 * - `type`: The type of account, which is "service_account".
 * - `project_id`: The ID of your Firebase project.
 * - `private_key_id`: A unique ID for the private key.
 * - `private_key`: The private key used to sign authentication tokens.
 * - `client_email`: The email address associated with the service account.
 * - `client_id`: A unique ID for the service account.
 * - `auth_uri`: The URI for OAuth2 authentication.
 * - `token_uri`: The URI for fetching OAuth2 tokens.
 * - `auth_provider_x509_cert_url`: The URL of the public x509 certificate.
 * - `client_x509_cert_url`: The URL of the public x509 certificate for the client.
 */
firebase.initializeApp({
  // Authenticates with the Firebase project using the provided service account credentials.
  credential: firebase.credential.cert(serviceAccount),
  // Sets the URL of the Firebase Realtime Database.
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

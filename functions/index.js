const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Example cloud function to handle price monitoring
exports.scheduledPriceCheck = functions.pubsub.schedule('every 1 hours').onRun((context) => {
    console.log('Running scheduled price check');
    // Code to check prices would go here
    return null;
});

// Example API endpoint for price data
exports.getPriceData = functions.https.onRequest((req, res) => {
    res.json({
        status: "success",
        message: "Price monitor API is working"
    });
});
// Enhanced price monitoring function with more features
exports.handler = async function (event, context) {
    // Get query parameters
    const params = event.queryStringParameters || {};
    const productId = params.productId;

    // Sample price data - in a real app, you'd fetch this from a database
    const priceData = {
        trending: [
            { id: "item1", name: "Smartphone X", currentPrice: 899, previousPrice: 999, change: -10 },
            { id: "item2", name: "Laptop Pro", currentPrice: 1299, previousPrice: 1199, change: 8.3 },
            { id: "item3", name: "Wireless Headphones", currentPrice: 159, previousPrice: 199, change: -20.1 }
        ],
        recentAlerts: [
            { id: "alert1", productName: "Coffee Maker", priceDrop: 15, date: new Date().toISOString() },
            { id: "alert2", productName: "Smart Watch", priceDrop: 50, date: new Date().toISOString() }
        ]
    };

    // If a specific product is requested, filter the data
    if (productId) {
        const product = priceData.trending.find(p => p.id === productId);
        if (product) {
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product })
            };
        } else {
            return {
                statusCode: 404,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "Product not found" })
            };
        }
    }

    // Return all price data if no specific product requested
    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            status: "success",
            message: "Price monitor API is working",
            data: priceData
        })
    };
};
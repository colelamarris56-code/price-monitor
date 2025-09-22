// Netlify function for getting price data
exports.handler = async function (event, context) {
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            status: "success",
            message: "Price monitor API is working"
        })
    };
};
// Netlify function for logging the price check activities
exports.handler = async function(event, context) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    event: "price_check",
    status: "success"
  };
  
  console.log(`PRICE CHECK LOG: ${JSON.stringify(logData)}`);
  
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      logged: true,
      timestamp
    })
  };
};

export const getPriceData = async () => {
  try {
    const response = await fetch('/api/price-data');
    if (!response.ok) {
      throw new Error('Failed to fetch price data');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getEnhancedPriceData = async () => {
  try {
    const response = await fetch('/api/enhanced-price-data');
    if (!response.ok) {
      throw new Error('Failed to fetch enhanced price data');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const logPriceCheck = async (price) => {
  try {
    const response = await fetch('/api/log-price-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ price }),
    });
    if (!response.ok) {
      throw new Error('Failed to log price check');
    }
  } catch (error) {
    console.error(error);
  }
};

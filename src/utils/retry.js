
/**
 * Retries an async function with exponential backoff.
 *
 * @param {Function} asyncFn The async function to retry.
 * @param {number} maxRetries The maximum number of retries.
 * @param {number} delay The initial delay in milliseconds.
 * @param {Function} onError An optional function to call on each error.
 * @returns {Promise<any>} A promise that resolves with the result of the async function.
 */
const retry = async (asyncFn, maxRetries = 3, delay = 1000, onError) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await asyncFn();
    } catch (error) {
      lastError = error;
      if (onError) {
        onError(error);
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * 2 ** i));
    }
  }
  throw lastError;
};

module.exports = { retry };

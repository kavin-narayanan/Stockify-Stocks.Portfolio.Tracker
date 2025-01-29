import axios from 'axios';

// Cache duration increased to 15 minutes due to API rate limits
const CACHE_DURATION = 15 * 60 * 1000;

// Queue for managing API requests
let requestQueue = [];
let isProcessingQueue = false;

// Delay between API calls (5.1 seconds to stay within free tier limits)
const API_DELAY = 5100;

const getCachedStockPrice = (symbol) => {
  try {
    const cached = localStorage.getItem(`stock_${symbol}`);
    if (cached) {
      const parsedCache = JSON.parse(cached);
      const cacheAge = Date.now() - parsedCache.timestamp;
      if (cacheAge < CACHE_DURATION) {
        return parsedCache.price;
      }
    }
  } catch (error) {
    console.warn(`Error reading cache for ${symbol}:`, error.message);
  }
  return null;
};

const setCachedStockPrice = (symbol, price) => {
  try {
    const cacheData = {
      price,
      timestamp: Date.now(),
    };
    localStorage.setItem(`stock_${symbol}`, JSON.stringify(cacheData));
  } catch (error) {
    console.warn(`Error writing cache for ${symbol}:`, error.message);
  }
};

const processQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (requestQueue.length > 0) {
    const { symbol, resolve, reject } = requestQueue.shift();
    
    try {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=779Y5LB2Z0025P46`;
      const response = await axios.get(url);
      
      if (response.data['Global Quote']) {
        const price = parseFloat(response.data['Global Quote']['05. price']);
        if (!isNaN(price) && price > 0) {
          setCachedStockPrice(symbol, price);
          resolve(price);
        } else {
          reject(new Error('Invalid price data'));
        }
      } else {
        reject(new Error('No data available'));
      }
    } catch (error) {
      reject(error);
    }
    
    // Wait before processing next request
    await new Promise(resolve => setTimeout(resolve, API_DELAY));
  }
  
  isProcessingQueue = false;
};

export const getStockPrice = async (symbol) => {
  // First check cache
  const cachedPrice = getCachedStockPrice(symbol);
  if (cachedPrice !== null) {
    return cachedPrice;
  }

  // If not in cache, add to queue
  return new Promise((resolve, reject) => {
    requestQueue.push({ symbol, resolve, reject });
    processQueue();
  });
};
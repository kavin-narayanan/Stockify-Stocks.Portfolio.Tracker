import axios from 'axios';

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
const API_KEY = '779Y5LB2Z0025P46';
const API_BASE_URL = 'https://www.alphavantage.co/query';

const createCacheKey = (symbol) => `stock_${symbol.toUpperCase()}`;

const getCachedStockPrice = (symbol) => {
  try {
    const cacheKey = createCacheKey(symbol);
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      const { price, timestamp } = JSON.parse(cached);
      const cacheAge = Date.now() - timestamp;
      
      return cacheAge < CACHE_DURATION ? price : null;
    }
  } catch (error) {
    console.warn(`Cache read error for ${symbol}:`, error);
  }
  return null;
};

const setCachedStockPrice = (symbol, price) => {
  try {
    const cacheKey = createCacheKey(symbol);
    const cacheData = {
      price,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.warn(`Cache write error for ${symbol}:`, error);
  }
};

const fetchStockPrice = async (symbol) => {
  const params = {
    function: 'GLOBAL_QUOTE',
    symbol: symbol.toUpperCase(),
    apikey: API_KEY
  };

  try {
    const response = await axios.get(API_BASE_URL, { params });
    const quote = response.data['Global Quote'];
    
    if (quote && quote['05. price']) {
      const price = parseFloat(quote['05. price']);
      setCachedStockPrice(symbol, price);
      return price;
    }
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
  }
  return null;
};

export const getStockPrice = async (symbol) => {
  const cachedPrice = getCachedStockPrice(symbol);
  if (cachedPrice !== null) return cachedPrice;

  return fetchStockPrice(symbol);
};

export const bulkGetStockPrices = async (symbols) => {
  const pricePromises = symbols.map(symbol => getStockPrice(symbol));
  return Promise.all(pricePromises);
};
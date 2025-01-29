package com.capx.portfolio_tracker_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class StockPriceService {
    @Value("${alphavantage.api.key}")
    private String apiKey;

    private static final String ALPHA_VANTAGE_API_URL = "https://www.alphavantage.co/query";
    private static final long CACHE_EXPIRY_SECONDS = 86400; // Cache stock prices for 24 hours
    private final Map<String, CachedPrice> priceCache = new ConcurrentHashMap<>();
    private static final double USD_TO_INR = 85.76; // Conversion rate

    // Fetch the stock price (either from cache or API)
    public Double getStockPrice(String ticker) {
        long currentTime = Instant.now().getEpochSecond();

        // Check if cached price is valid (within 24 hours)
        CachedPrice cachedPrice = priceCache.get(ticker);
        if (cachedPrice != null && currentTime - cachedPrice.timestamp <= CACHE_EXPIRY_SECONDS) {
            return cachedPrice.price * USD_TO_INR; // Convert to INR before returning
        }

        // Fetch the stock price if not cached or cache expired
        Double price = fetchStockPrice(ticker);
        if (price != null) {
            priceCache.put(ticker, new CachedPrice(price, currentTime));
            return price * USD_TO_INR; // Convert to INR before returning
        }

        return cachedPrice != null ? cachedPrice.price * USD_TO_INR : null; // Return cached price if available
    }

    // Fetch stock price from Alpha Vantage API
    private Double fetchStockPrice(String ticker) {
        String url = UriComponentsBuilder.fromUriString(ALPHA_VANTAGE_API_URL)
                .queryParam("function", "TIME_SERIES_INTRADAY")
                .queryParam("symbol", ticker)
                .queryParam("interval", "5min")
                .queryParam("apikey", apiKey)
                .toUriString();

        RestTemplate restTemplate = new RestTemplate();
        try {
            String response = restTemplate.getForObject(url, String.class);
            if (response != null) {
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode rootNode = objectMapper.readTree(response);
                JsonNode timeSeries = rootNode.path("Time Series (5min)");
                if (timeSeries.isObject() && timeSeries.fieldNames().hasNext()) {
                    String latestKey = timeSeries.fieldNames().next();
                    JsonNode latestData = timeSeries.get(latestKey);
                    return latestData.path("4. close").asDouble(0.0); // Default to 0.0
                } else {
                    System.err.println("Invalid or missing time series data for " + ticker);
                }
            } else {
                System.err.println("Null response received from Alpha Vantage for " + ticker);
            }
            
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    // CachedPrice inner class to store stock price and timestamp
    private static class CachedPrice {
        Double price;
        long timestamp;

        public CachedPrice(Double price, long timestamp) {
            this.price = price;
            this.timestamp = timestamp;
        }
    }
}
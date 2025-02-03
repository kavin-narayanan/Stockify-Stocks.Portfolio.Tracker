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
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@Service
public class StockPriceService {
    @Value("${alphavantage.api.key}")
    private String apiKey;

    private static final String ALPHA_VANTAGE_API_URL = "https://www.alphavantage.co/query";
    private static final long CACHE_EXPIRY_SECONDS = 86400; // 24 hours
    private final Map<String, CachedPrice> priceCache = new ConcurrentHashMap<>();
    private static final double USD_TO_INR = 85.76;
    private final ExecutorService executorService = Executors.newFixedThreadPool(5);

    public Double getStockPrice(String ticker) {
        long currentTime = Instant.now().getEpochSecond();
        CachedPrice cachedPrice = priceCache.get(ticker);

        // Return cached price if valid
        if (cachedPrice != null && currentTime - cachedPrice.timestamp <= CACHE_EXPIRY_SECONDS) {
            return cachedPrice.price * USD_TO_INR;
        }

        // Fetch and cache new price
        Double price = fetchStockPriceWithRetry(ticker);
        if (price != null) {
            priceCache.put(ticker, new CachedPrice(price, currentTime));
            return price * USD_TO_INR;
        }

        return cachedPrice != null ? cachedPrice.price * USD_TO_INR : null;
    }

    private Double fetchStockPriceWithRetry(String ticker) {
        for (int attempt = 0; attempt < 3; attempt++) {
            try {
                String url = UriComponentsBuilder.fromUriString(ALPHA_VANTAGE_API_URL)
                        .queryParam("function", "GLOBAL_QUOTE")
                        .queryParam("symbol", ticker)
                        .queryParam("apikey", apiKey)
                        .toUriString();

                RestTemplate restTemplate = new RestTemplate();
                String response = restTemplate.getForObject(url, String.class);

                if (response != null) {
                    ObjectMapper objectMapper = new ObjectMapper();
                    JsonNode rootNode = objectMapper.readTree(response);
                    JsonNode quoteNode = rootNode.path("Global Quote");

                    if (!quoteNode.isMissingNode()) {
                        return quoteNode.path("05. price").asDouble(0.0);
                    }
                }
            } catch (Exception e) {
                System.err.println("Price fetch attempt " + (attempt + 1) + " failed for " + ticker);
                try {
                    Thread.sleep(1000); // Wait before retry
                } catch (InterruptedException ex) {
                    Thread.currentThread().interrupt();
                }
            }
        }
        return null;
    }

    private static class CachedPrice {
        Double price;
        long timestamp;

        public CachedPrice(Double price, long timestamp) {
            this.price = price;
            this.timestamp = timestamp;
        }
    }

    // Optional method for manual price updates
    public void updateAllStockPrices(Map<String, String> stockTickers) {
        stockTickers.forEach((name, ticker) -> 
            executorService.submit(() -> {
                Double price = getStockPrice(ticker);
                if (price != null) {
                    System.out.println(name + ": $" + price);
                }
            })
        );
    }

    // Shutdown method to be called when application closes
    public void shutdown() {
        executorService.shutdown();
        try {
            if (!executorService.awaitTermination(800, TimeUnit.MILLISECONDS)) {
                executorService.shutdownNow();
            }
        } catch (InterruptedException e) {
            executorService.shutdownNow();
        }
    }
}
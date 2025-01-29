package com.capx.portfolio_tracker_backend.service;

import com.capx.portfolio_tracker_backend.models.Stock;
import com.capx.portfolio_tracker_backend.repository.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class StockService {
    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private StockPriceService stockPriceService;

    // Calculate the total portfolio value
    public double calculatePortfolioValue() {
        List<Stock> stocks = stockRepository.findAll();
        double totalValue = 0.0;
        for (Stock stock : stocks) {
            try {
                // Get the latest stock price from the service
                Double currentPrice = stockPriceService.getStockPrice(stock.getTicker());
                if (currentPrice != null) {
                    totalValue += currentPrice * stock.getQuantity();
                } else {
                    // Use the old price if current price is unavailable
                    totalValue += stock.getCurrentPrice() * stock.getQuantity();
                }
            } catch (Exception e) {
                System.err.println("Error fetching stock price for " + stock.getTicker() + ": " + e.getMessage());
            }
        }
        return totalValue;
    }

    // Save a new stock and fetch the stock price
    public Stock saveStock(Stock stock) {
        // Fetch the current stock price when saving a new stock
        Double currentPrice = stockPriceService.getStockPrice(stock.getTicker());
        if (currentPrice != null) {
            stock.setCurrentPrice(currentPrice);
        } else {
            stock.setCurrentPrice(stock.getBuyPrice()); // Use buy price as fallback
        }
        return stockRepository.save(stock);
    }

    // Update an existing stock and fetch the stock price again
    public Stock updateStock(Long id, Stock updatedStock) throws Exception {
        Optional<Stock> existingStock = stockRepository.findById(id);
        if (existingStock.isPresent()) {
            Stock stock = existingStock.get();
            updatedStock.setId(id);
            // Fetch the updated stock price
            Double currentPrice = stockPriceService.getStockPrice(updatedStock.getTicker());
            if (currentPrice != null) {
                updatedStock.setCurrentPrice(currentPrice);
            } else {
                updatedStock.setCurrentPrice(stock.getCurrentPrice()); // Keep the old price if unavailable
            }
            return stockRepository.save(updatedStock);
        } else {
            throw new Exception("Stock with ID " + id + " not found.");
        }
    }

    // Delete a stock
    public boolean deleteStock(Long id) {
        if (stockRepository.existsById(id)) {
            stockRepository.deleteById(id);
            return true;
        }
        return false;
    }
    // Get all stocks
    public List<Stock> getAllStocks() {
        return stockRepository.findAll();
    }
    // Fetch stock by ID
    public Optional<Stock> getStockById(Long id) {
        return stockRepository.findById(id);
    }
    // Get the top-performing stock based on percentage change
    public Stock getTopPerformingStock() {
        List<Stock> stocks = stockRepository.findAll();
        Stock topStock = null;
        double maxChange = Double.NEGATIVE_INFINITY;
        for (Stock stock : stocks) {
            try {
                // Get the current price for performance calculation
                Double currentPrice = stockPriceService.getStockPrice(stock.getTicker());
                if (currentPrice != null) {
                    double changePercentage = ((currentPrice - stock.getBuyPrice()) / stock.getBuyPrice()) * 100;
                    if (changePercentage > maxChange) {
                        maxChange = changePercentage;
                        topStock = stock;
                    }
                }
            } catch (Exception e) {
                System.err.println("Error calculating performance for " + stock.getTicker() + ": " + e.getMessage());
            }
        }
        if (topStock != null) {
            topStock.setPercentageChange(maxChange);
        }
        return topStock;
    }
    // Get portfolio distribution as percentages
    public Map<String, Double> getPortfolioDistribution() {
        List<Stock> stocks = stockRepository.findAll();
        double totalValue = calculatePortfolioValue();
        Map<String, Double> distribution = new HashMap<>();
        if (totalValue <= 0.0) {
            System.err.println("Total portfolio value is zero or invalid.");
            return distribution;
        }
        for (Stock stock : stocks) {
            try {
                // Get the current price to calculate stock distribution
                Double currentPrice = stockPriceService.getStockPrice(stock.getTicker());
                if (currentPrice != null) {
                    double stockValue = currentPrice * stock.getQuantity();
                    distribution.put(stock.getName(), (stockValue / totalValue) * 100);
                }
            } catch (Exception e) {
                System.err.println("Error calculating distribution for " + stock.getTicker() + ": " + e.getMessage());
            }
        }
        return distribution;
    }
     // Scheduled task to update all stock prices once every 24 hours (86400 seconds)
    @Scheduled(fixedRate = 86400000) // 24 hours in milliseconds
    public void updateStockPricesDaily() {
        List<Stock> stocks = stockRepository.findAll();
        for (Stock stock : stocks) {
            // Fetch the current stock price
            Double currentPrice = stockPriceService.getStockPrice(stock.getTicker());
            if (currentPrice != null) {
                stock.setCurrentPrice(currentPrice);
            } else {
                // If API fails to fetch price, retain the previous price
                System.err.println("Failed to fetch price for " + stock.getTicker());
            }
        }
        // Save all the updated stocks to the database
        stockRepository.saveAll(stocks);
        System.out.println("Stock prices updated successfully.");
    }
}

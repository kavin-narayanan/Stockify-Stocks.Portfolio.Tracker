package com.capx.portfolio_tracker_backend.controller;
import com.capx.portfolio_tracker_backend.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/portfolio")
public class PortfolioController {
    @Autowired
    private StockService stockService;
    // Get the total portfolio value
    @GetMapping("/value")
    public double getPortfolioValue() {
        return stockService.calculatePortfolioValue();
    }
    // Get portfolio metrics (value and stock count)
    @GetMapping("/metrics")
    public String getPortfolioMetrics() {
        double totalValue = stockService.calculatePortfolioValue();
        int totalStocks = stockService.getAllStocks().size();
        return String.format("Total Portfolio Value: %.2f | Total Stocks: %d", totalValue, totalStocks);
    }
}

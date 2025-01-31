package com.capx.portfolio_tracker_backend.controller;
import com.capx.portfolio_tracker_backend.models.Stock;
import com.capx.portfolio_tracker_backend.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;
@RestController
@RequestMapping("/stocks")
@CrossOrigin(origins = "https://stockify-kavin-narayanan.vercel.app")
public class StockController {
    @Autowired
    private StockService stockService;
    // Add a new stock to the portfolio
    @PostMapping("/add")
    public ResponseEntity<Stock> addStock(@RequestBody Stock stock) {
        Stock savedStock = stockService.saveStock(stock);
        return new ResponseEntity<>(savedStock, HttpStatus.CREATED);
    }
    // Get all stocks in the portfolio
    @GetMapping("/all")
    public ResponseEntity<List<Stock>> getAllStocks() {
        List<Stock> stocks = stockService.getAllStocks();
        return new ResponseEntity<>(stocks, HttpStatus.OK);
    }
    // Get stock by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getStockById(@PathVariable Long id) {
        Optional<Stock> stock = stockService.getStockById(id);
        if (stock.isPresent()) {
            return new ResponseEntity<>(stock.get(), HttpStatus.OK);
        }
        return new ResponseEntity<>("Stock not found with ID: " + id, HttpStatus.NOT_FOUND);
    }
    // Delete a stock by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStock(@PathVariable Long id) {
        boolean isDeleted = stockService.deleteStock(id);
        if (isDeleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>("Stock not found with ID: " + id, HttpStatus.NOT_FOUND);
        }
    }
    // Get the top-performing stock
    @GetMapping("/top-performing")
    public ResponseEntity<?> getTopPerformingStock() {
        Stock topStock = stockService.getTopPerformingStock();
        if (topStock != null) {
            return new ResponseEntity<>(topStock, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("No top-performing stock found", HttpStatus.NO_CONTENT);
        }
    }
    // Get portfolio distribution
    @GetMapping("/distribution")
    public ResponseEntity<Map<String, Double>> getPortfolioDistribution() {
        Map<String, Double> distribution = stockService.getPortfolioDistribution();
        return new ResponseEntity<>(distribution, HttpStatus.OK);
    }
    // Update an existing stock
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestBody Stock updatedStock) {
        try {
            Stock stock = stockService.updateStock(id, updatedStock);
            // Ensure portfolio value and other data are refreshed after update
            stockService.calculatePortfolioValue();
            stockService.getTopPerformingStock();
            stockService.getPortfolioDistribution();
            return new ResponseEntity<>(stock, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
}

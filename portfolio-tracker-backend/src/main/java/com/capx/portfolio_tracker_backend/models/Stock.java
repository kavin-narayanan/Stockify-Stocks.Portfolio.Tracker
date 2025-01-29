package com.capx.portfolio_tracker_backend.models;
import jakarta.persistence.*;
import java.util.Objects;
@Entity
@Table(name = "stocks") // Explicitly define table name
public class Stock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment primary key
    private Long id;
    @Column(name = "stock_name", nullable = false) // Add column name and constraints
    private String name;
    @Column(name = "ticker", nullable = false, unique = true) // Add uniqueness constraint
    private String ticker;
    @Column(name = "quantity", nullable = false)
    private int quantity;
    @Column(name = "buy_price", nullable = false)
    private double buyPrice;
    @Column(name = "current_price")  // Column to store the current stock price
    private Double currentPrice;  // This is the field for the current stock price
    @Column(name = "percentage_change")
    private double percentageChange;
    // Default constructor (required by JPA)
    public Stock() {
    }
    // Parameterized constructor
    public Stock(String name, String ticker, int quantity, double buyPrice, Double currentPrice) {
        this.name = name;
        this.ticker = ticker;
        this.quantity = quantity;
        this.buyPrice = buyPrice;
        this.currentPrice = currentPrice;
    }
    // Getters and Setters
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getTicker() {
        return ticker;
    }
    public void setTicker(String ticker) {
        this.ticker = ticker;
    }
    public int getQuantity() {
        return quantity;
    }
    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
    public double getBuyPrice() {
        return buyPrice;
    }
    public void setBuyPrice(double buyPrice) {
        this.buyPrice = buyPrice;
    }
    public Double getCurrentPrice() {
        return currentPrice;
    }
    public void setCurrentPrice(Double currentPrice) {
        this.currentPrice = currentPrice;
    }
    public double getPercentageChange() {
        return percentageChange;
    }
    public void setPercentageChange(double percentageChange) {
        this.percentageChange = percentageChange;
    }
    // Override toString for better logging/debugging
    @Override
    public String toString() {
        return "Stock{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", ticker='" + ticker + '\'' +
                ", quantity=" + quantity +
                ", buyPrice=" + buyPrice +
                ", currentPrice=" + currentPrice +
                '}';
    }
    // Override equals and hashCode for entity comparison
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Stock stock = (Stock) o;
        return Objects.equals(id, stock.id) &&
                Objects.equals(ticker, stock.ticker);
    }
    @Override
    public int hashCode() {
        return Objects.hash(id, ticker);
    }
}

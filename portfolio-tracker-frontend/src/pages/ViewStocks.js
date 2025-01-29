import React, { useEffect, useState, useCallback, useMemo } from "react";
import { getAllStocks, deleteStock } from "../api/stocks";
import { getStockPrice } from "../api/stockPriceAPI";
import {
  Button,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const USD_TO_INR = 85.76; // Conversion rate

const ViewStocks = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingPrices, setUpdatingPrices] = useState(false);
  const navigate = useNavigate();

  // Memoized portfolio value calculation
  const portfolioValue = useMemo(() => {
    return stocks.reduce(
      (sum, stock) => sum + stock.quantity * (stock.currentPrice || 0),
      0
    );
  }, [stocks]);

  // Fetch stock prices in parallel
  const updateStockPrices = async (stockData) => {
    setUpdatingPrices(true);
    try {
      const updatedStocks = await Promise.all(
        stockData.map(async (stock) => {
          try {
            const currentPrice = await getStockPrice(stock.ticker);
            return {
              ...stock,
              currentPrice: currentPrice ? currentPrice * USD_TO_INR : stock.currentPrice || 0,
            };
          } catch (err) {
            console.warn(`Failed to fetch price for ${stock.ticker}:`, err);
            return { ...stock, currentPrice: stock.currentPrice || 0 };
          }
        })
      );
      setStocks(updatedStocks);
    } catch (err) {
      console.error("Error updating stock prices:", err);
    } finally {
      setUpdatingPrices(false);
    }
  };

  // Fetch stocks and update prices
  const fetchStocks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllStocks();
      const stockData = response.data;
      setStocks(stockData.map(stock => ({ ...stock, currentPrice: 0 })));
      await updateStockPrices(stockData);
    } catch (err) {
      setError("Error fetching stock data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a stock
  const handleDelete = async (id) => {
    try {
      await deleteStock(id);
      fetchStocks();
    } catch {
      setError("Error deleting stock.");
    }
  };

  // Edit a stock
  const handleEdit = (stock) => {
    navigate("/add-stock", { state: { stock, editMode: true } });
  };

  // Debounce refresh button
  const handleRefresh = () => {
    if (!loading && !updatingPrices) {
      fetchStocks();
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  return (
    <div
      style={{
        color: "#D9E7FF",
        background: "linear-gradient(135deg, #0d0d0d, #1a1a1a 70%)",
        minHeight: "100vh",
        padding: "3rem 1rem",
        overflow: "hidden",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        style={{
          color: "#FFFFFF",
          textAlign: "center",
          marginBottom: "2rem",
          textShadow: "0 0 10px #00AFFF",
          fontFamily: "'Orbitron', sans-serif",
          fontWeight: 600,
        }}
      >
        Your Stocks
      </Typography>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress style={{ color: "#00AFFF" }} />
        </div>
      ) : error ? (
        <Typography
          variant="body1"
          align="center"
          color="error"
          style={{
            fontFamily: "'Work Sans', sans-serif",
            fontSize: "1rem",
          }}
        >
          {error}
        </Typography>
      ) : stocks.length === 0 ? (
        <Typography
          variant="body1"
          align="center"
          style={{
            color: "#8AA6D1",
            fontFamily: "'Work Sans', sans-serif",
            fontSize: "1rem",
          }}
        >
          No stocks to display
        </Typography>
      ) : (
        <div>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <Button
              variant="contained"
              onClick={handleRefresh}
              disabled={loading || updatingPrices}
              style={{
                backgroundColor: "#00AFFF",
                color: "#FFFFFF",
                marginBottom: "20px",
              }}
            >
              {updatingPrices ? "Updating Prices..." : "Refresh Prices"}
            </Button>
          </div>

          <Typography
            variant="h5"
            align="center"
            gutterBottom
            style={{
              marginBottom: "20px",
              color: "#FFFFFF",
              textShadow: "0 0 10px #00AFFF",
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 500,
            }}
          >
            Total Portfolio Value: <strong>₹{portfolioValue.toFixed(2)}</strong>
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            {stocks.map((stock) => {
              const valueChange = stock.currentPrice - stock.buyPrice * USD_TO_INR;
              const percentageChange = (
                (valueChange / (stock.buyPrice * USD_TO_INR)) *
                100
              ).toFixed(2);

              return (
                <Grid item xs={12} sm={6} md={4} key={stock.id}>
                  <Card
                    style={{
                      background: "linear-gradient(145deg, #1e272e, #353b40)",
                      color: "#D9E7FF",
                      borderRadius: "15px",
                      boxShadow: "0 0 15px rgba(0, 175, 255, 0.5)",
                      transition: "transform 0.3s ease-in-out",
                      transform: "translateY(0px)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "translateY(-5px)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "translateY(0px)")
                    }
                  >
                    <CardContent>
                      <Typography
                        variant="h6"
                        gutterBottom
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontWeight: 600,
                        }}
                      >
                        {stock.name} ({stock.ticker})
                      </Typography>
                      <Typography
                        variant="body1"
                        style={{
                          fontFamily: "'Work Sans', sans-serif",
                        }}
                      >
                        Quantity: {stock.quantity}
                      </Typography>
                      <Typography
                        variant="body1"
                        style={{
                          fontFamily: "'Work Sans', sans-serif",
                        }}
                      >
                        Buy Price: ₹{(stock.buyPrice * USD_TO_INR).toFixed(2)}
                      </Typography>
                      <Typography
                        variant="body1"
                        style={{
                          fontFamily: "'Work Sans', sans-serif",
                        }}
                      >
                        Current Price: ₹{stock.currentPrice.toFixed(2)}
                      </Typography>
                      <Typography
                        variant="body1"
                        style={{
                          fontFamily: "'Work Sans', sans-serif",
                        }}
                      >
                        Total Value: ₹{(stock.quantity * stock.currentPrice).toFixed(2)}
                      </Typography>
                      <Typography
                        variant="body1"
                        style={{
                          color: valueChange > 0 ? "#7CFC00" : "#FF4500",
                          fontWeight: "bold",
                          fontFamily: "'Work Sans', sans-serif",
                        }}
                      >
                        Change: {valueChange > 0 ? "+" : ""}
                        ₹{valueChange.toFixed(2)} ({percentageChange > 0 ? "+" : ""}
                        {percentageChange}%)
                      </Typography>
                      <div style={{ marginTop: "10px" }}>
                        <Button
                          variant="contained"
                          style={{
                            backgroundColor: "#FF6347",
                            color: "#FFFFFF",
                            marginRight: "10px",
                          }}
                          onClick={() => handleDelete(stock.id)}
                        >
                          Delete
                        </Button>
                        <Button
                          variant="contained"
                          style={{
                            backgroundColor: "#1E90FF",
                            color: "#FFFFFF",
                          }}
                          onClick={() => handleEdit(stock)}
                        >
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </div>
      )}
    </div>
  );
};

export default React.memo(ViewStocks);
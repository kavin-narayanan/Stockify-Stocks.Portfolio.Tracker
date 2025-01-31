import React, { useEffect, useState, useMemo } from "react";
import { Pie } from "react-chartjs-2";
import { CircularProgress, Card, CardContent, Typography, Grid, useTheme, useMediaQuery } from "@mui/material";
import "chart.js/auto";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getStockPrice } from "../api/stockPriceAPI";
import profilePic from "../Assets/Image/Profile_Pic.png"; // Adjust the path as per your folder structure


const USD_TO_INR = 85.76;

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stocks, setStocks] = useState([]);
  const [error, setError] = useState(null);

  const updateStockPrices = async (stocks) => {
    try {
      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => {
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
      return updatedStocks;
    } catch (err) {
      console.error("Error updating stock prices:", err);
      throw err;
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const stocksResponse = await axios.get("https://stockify-stocks-portfolio-tracker.onrender.com/stocks/all");
        const updatedStocks = await updateStockPrices(stocksResponse.data);
        setStocks(updatedStocks);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const portfolioValue = useMemo(() => {
    return stocks.reduce((sum, stock) => sum + stock.quantity * (stock.currentPrice || 0), 0);
  }, [stocks]);

  const topStock = useMemo(() => {
    let topPerformingStock = null;
    let maxPercentageChange = -Infinity;

    stocks.forEach((stock) => {
      const valueChange = stock.currentPrice - stock.buyPrice * USD_TO_INR;
      const percentageChange = (valueChange / (stock.buyPrice * USD_TO_INR)) * 100;
      if (percentageChange > maxPercentageChange) {
        maxPercentageChange = percentageChange;
        topPerformingStock = { ...stock, percentageChange: percentageChange.toFixed(2) };
      }
    });

    return topPerformingStock || {};
  }, [stocks]);

  const portfolioDistribution = useMemo(() => {
    const distribution = {};
    stocks.forEach((stock) => {
      const stockValue = stock.quantity * stock.currentPrice;
      distribution[stock.name] = stockValue;
    });
    return distribution;
  }, [stocks]);

  const pieData = {
    labels: Object.keys(portfolioDistribution),
    datasets: [{
      label: "Portfolio Distribution",
      data: Object.values(portfolioDistribution),
      backgroundColor: [
        "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
        "#FF9F40", "#FFCD56", "#4B0082", "#7FFF00", "#FF1493"
      ],
      hoverOffset: 4,
    }],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `${tooltipItem.label}: ₹${tooltipItem.raw.toFixed(2)}`,
        },
      },
      legend: {
        position: isMobile ? 'bottom' : 'right',
        labels: {
          color: "#D9E7FF",
          font: {
            size: isMobile ? 12 : 14,
            family: "Arial, sans-serif",
            weight: "bold",
          },
          boxWidth: isMobile ? 10 : 15,
        },
      },
    },
  };

  const styles = {
    container: {
      color: "#D9E7FF",
      background: "linear-gradient(135deg, #0d0d0d, #1a1a1a 70%)",
      minHeight: "100vh",
      padding: isMobile ? "1.5rem 0.75rem" : "3rem 1rem",
      overflow: "hidden",
    },
    heroSection: {
      background: "linear-gradient(135deg, #0a0a0a, #1a1a1a 70%)",
      padding: isMobile ? "3rem 1rem" : "6rem 1rem",
      textAlign: "center",
      color: "#fff",
      borderRadius: "10px",
      boxShadow: "0 0 20px rgba(0, 175, 255, 0.5)",
      margin: isMobile ? "0 0.5rem" : "0 1rem",
    },
    heroTitle: {
      fontFamily: "Cormorant Garamond",
      fontSize: isMobile ? "2.5rem" : isTablet ? "3rem" : "4rem",
      fontWeight: "bold",
      textTransform: "uppercase",
      color: "#FFFFFF",
      textShadow: "0 0 5px #00AFFF, 0 0 5px #00AFFF",
      marginBottom: "1rem",
    },
    heroText: {
      fontFamily: "Work Sans",
      fontSize: isMobile ? "1rem" : "1.3rem",
      margin: "1rem 0",
      color: "#A1C2D8",
      maxWidth: "800px",
      marginLeft: "auto",
      marginRight: "auto",
    },
    button: {
      backgroundColor: "#00AFFF",
      color: "#fff",
      fontFamily: "Satoshi",
      fontWeight: "bold",
      fontSize: isMobile ? "1rem" : "1.1rem",
      padding: isMobile ? "0.75rem 2rem" : "1rem 2.5rem",
      borderRadius: "30px",
      cursor: "pointer",
      border: "none",
      boxShadow: "0 0 15px rgba(0, 175, 255, 0.5)",
      transition: "all 0.3s ease",
      marginTop: "1rem",
    },
    card: {
      background: "linear-gradient(145deg, #1e272e, #353b40)",
      color: "#D9E7FF",
      borderRadius: "15px",
      boxShadow: "0 0 15px rgba(0, 175, 255, 0.5)",
      transition: "transform 0.3s ease-in-out",
      minHeight: isMobile ? "150px" : "200px",
    },
    chartCard: {
      background: "linear-gradient(145deg, #1e272e, #353b40)",
      color: "#D9E7FF",
      borderRadius: "15px",
      boxShadow: "0 0 15px rgba(0, 175, 255, 0.5)",
      minHeight: isMobile ? "300px" : "350px",
    },
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#0a0a0a",
      }}>
        <CircularProgress style={{ color: "#00AFFF" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#0a0a0a",
        color: "#FF4500",
        fontFamily: "'Work Sans', sans-serif",
        padding: "1rem",
        textAlign: "center",
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.heroSection}>
        <h1 style={styles.heroTitle}>
          Unleash the full potential of your investments with stockify
        </h1>
        <p style={styles.heroText}>
          A sophisticated yet intuitive portfolio tracker designed to help you make informed decisions. 
          Effortlessly monitor and manage your investments, visualize your portfolio's performance, 
          and take control of your financial future—anytime, anywhere.
        </p>
        <button
          style={styles.button}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#028CA5')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#00AFFF')}
          onClick={() => navigate("/add-stock")}
        >
          Start Your Journey
        </button>
      </div>

      <Typography
        variant="h4"
        gutterBottom
        style={{
          color: "#FFFFFF",
          textAlign: "center",
          margin: isMobile ? "2rem 0" : "2.5rem 0",
          fontSize: isMobile ? "1.75rem" : "2.125rem",
          textShadow: "0 0 10px #00AFFF",
          fontFamily: "Cormorant Garamond, serif",
        }}
      >
        Dashboard
      </Typography>

      <Grid container spacing={isMobile ? 2 : 4} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <Card style={styles.card}>
            <CardContent>
              <Typography variant="h6" style={{ color: "#D9E7FF", marginBottom: "1rem" }}>
                Total Portfolio Value
              </Typography>
              <Typography variant="h4" style={{ color: "#00AFFF", fontSize: isMobile ? "1.75rem" : "2.125rem" }}>
                ₹{portfolioValue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card style={styles.card}>
            <CardContent>
              <Typography variant="h6" style={{ color: "#D9E7FF", marginBottom: "1rem" }}>
                Top Performing Stock
              </Typography>
              <Typography variant="h5" style={{ color: "#00AFFF", fontSize: isMobile ? "1.5rem" : "1.75rem" }}>
                {topStock.name || "N/A"}
              </Typography>
              <Typography variant="body2" style={{ color: "#A1C2D8" }}>
                {topStock.percentageChange ? `${topStock.percentageChange}%` : "No data"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={12} md={8}>
          <Card style={styles.chartCard}>
            <CardContent>
              <Typography variant="h6" style={{ color: "#D9E7FF", marginBottom: "1rem" }}>
                Portfolio Distribution
              </Typography>
              <div style={{ height: isMobile ? "250px" : "300px", position: "relative" }}>
                <Pie data={pieData} options={pieOptions} />
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Typography
  variant="h4"
  gutterBottom
  style={{
    color: "#FFFFFF",
    textAlign: "center",
    margin: isMobile ? "2rem 0" : "2.5rem 0",
    fontSize: isMobile ? "1.75rem" : "2.125rem",
    textShadow: "0 0 10px #00AFFF",
    fontFamily: "Cormorant Garamond, serif",
  }}
>
  About Me
</Typography>

<Grid
  container
  justifyContent="center"
  alignItems="center"
  style={{
    minHeight: "10vh", // Ensure full vertical space
    textAlign: "center", // Align content centrally
  }}
>
  <Grid item xs={12} sm={12} md={8}>
    <Card
      style={{
        background: "linear-gradient(145deg, #1e272e, #353b40)",
        color: "#D9E7FF",
        borderRadius: "15px",
        boxShadow: "0 0 15px rgba(0, 175, 255, 0.5)",
        padding: isMobile ? "1rem" : "2rem",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: "center",
        justifyContent: "center", // Center items horizontally inside the card
      }}
    >
      {/* Left Section: Profile Picture */}
      <div style={{ marginRight: isMobile ? 0 : "2rem", textAlign: "center" }}>
        <img
          src={profilePic}
          alt="Profile Pic"
          style={{
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            boxShadow: "0 0 10px rgba(0, 175, 255, 0.5)",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Right Section: Info */}
      <div>
        <Typography
          variant="h5"
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: isMobile ? "1.5rem" : "2rem",
            marginBottom: "0.5rem",
            textShadow: "0 0 5px #00AFFF",
          }}
        >
          Kavin Narayanan M
        </Typography>
        <Typography
          variant="body1"
          style={{
            fontFamily: "Work Sans, sans-serif",
            fontSize: isMobile ? "1rem" : "1.25rem",
            marginBottom: "1rem",
            color: "#A1C2D8",
          }}
        >
          Software Development Engineer | Game Developer
        </Typography>
        <Typography
          variant="body2"
          style={{
            fontFamily: "Work Sans, sans-serif",
            fontSize: "1rem",
            color: "#A1C2D8",
            marginBottom: "1rem",
          }}
        >
          kavinnarayananm@gmail.com
        </Typography>
        <div>
          <a
            href="https://www.linkedin.com/in/kavin-narayanan/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#00AFFF",
              textDecoration: "none",
              marginRight: "1rem",
              fontWeight: "bold",
            }}
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/kavin-narayanan/kavin-narayanan.git"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#00AFFF",
              textDecoration: "none",
              marginLeft: "1rem",
              fontWeight: "bold",
            }}
          >
            GitHub
          </a>
        </div>
      </div>
    </Card>
  </Grid>
</Grid>


    </div>
  );
};

export default Home;
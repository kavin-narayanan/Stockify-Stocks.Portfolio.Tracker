import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Container,
  Alert,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import { addStock, updateStock } from "../api/stocks";
import { useLocation, useNavigate } from "react-router-dom";

const AddStock = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [stock, setStock] = useState({
    id: null,
    name: "",
    ticker: "",
    quantity: "",
    buyPrice: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const isEditMode = location.state?.editMode || false;

  useEffect(() => {
    if (isEditMode && location.state?.stock) {
      setStock(location.state.stock);
    }
  }, [location, isEditMode]);

  const handleChange = (e) => {
    setStock({ ...stock, [e.target.name]: e.target.value });
  };

  const validateTicker = (ticker) => {
    const tickerRegex = /^[A-Z0-9.-]+$/;
    if (!ticker || !tickerRegex.test(ticker) || ticker.length < 1 || ticker.length > 5) {
      return "INVALID TICKER";
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitFunction = isEditMode ? updateStock : addStock;
    setErrorMessage("");
    setSuccessMessage("");

    const tickerError = validateTicker(stock.ticker.toUpperCase());
    if (tickerError) {
      setErrorMessage(tickerError);
      return;
    }

    if (!stock.name || !stock.ticker || !stock.quantity || !stock.buyPrice) {
      setErrorMessage("All fields are required.");
      return;
    }

    submitFunction(stock)
      .then(() => {
        setSuccessMessage(
          isEditMode ? "Stock updated successfully!" : "Stock added successfully!"
        );
        setTimeout(() => {
          navigate("/view-stocks");
        }, 1500);
      })
      .catch((error) => {
        setErrorMessage(`Failed to ${isEditMode ? "update" : "add"} stock!`);
        console.error(error);
      });
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0d0d0d, #1a1a1a 70%)",
        color: "#D9E7FF",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1rem",
        overflow: "hidden",
      }}
    >
      <Card
        style={{
          background: "linear-gradient(145deg, #1e272e, #353b40)",
          borderRadius: "15px",
          boxShadow: "0 0 15px rgba(0, 175, 255, 0.5)",
          width: "100%",
          maxWidth: "500px",
          padding: "2rem",
          animation: "fadeIn 1s ease-in-out",
          transform: "translateY(0)",
          transition: "transform 0.3s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        <CardContent>
        <Typography
  variant="h4"
  style={{
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: "1.5rem",
    textShadow: "0 0 4px #00AFFF, 0 0 6px rgba(0, 175, 255, 0.7)",
    fontFamily: "'Cormorant Garamond', serif", // Main Heading Font
    fontWeight: 600,
  }}
>
  {isEditMode ? "Edit Stock" : "Add Stock"}
</Typography>

{successMessage && (
  <Alert
    severity="success"
    style={{
      fontFamily: "'Work Sans', sans-serif", // Body Text Font
      fontSize: "1rem",
      marginBottom: "1rem",
    }}
  >
    {successMessage}
  </Alert>
)}

{errorMessage && (
  <Alert
    severity="error"
    style={{
      fontFamily: "'Work Sans', sans-serif", // Body Text Font
      fontSize: "1rem",
      marginBottom: "1rem",
    }}
  >
    {errorMessage}
  </Alert>
)}


          <form onSubmit={handleSubmit}>
            {["name", "ticker", "quantity", "buyPrice"].map((field, idx) => (
              <TextField
                key={idx}
                label={
                  field === "buyPrice"
                    ? "Buy Price in USD ($)"
                    : field.charAt(0).toUpperCase() + field.slice(1)
                }
                name={field}
                type={field === "quantity" || field === "buyPrice" ? "number" : "text"}
                value={stock[field]}
                onChange={handleChange}
                fullWidth
                margin="normal"
                InputLabelProps={{
                  style: { color: "#8AA6D1" },
                }}
                InputProps={{
                  style: {
                    color: "#D9E7FF",
                    background: "#2c3e50",
                    borderRadius: "5px",
                  },
                }}
              />
            ))}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              style={{
                background: "linear-gradient(145deg, #00AFFF, #004FFF)",
                color: "#FFFFFF",
                marginTop: "1rem",
                textTransform: "uppercase",
                boxShadow: "0 0 10px rgba(0, 175, 255, 0.8)",
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {isEditMode ? "Update Stock" : "Add Stock"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddStock;

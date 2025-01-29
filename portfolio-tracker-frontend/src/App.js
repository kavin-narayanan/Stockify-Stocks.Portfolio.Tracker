import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles"; // Import MUI theme utilities
import CssBaseline from "@mui/material/CssBaseline"; // Optional for consistent styling reset
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AddStock from "./pages/AddStock";
import ViewStocks from "./pages/ViewStocks";
import "./App.css";

// Create a custom theme (you can customize it further as needed)
const theme = createTheme();

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Ensures consistent styling */}
      <Router>
        <div>
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} /> {/* Home now includes Dashboard */}
              <Route path="/add-stock" element={<AddStock />} />
              <Route path="/view-stocks" element={<ViewStocks />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;

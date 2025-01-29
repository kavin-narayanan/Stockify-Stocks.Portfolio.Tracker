import React, { useState } from "react";
import { Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ListAltIcon from "@mui/icons-material/ListAlt";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navStyles = {
    background: "linear-gradient(135deg, #0d0d0d, #1a1a1a 70%)",
    boxShadow: "0 4px 15px rgba(0, 175, 255, 0.5)",
    borderBottom: "2px solid #00AFFF",
    padding: "0.8rem 1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1000,
    position: "sticky",
    top: 0,
  };

  const logoStyles = {
    color: "#FFFFFF",
    fontSize: "clamp(1.2rem, 4vw, 1.8rem)",
    fontWeight: "bold",
    textShadow: "0 0 4px #00AFFF, 0 0 6px rgba(0, 175, 255, 0.7)",
    cursor: "pointer",
    transition: "all 0.3s ease",
  };

  const linkStyles = {
    color: "#D9E7FF",
    textDecoration: "none",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.6rem 1.2rem",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    background: "rgba(0, 0, 0, 0.6)",
    border: "1px solid transparent",
    whiteSpace: "nowrap",
  };

  return (
    <nav style={navStyles}>
      <div style={logoStyles}>STOCKIFY</div>

      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        style={{
          display: "none",
          background: "none",
          border: "none",
          color: "#00AFFF",
          cursor: "pointer",
          padding: "0.5rem",
          "@media (max-width: 768px)": {
            display: "block",
          },
        }}
      >
        {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Navigation Links */}
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          transition: "all 0.3s ease",
          "@media (max-width: 768px)": {
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            flexDirection: "column",
            background: "linear-gradient(135deg, #0d0d0d, #1a1a1a 70%)",
            padding: "1rem",
            gap: "0.5rem",
            transform: isMenuOpen ? "translateY(0)" : "translateY(-100%)",
            opacity: isMenuOpen ? 1 : 0,
            visibility: isMenuOpen ? "visible" : "hidden",
          },
        }}
      >
        <Link to="/" style={linkStyles}>
          <HomeIcon style={{ color: "#00AFFF" }} /> Home
        </Link>
        <Link to="/add-stock" style={linkStyles}>
          <AddCircleOutlineIcon style={{ color: "#00AFFF" }} /> Add Stock
        </Link>
        <Link to="/view-stocks" style={linkStyles}>
          <ListAltIcon style={{ color: "#00AFFF" }} /> View Stocks
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
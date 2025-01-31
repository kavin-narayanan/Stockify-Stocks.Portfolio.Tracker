// Navbar.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ListAltIcon from "@mui/icons-material/ListAlt";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import "./Navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="navbar">
      <div className="navbar-logo">STOCKIFY</div>

      <button className="menu-button" onClick={toggleMenu}>
        {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
        <Link to="/" className="nav-link">
          <HomeIcon style={{ color: "#00AFFF" }} /> Home
        </Link>
        <Link to="/add-stock" className="nav-link">
          <AddCircleOutlineIcon style={{ color: "#00AFFF" }} /> Add Stock
        </Link>
        <Link to="/view-stocks" className="nav-link">
          <ListAltIcon style={{ color: "#00AFFF" }} /> View Stocks
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
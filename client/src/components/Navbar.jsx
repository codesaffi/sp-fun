import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import React from "react";

export default function Navbar() {
  const { token, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  const handleLogout = () => {
    logout();
    closeMenu();
  };

  return (
    <>
      <nav className="responsive-navbar">
        <Link to="/" className="brand-link" onClick={closeMenu}>
          <span className="brand-mark">m</span>
          <span>MusicMatch</span>
        </Link>

        <div className="navbar-actions">
          <div className="desktop-nav">
            <NavLink to="/" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")} end>
              Home
            </NavLink>
            {token && (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                  Dashboard
                </NavLink>
                <button onClick={handleLogout} className="nav-link danger">
                  Logout
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            className="menu-toggle"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            ☰
          </button>
        </div>
      </nav>

      {menuOpen && <button type="button" className="nav-overlay" onClick={closeMenu} aria-label="Close navigation" />}

      <div className={`mobile-nav-panel${menuOpen ? " open" : ""}`}>
        <NavLink to="/" className={({ isActive }) => (isActive ? "mobile-nav-link active" : "mobile-nav-link")} end onClick={closeMenu}>
          Home
        </NavLink>
        {token && (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "mobile-nav-link active" : "mobile-nav-link")} onClick={closeMenu}>
              Dashboard
            </NavLink>
            <button onClick={handleLogout} className="mobile-nav-link danger">
              Logout
            </button>
          </>
        )}
      </div>
    </>
  );
}

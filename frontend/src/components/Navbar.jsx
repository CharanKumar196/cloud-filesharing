import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CloudLogo from './CloudLogo';
import './Navbar.css';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo Section */}
        <div className="navbar-logo" onClick={() => navigate('/')}>
          <CloudLogo width={40} height={40} color="#007BFF" />
          <span className="logo-text">Cloud File Sharing</span>
        </div>

        {/* Menu Toggle for Mobile */}
        <button
          className="navbar-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Links */}
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          {isLoggedIn ? (
            <>
              <button
                className="nav-btn dashboard-btn"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </button>
              <button
                className="nav-btn logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="nav-btn login-btn"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button
                className="nav-btn signup-btn"
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
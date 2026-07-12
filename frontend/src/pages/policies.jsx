import React, { useState } from 'react';
import './PoliciesPage.css';

const PoliciesPage = () => {
  const [activePage, setActivePage] = useState('terms');

  const termsContent = `# Terms of Service

Last Updated: June 30, 2026

## 1. Agreement to Terms
By accessing and using this Cloud File Sharing System ("Service"), you agree to be bound by these Terms of Service...`;

  const privacyContent = `# Privacy Policy

Last Updated: June 30, 2026

## 1. Introduction
Cloud File Sharing System ("we," "us," "our," or "Company") operates the website and related services...`;

  const cookiesContent = `# Cookies Policy

Last Updated: June 30, 2026

## 1. Introduction
This Cookies Policy explains how Cloud File Sharing System uses cookies and similar tracking technologies...`;

  const getContent = () => {
    switch(activePage) {
      case 'terms':
        return termsContent;
      case 'privacy':
        return privacyContent;
      case 'cookies':
        return cookiesContent;
      default:
        return termsContent;
    }
  };

  return (
    <div className="policies-container">
      {/* Navigation Tabs */}
      <div className="policies-nav">
        <button 
          className={`nav-btn ${activePage === 'terms' ? 'active' : ''}`}
          onClick={() => setActivePage('terms')}
        >
          Terms of Service
        </button>
        <button 
          className={`nav-btn ${activePage === 'privacy' ? 'active' : ''}`}
          onClick={() => setActivePage('privacy')}
        >
          Privacy Policy
        </button>
        <button 
          className={`nav-btn ${activePage === 'cookies' ? 'active' : ''}`}
          onClick={() => setActivePage('cookies')}
        >
          Cookies Policy
        </button>
      </div>

      {/* Content */}
      <div className="policies-content">
        <div className="content-text">
          {getContent()}
        </div>
      </div>
    </div>
  );
};

export default PoliciesPage;
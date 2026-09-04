import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    setPageReady(true);

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(scrollPercent);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-container">
      {/* Progress Bar */}
      <div
        className="progress-bar"
        style={{ width: `${scrollProgress}%` }}
      ></div>

      {/* Background Gradient */}
      <div className="landing-gradient-bg"></div>

      {/* Floating Clouds */}
      <div className="landing-glow landing-glow-1"></div>
      <div className="landing-glow landing-glow-2"></div>
      <div className="landing-glow landing-glow-3"></div>

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="logo">
            <span className="logo-icon">☁️</span>
            <span className="logo-text">Cloud File Sharing</span>
          </div>
          <div className="navbar-buttons">
            <button
              className="navbar-btn navbar-login"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button
              className="navbar-btn navbar-signup"
              onClick={() => navigate('/signup')}
            >
              Sign up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className={`hero-text ${pageReady ? 'slide-up' : ''}`}>
            <div className="hero-badge">
              <svg className="hero-badge-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 10V8a6 6 0 1112 0v2m-13 0h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Encrypted storage &middot; 15 GB free</span>
            </div>

            <h1 className="hero-title">
              Keep every file
              <span className="gradient-text">up in the clouds</span>
            </h1>

            <p className="hero-subtitle">
              Upload, organize and share anything &mdash; folder navigation, live progress
              and signed links, in one calm sky-blue workspace.
            </p>

            <div className="hero-buttons">
              <button
                className="btn btn-primary btn-large"
                onClick={() => navigate('/signup')}
              >
                <span>Create free account</span>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                className="btn btn-secondary btn-large"
                onClick={() => navigate('/dashboard')}
              >
                <span>Explore the dashboard</span>
              </button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className={`hero-visual ${pageReady ? 'slide-up-delay' : ''}`}>
            <div className="hero-card">
              <div className="card-header">
                <div className="card-dot card-dot-1"></div>
                <div className="card-dot card-dot-2"></div>
                <div className="card-dot card-dot-3"></div>
              </div>
              <div className="card-content">
                <svg className="card-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="currentColor"/>
                </svg>
                <p className="card-text">End-to-end encrypted</p>
              </div>
              <div className="card-files">
                <div className="file-item">
                  <div className="file-icon"></div>
                  <span>Document.pdf</span>
                </div>
                <div className="file-item">
                  <div className="file-icon"></div>
                  <span>Image.png</span>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="floating-badge">
              <svg className="badge-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>Secure & Fast</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="section-header">
          <h2 className="section-title">Why choose Cloud File Sharing?</h2>
          <p className="section-subtitle">Everything you need for calm, secure file management</p>
        </div>

        <div className="features-grid">
          {/* Feature 1 */}
          <div className="feature-card feature-card-1">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="feature-title">Encrypted storage</h3>
            <p className="feature-desc">Your files are encrypted with military-grade security. Only you have access.</p>
          </div>

          {/* Feature 2 */}
          <div className="feature-card feature-card-2">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 12a8 8 0 1116 0 8 8 0 01-16 0z" fill="currentColor"/>
                <path d="M12 2v8m0 4v0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="feature-title">Fast uploads</h3>
            <p className="feature-desc">Upload files at blazing speeds with intelligent compression and optimization.</p>
          </div>

          {/* Feature 3 */}
          <div className="feature-card feature-card-4">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="feature-title">Easy sharing</h3>
            <p className="feature-desc">Share files with custom permissions. Control who can view, download, or edit.</p>
          </div>

          {/* Feature 4 */}
          <div className="feature-card feature-card-5">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.5 6c-2.61 0-4.92-1.86-6.16-4.3-.6-1.14-2.28-1.14-2.88 0-1.24 2.44-3.55 4.3-6.16 4.3C4.48 6 2 8.48 2 11.5 2 18 8 22 12 22s10-4 10-10.5c0-3.02-2.48-5.5-5.5-5.5z" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="feature-title">Analytics</h3>
            <p className="feature-desc">Track storage usage and monitor file activity with detailed analytics.</p>
          </div>
        </div>
      </section>

      {/* Info Sections */}
      <section className="info-sections">
        {/* Security Section */}
        <div className="info-card" id="security">
          <div className="info-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="currentColor"/>
            </svg>
          </div>
          <h3 className="info-card-title">Security first</h3>
          <p className="info-card-desc">We use industry-leading encryption and security protocols to protect your data. Your files are encrypted at rest and in transit, ensuring only you can access them.</p>
        </div>

        {/* Privacy Section */}
        <div className="info-card" id="privacy">
          <div className="info-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" fill="currentColor"/>
            </svg>
          </div>
          <h3 className="info-card-title">Your privacy matters</h3>
          <p className="info-card-desc">We never share, sell, or access your personal data. Your privacy is our priority. All data is stored securely and only accessible by you.</p>
        </div>

        {/* Terms Section */}
        <div className="info-card" id="terms">
          <div className="info-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.3-1.54c-.3-.35-.96-.35-1.27 0-.3.36-.3.95.04 1.3l1.97 2.36c.37.44.95.44 1.32 0L17.27 9c.31-.35.31-.94-.04-1.3-.36-.36-.96-.36-1.27 0L13.96 12.29z" fill="currentColor"/>
            </svg>
          </div>
          <h3 className="info-card-title">Terms of service</h3>
          <p className="info-card-desc">By using Cloud File Sharing, you agree to our terms and conditions. </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to get started?</h2>
          <p className="cta-subtitle">Join thousands of users sharing files securely every day.</p>
          <button
            className="btn btn-primary btn-large"
            onClick={() => navigate('/signup')}
          >
            <span>Create free account</span>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4 className="footer-title">Cloud File Sharing</h4>
            <p className="footer-desc">Secure file sharing for everyone.</p>
          </div>
          <div className="footer-section">
            <h4 className="footer-link-title">Product</h4>
            <ul className="footer-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#security">Security</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-link-title">Legal</h4>
            <ul className="footer-links">
              <li><a href="#privacy">Privacy</a></li>
              <li><a href="#terms">Terms</a></li>
            </ul>
          </div>
        </div>
        
      </footer>
    </div>
  );
}
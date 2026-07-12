import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed. Please try again.');
        setLoading(false);
        return;
      }

      // Debug: Check what backend returned
      console.log('Login response:', data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.user?.fullName || email || 'User');
      localStorage.setItem('userEmail', data.user?.email || email || 'user@example.com');
      navigate('/dashboard');
     } catch (err) {
      setError('Connection error. Please check your internet.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Progress Bar */}
      <div 
        className="progress-bar" 
        style={{ width: `${scrollProgress}%` }}
      ></div>

      {/* Background Gradient */}
      <div className="auth-gradient-bg"></div>

      {/* Main Content */}
      <div className={`auth-wrapper ${pageReady ? 'fade-in' : ''}`}>
        <div className="auth-card slide-up">
          {/* Logo & Header */}
          <div className="auth-header">
            <div className="auth-icon-wrapper">
              <svg className="auth-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="currentColor"/>
              </svg>
            </div>
            <h1 className="auth-title">Sign in</h1>
            <p className="auth-subtitle">Welcome back to cloud-file-sharing</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 7v5" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="17" r="1" fill="currentColor"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>

            {/* Remember & Forgot */}
            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="checkbox-input"
                />
                <span>Remember me</span>
              </label>
              <Link to="/reset-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="auth-button"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="auth-footer">
            <p className="auth-footer-text">
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="auth-glow auth-glow-1"></div>
        <div className="auth-glow auth-glow-2"></div>
      </div>
    </div>
  );
}
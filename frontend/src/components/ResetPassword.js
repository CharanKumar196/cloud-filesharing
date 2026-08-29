import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [pageReady, setPageReady] = useState(false);

  // Multi-step form state
  const [step, setStep] = useState(1); // 1: email, 2: verify code, 3: new password
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [codeTimer, setCodeTimer] = useState(300); // 5 minutes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Code timer countdown
  useEffect(() => {
    if (step === 2 && codeTimer > 0) {
      const timer = setTimeout(() => setCodeTimer(codeTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [codeTimer, step]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Step 1: Send reset email
  const handleStep1 = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to send reset code.');
        setLoading(false);
        return;
      }

      setStep(2);
      setCodeTimer(300);
      setLoading(false);
    } catch (err) {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  // Handle code input
  const handleCodeChange = (index, value) => {
    const newCode = [...verificationCode];
    newCode[index] = value.slice(-1);
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`reset-code-${index + 1}`)?.focus();
    }
  };

  // Step 2: Verify code
  const handleStep2 = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const code = verificationCode.join('');

    if (code.length !== 6) {
      setError('Please enter all 6 digits.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Invalid verification code.');
        setLoading(false);
        return;
      }

      setStep(3);
      setLoading(false);
    } catch (err) {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleStep3 = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode.join(''), newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to reset password.');
        setLoading(false);
        return;
      }

      // Show success and redirect to login
      alert('Password reset successfully! Please sign in with your new password.');
      navigate('/login');
    } catch (err) {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setCodeTimer(300);
        setVerificationCode(['', '', '', '', '', '']);
        setLoading(false);
      } else {
        setError('Failed to resend code.');
        setLoading(false);
      }
    } catch (err) {
      setError('Connection error.');
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setStep(1);
    setEmail('');
    setVerificationCode(['', '', '', '', '', '']);
    setError('');
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
          {/* Step Indicator */}
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <span>1</span>
              <p>Email</p>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <span>2</span>
              <p>Verify</p>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <span>3</span>
              <p>Reset</p>
            </div>
          </div>

          {/* Header */}
          <div className="auth-header">
            <div className="auth-icon-wrapper">
              <svg className="auth-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="11" rx="2" fill="currentColor"/>
                <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <h1 className="auth-title">Reset password</h1>
            <p className="auth-subtitle">
              {step === 1 && 'Enter your email to receive a reset code'}
              {step === 2 && 'Step 2 of 3 — Verify your email'}
              {step === 3 && 'Step 3 of 3 — Create a new password'}
            </p>
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

          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="auth-form">
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
              <button type="submit" disabled={loading} className="auth-button">
                {loading ? 'Sending...' : 'Send reset code'}
              </button>
            </form>
          )}

          {/* Step 2: Verify Code */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="auth-form">
              <div className="form-group">
                <div className="email-display">
                  <p className="email-display-label">Code sent to</p>
                  <p className="email-display-value">{email}</p>
                </div>
                <label className="form-label">Enter 6-digit code</label>
                <div className="code-input-container">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`reset-code-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      className="code-input"
                    />
                  ))}
                </div>
              </div>

              <div className="code-timer">
                <p>Code expires in</p>
                <span className={codeTimer < 60 ? 'warning' : ''}>
                  {formatTime(codeTimer)}
                </span>
              </div>

              <button type="submit" disabled={loading} className="auth-button">
                {loading ? 'Verifying...' : 'Verify code'}
              </button>

              <div className="code-options">
                <p className="code-options-text">Didn't receive code?</p>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="code-options-link"
                >
                  Resend code
                </button>
                <span className="code-options-separator">•</span>
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  className="code-options-link"
                >
                  Change email
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleStep3} className="auth-form">
              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">New password</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="form-input"
                    style={{ width: '100%', boxSizing: 'border-box', paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#1e88e5' }}>
                      {showPassword ? (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </>
                      ) : (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
                <p className="form-helper">Min. 6 characters, include numbers & symbols</p>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm password</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="form-input"
                    style={{ width: '100%', boxSizing: 'border-box', paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#1e88e5' }}>
                      {showConfirmPassword ? (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </>
                      ) : (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="auth-button">
                {loading ? 'Resetting...' : 'Reset password'}
              </button>
            </form>
          )}

          {/* Back to Sign In Link */}
          <div className="auth-footer">
            <p className="auth-footer-text">
              Remember your password?{' '}
              <Link to="/login" className="auth-link">
                Sign in
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
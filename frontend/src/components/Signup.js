import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

export default function Signup() {
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [pageReady, setPageReady] = useState(false);
  
  // Multi-step form state
  const [step, setStep] = useState(1); // 1: email, 2: verify code, 3: profile
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
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

  // Step 1: Send verification email
  const handleStep1 = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to send verification code.');
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
      document.getElementById(`code-${index + 1}`)?.focus();
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
      const response = await fetch('http://localhost:5000/api/auth/verify-code', {
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

  // Step 3: Complete profile & register
const handleStep3 = async (e) => {
  e.preventDefault();
  setError('');

  if (password.length < 6) {
    setError('Password must be at least 6 characters.');
    return;
  }

  if (password !== confirmPassword) {
    setError('Passwords do not match.');
    return;
  }

  if (!termsAccepted) {
    setError('You must accept the Terms & Conditions.');
    return;
  }

  setLoading(true);

  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, fullName, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || 'Registration failed.');
      setLoading(false);
      return;
    }

    console.log('Signup response:', data.user);
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('userName', data.user.fullName || fullName);
    localStorage.setItem('userEmail', data.user.email || email);
    navigate('/dashboard');
  } catch (err) {
    setError('Connection error. Please try again.');
    setLoading(false);
  }
 };

  const handleResendCode = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/send-verification', {
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

  const eyeButtonStyle = {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    fontSize: '1.1rem',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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
              <p>Profile</p>
            </div>
          </div>

          {/* Header */}
          <div className="auth-header">
            <div className="auth-icon-wrapper">
              <svg className="auth-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="currentColor"/>
              </svg>
            </div>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">
              {step === 1 && 'Join cloud-file-sharing and start sharing'}
              {step === 2 && 'Step 2 of 3 — Verify your email'}
              {step === 3 && 'Step 3 of 3 — Complete your profile'}
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
              <p className="form-helper">We'll send you a verification code</p>
              <button type="submit" disabled={loading} className="auth-button">
                {loading ? 'Sending...' : 'Continue'}
              </button>
            </form>
          )}

          {/* Step 2: Verify Code */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="auth-form">
              <div className="form-group">
                <p className="verify-email-text">Code sent to <strong>{email}</strong></p>
                <label className="form-label">Enter 6-digit code</label>
                <div className="code-input-container">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
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
                  onClick={() => { setStep(1); setEmail(''); }}
                  className="code-options-link"
                >
                  Change email
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Complete Profile */}
          {step === 3 && (
            <form onSubmit={handleStep3} className="auth-form">
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">Full name</label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Create password</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-input"
                    style={{ width: '100%', boxSizing: 'border-box', paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={eyeButtonStyle}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
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
                    style={eyeButtonStyle}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="checkbox-input"
                  required
                />
                <span>I agree to the <Link to="/terms" className="terms-link">Terms & Conditions</Link></span>
              </label>

              <button type="submit" disabled={loading} className="auth-button">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Sign In Link */}
          <div className="auth-footer">
            <p className="auth-footer-text">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className  ="auth-glow auth-glow-1"></div>
        <div className="auth-glow auth-glow-2"></div>
      </div>
    </div>
  );
}
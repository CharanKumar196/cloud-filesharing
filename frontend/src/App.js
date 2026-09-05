import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import ResetPassword from './components/ResetPassword';
import SharedFileView from './components/SharedFileView';
import AdminDashboard from './components/Admin/AdminDashboard';
import "./theme-variables.css";
import { checkIsAdmin } from './api';


function AppContent() {
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      checkIsAdmin(token).then((res) => {
        setIsAdmin(res.success && res.isAdmin);
        setAdminChecked(true);
      });
    } else {
      setIsAdmin(false);
      setAdminChecked(true);
    }
  }, [token]);

  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('token');
      setToken(newToken);
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const newToken = localStorage.getItem('token');
      if (newToken !== token) {
        setToken(newToken);
      }
    }, 500);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [token]);

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  // Hide navbar on Dashboard only
  const showNavbar = location.pathname === '/';

  const AuthRedirect = () => {
    if (!token) return <LandingPage />;
    if (!adminChecked) return <div style={{ padding: 40, textAlign: 'center' }}>Checking access...</div>;
    return isAdmin ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />;
  };

  const LoginRedirect = () => {
    if (!token) return <Login />;
    if (!adminChecked) return <div style={{ padding: 40, textAlign: 'center' }}>Checking access...</div>;
    return isAdmin ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />;
  };

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<AuthRedirect />} />
        <Route path="/login" element={<LoginRedirect />} />
        <Route path="/signup" element={token ? <Navigate to="/dashboard" /> : <Signup />} />
        <Route path="/reset-password" element={token ? <Navigate to="/dashboard" /> : <ResetPassword />} />
        <Route path="/shared/:fileId" element={<SharedFileView />} />
        <Route
          path="/dashboard"
          element={
            !token ? (
              <Navigate to="/" />
            ) : !adminChecked ? (
              <div style={{ padding: 40, textAlign: 'center' }}>Checking access...</div>
            ) : isAdmin ? (
              <Navigate to="/admin" />
            ) : (
              <Dashboard token={token} onLogout={handleLogout} isAdmin={isAdmin} />
            )
          }
        />
        <Route
          path="/admin"
          element={
            !adminChecked ? (
              <div style={{ padding: 40, textAlign: 'center' }}>Checking access...</div>
            ) : token && isAdmin ? (
              <AdminDashboard token={token} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
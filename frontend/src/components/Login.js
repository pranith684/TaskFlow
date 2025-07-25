// frontend/src/components/Login.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthAnimation from './AuthAnimation'; // ✅ Import the new animation component
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../styles/Auth.css';

const Logo = () => (
  <div className="auth-header">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 5H7C5.89543 5 5 5.89543 5 7V17C5 18.1046 5.89543 19 7 19H17C18.1046 19 19 18.1046 19 17V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 12L11 14L15 10" stroke="var(--secondary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <span>TaskFlow</span>
  </div>
);

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:3001/login', { email, password });
      if (res.data.status === 'ok') {
        localStorage.setItem('token', res.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response) { setError(err.response.data.error || 'An unknown server error occurred.'); } 
      else if (err.request) { setError('Cannot connect to the server. Please check the backend is running.'); } 
      else { setError('An error occurred while preparing the request.'); }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (setter) => (e) => {
    setError('');
    setter(e.target.value);
  };

  return (
    <div className="auth-container">
      <div className="auth-panel auth-form-container">
        <div>
          <Logo />
          <h2>Welcome Back!</h2>
          <p>Please enter your details to sign in.</p>
          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" placeholder="you@example.com" className="input-field" value={email} onChange={handleInputChange(setEmail)} required />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="password-wrapper">
                <input id="password" type={showPwd ? 'text' : 'password'} placeholder="••••••••" className="input-field" value={password} onChange={handleInputChange(setPassword)} required />
                <span className="toggle-eye" onClick={() => setShowPwd(!showPwd)}>{showPwd ? <FaEyeSlash /> : <FaEye />}</span>
              </div>
            </div>
            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            {error && <p className="error-message">{error}</p>}
          </form>
          <p className="switch-link">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
      <div className="auth-panel auth-illustration">
        <div className="illustration-content">
          <AuthAnimation /> {/* ✅ Replace static image with animation */}
          <h3>Manage Your Day</h3>
          <p>Take control of your tasks and boost your productivity.</p>
        </div>
      </div>
    </div>
  );
}

export default Login;

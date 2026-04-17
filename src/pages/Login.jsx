// pages/Login.jsx
// User login with role detection and validation

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);

    // Simulate small network delay
    await new Promise(r => setTimeout(r, 500));

    const result = login(form.email, form.password);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
    } else {
      navigate(result.user.role === 'employer' ? '/employer/dashboard' : '/seeker/jobs');
    }
  };

  // Quick login helpers for demo
  const quickLogin = (email) => {
    setForm({ email, password: 'password' });
  };

  return (
    <div className="auth-page">
      <div className="auth-card card animate-fade-in">
        {/* Header */}
        <div className="auth-header">
          <Link to="/" className="auth-logo">⬡ HireHub</Link>
          <h2>Welcome back</h2>
          <p>Sign in to your account</p>
        </div>

        {/* Demo buttons */}
        <div className="demo-logins">
          <p className="demo-label">Quick demo login:</p>
          <div className="demo-btns">
            <button className="demo-btn" onClick={() => quickLogin('priya@example.com')}>
              👤 Job Seeker
            </button>
            <button className="demo-btn" onClick={() => quickLogin('rahul@example.com')}>
              🏢 Employer
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error animate-slide-down">
              ⚠ {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? <><div className="spinner" /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one →</Link>
        </p>
      </div>
    </div>
  );
}

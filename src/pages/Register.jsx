// pages/Register.jsx
// New user registration with role selection

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    name:     '',
    email:    '',
    password: '',
    role:     searchParams.get('role') || 'seeker',
    company:  '',
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.role === 'employer' && !form.company) {
      setError('Please enter your company name.');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const result = register(form);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
    } else {
      navigate(form.role === 'employer' ? '/employer/dashboard' : '/seeker/jobs');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card animate-fade-in">
        <div className="auth-header">
          <Link to="/" className="auth-logo">⬡ HireHub</Link>
          <h2>Create your account</h2>
          <p>Join thousands of professionals</p>
        </div>

        {/* Role Selector */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${form.role === 'seeker' ? 'active' : ''}`}
            onClick={() => setForm(f => ({ ...f, role: 'seeker' }))}
          >
            <span className="role-icon">👤</span>
            <span className="role-label">Job Seeker</span>
            <span className="role-desc">Looking for a job</span>
          </button>
          <button
            type="button"
            className={`role-btn ${form.role === 'employer' ? 'active' : ''}`}
            onClick={() => setForm(f => ({ ...f, role: 'employer' }))}
          >
            <span className="role-icon">🏢</span>
            <span className="role-label">Employer</span>
            <span className="role-desc">Hiring talent</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error animate-slide-down">⚠ {error}</div>}

          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              name="name"
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          {form.role === 'employer' && (
            <div className="form-group animate-slide-down">
              <label className="form-label">Company Name *</label>
              <input
                name="company"
                type="text"
                className="form-input"
                placeholder="Acme Inc."
                value={form.company}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              name="password"
              type="password"
              className="form-input"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading
              ? <><div className="spinner" /> Creating account…</>
              : `Create ${form.role === 'employer' ? 'Employer' : 'Seeker'} Account`
            }
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}

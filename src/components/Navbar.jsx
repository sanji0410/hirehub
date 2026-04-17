// components/Navbar.jsx
// Top navigation bar with responsive mobile menu

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setProfileOpen(false);
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const seekerLinks = [
    { to: '/seeker/jobs',    label: 'Find Jobs' },
    { to: '/seeker/applications', label: 'My Applications' },
    { to: '/seeker/profile', label: 'Profile' },
  ];

  const employerLinks = [
    { to: '/employer/dashboard', label: 'Dashboard' },
    { to: '/employer/post-job',  label: 'Post a Job' },
    { to: '/employer/jobs',      label: 'My Jobs' },
  ];

  const links = user?.role === 'employer' ? employerLinks : seekerLinks;

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo">⬡</span>
          HireHub
        </Link>

        {/* Desktop Links */}
        {user && (
          <ul className="navbar-links">
            {links.map(link => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`navbar-link ${isActive(link.to) ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* Right side */}
        <div className="navbar-right">
          {user ? (
            <div className="navbar-profile">
              <button
                className="navbar-avatar-btn"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-label="Profile menu"
              >
                <div className="navbar-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="navbar-user-info">
                  <span className="navbar-user-name">{user.name.split(' ')[0]}</span>
                  <span className="navbar-user-role">
                    {user.role === 'employer' ? '🏢 Employer' : '👤 Seeker'}
                  </span>
                </div>
                <svg className={`navbar-chevron ${profileOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {profileOpen && (
                <div className="navbar-dropdown animate-slide-down">
                  <div className="navbar-dropdown-header">
                    <p className="dropdown-name">{user.name}</p>
                    <p className="dropdown-email">{user.email}</p>
                  </div>
                  <div className="divider" style={{margin: '6px 0'}} />
                  {links.map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="navbar-dropdown-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="divider" style={{margin: '6px 0'}} />
                  <button className="navbar-dropdown-item danger" onClick={handleLogout}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar-auth-btns">
              <Link to="/login"    className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          {user && (
            <button
              className={`navbar-hamburger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && user && (
        <div className="navbar-mobile-menu animate-slide-down">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar-mobile-link ${isActive(link.to) ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <button className="navbar-mobile-link danger" onClick={handleLogout}>Sign Out</button>
        </div>
      )}

      {/* Backdrop for dropdown */}
      {profileOpen && (
        <div className="navbar-backdrop" onClick={() => setProfileOpen(false)} />
      )}
    </nav>
  );
}

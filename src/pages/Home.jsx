// pages/Home.jsx
// Public landing page for HireHub

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobsContext';
import './Home.css';

export default function Home() {
  const { user } = useAuth();
  const { jobs } = useJobs();

  const stats = [
    { label: 'Active Jobs',   value: jobs.length },
    { label: 'Companies',     value: '120+' },
    { label: 'Job Seekers',   value: '5K+' },
    { label: 'Hired Monthly', value: '200+' },
  ];

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <div className="hero-grid" />
        </div>
        <div className="container hero-content">
          <div className="hero-text animate-fade-in">
            <div className="hero-eyebrow">
              <span className="badge badge-blue">🚀 Find your next opportunity</span>
            </div>
            <h1 className="hero-title">
              The Modern Way to
              <span className="hero-highlight"> Hire & Get Hired</span>
            </h1>
            <p className="hero-desc">
              HireHub connects talented professionals with great companies.
              Whether you're looking for your dream job or building your dream team,
              we make it seamless.
            </p>
            {user ? (
              <div className="hero-cta">
                <Link
                  to={user.role === 'employer' ? '/employer/dashboard' : '/seeker/jobs'}
                  className="btn btn-primary btn-lg"
                >
                  Go to Dashboard →
                </Link>
              </div>
            ) : (
              <div className="hero-cta">
                <Link to="/register?role=seeker" className="btn btn-primary btn-lg">
                  Find Jobs
                </Link>
                <Link to="/register?role=employer" className="btn btn-outline btn-lg">
                  Post a Job
                </Link>
              </div>
            )}
          </div>

          {/* Floating Job Cards */}
          <div className="hero-visual animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="hero-card hc-1">
              <div className="hc-logo">T</div>
              <div>
                <p className="hc-title">Senior React Dev</p>
                <p className="hc-sub">TechNova · ₹18-25 LPA</p>
              </div>
              <span className="badge badge-green">Full-time</span>
            </div>
            <div className="hero-card hc-2">
              <div className="hc-logo hc-logo-purple">D</div>
              <div>
                <p className="hc-title">UI/UX Designer</p>
                <p className="hc-sub">DesignCo · ₹12-18 LPA</p>
              </div>
              <span className="badge badge-purple">Remote</span>
            </div>
            <div className="hero-card hc-3">
              <div className="hc-logo hc-logo-yellow">A</div>
              <div>
                <p className="hc-title">Data Scientist</p>
                <p className="hc-sub">AnalyzeX · ₹20-30 LPA</p>
              </div>
              <span className="badge badge-yellow">Contract</span>
            </div>
            <div className="hero-badge-float hf-1">✓ Applied</div>
            <div className="hero-badge-float hf-2">🎯 Interview</div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid stagger-children">
            {stats.map(s => (
              <div key={s.label} className="stat-item animate-fade-in">
                <p className="stat-value">{s.value}</p>
                <p className="stat-label">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="how-section">
        <div className="container">
          <div className="section-header">
            <h2>How HireHub Works</h2>
            <p>Get started in minutes — no complexity, just results.</p>
          </div>
          <div className="how-grid stagger-children">
            {[
              { step: '01', icon: '👤', title: 'Create Account', desc: 'Sign up as a job seeker or employer in under a minute.' },
              { step: '02', icon: '🔍', title: 'Search or Post', desc: 'Browse thousands of jobs or post your opening to reach top talent.' },
              { step: '03', icon: '📩', title: 'Apply or Review', desc: 'Apply with one click or review applicants from your dashboard.' },
              { step: '04', icon: '🎉', title: 'Get Hired!', desc: 'Connect, interview, and land your next big opportunity.' },
            ].map((item) => (
              <div key={item.step} className="how-card card animate-fade-in">
                <div className="how-step">{item.step}</div>
                <div className="how-icon">{item.icon}</div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-banner">
            <div className="cta-text">
              <h2>Ready to find your dream job?</h2>
              <p>Join thousands of professionals who found their perfect match on HireHub.</p>
            </div>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
              <Link to="/login"    className="btn btn-outline btn-lg" style={{background:'transparent', color:'white', borderColor:'rgba(255,255,255,0.4)'}}>Sign In</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// pages/seeker/JobDetail.jsx
// Full job details and apply modal for seekers

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobsContext';
import StatusBadge from '../../components/StatusBadge';
import './JobDetail.css';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { jobs, applyToJob, hasApplied, getAppsBySeeker } = useJobs();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const job = jobs.find(j => j.id === id);

  if (!job) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>Job not found</h3>
            <p>This job listing may have been removed.</p>
            <Link to="/seeker/jobs" className="btn btn-primary">Browse Jobs</Link>
          </div>
        </div>
      </div>
    );
  }

  const applied = hasApplied(job.id, user.id);
  const myApp   = getAppsBySeeker(user.id).find(a => a.jobId === job.id);

  const handleApply = async () => {
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 800));
    const result = applyToJob(job.id, user, coverLetter);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => { setShowModal(false); setSuccess(false); }, 2000);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Back nav */}
        <button className="jd-back btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
          ← Back to listings
        </button>

        <div className="jd-layout">
          {/* Main Content */}
          <article className="jd-main card animate-fade-in">
            {/* Header */}
            <div className="jd-header">
              <div className="jd-company-logo">
                {job.company.charAt(0)}
              </div>
              <div className="jd-header-info">
                <span className="jd-company">{job.company}</span>
                <h1 className="jd-title">{job.title}</h1>
                <div className="jd-meta">
                  <span className="job-info-pill">
                    📍 {job.location}
                  </span>
                  <span className="job-info-pill">
                    💰 {job.salary}
                  </span>
                  <span className="job-info-pill">
                    📅 {timeAgo(job.postedAt)}
                  </span>
                  <span className={`badge ${job.type === 'Full-time' ? 'badge-green' : 'badge-purple'}`}>
                    {job.type}
                  </span>
                </div>
              </div>
            </div>

            <div className="divider" />

            {/* Skills */}
            <section className="jd-section">
              <h4>Required Skills</h4>
              <div className="jd-skills">
                {job.skills.map(s => <span key={s} className="tag">{s}</span>)}
              </div>
            </section>

            <div className="divider" />

            {/* Description */}
            <section className="jd-section">
              <h4>Job Description</h4>
              <div className="jd-desc">
                {job.description.split('\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </section>
          </article>

          {/* Sidebar */}
          <aside className="jd-sidebar">
            {/* Apply Card */}
            <div className="jd-apply-card card animate-fade-in">
              {applied ? (
                <>
                  <div className="jd-applied-banner">
                    <span style={{ fontSize: '2rem' }}>✅</span>
                    <h4>Application Submitted</h4>
                    <p>You applied to this job</p>
                  </div>
                  {myApp && (
                    <div style={{ marginTop: 'var(--space-4)', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: 'var(--space-2)' }}>
                        Current Status:
                      </p>
                      <StatusBadge status={myApp.status} />
                    </div>
                  )}
                  <Link to="/seeker/applications" className="btn btn-outline" style={{ marginTop: 'var(--space-4)', width: '100%' }}>
                    Track Application
                  </Link>
                </>
              ) : (
                <>
                  <h4 style={{ marginBottom: 'var(--space-3)' }}>Ready to apply?</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: 'var(--space-4)' }}>
                    Submit your application and cover letter below.
                  </p>
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowModal(true)}>
                    Apply Now →
                  </button>
                </>
              )}
            </div>

            {/* Job Summary */}
            <div className="jd-summary card">
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: '0.9375rem' }}>Job Overview</h4>
              {[
                { icon: '📋', label: 'Job Type',  val: job.type },
                { icon: '📍', label: 'Location',  val: job.location },
                { icon: '💰', label: 'Salary',    val: job.salary },
                { icon: '🏢', label: 'Company',   val: job.company },
              ].map(item => (
                <div key={item.label} className="jd-summary-row">
                  <span className="jd-summary-icon">{item.icon}</span>
                  <div>
                    <p className="jd-summary-label">{item.label}</p>
                    <p className="jd-summary-val">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {/* Apply Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box card animate-fade-in" onClick={e => e.stopPropagation()}>
            {success ? (
              <div className="modal-success">
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🎉</div>
                <h3>Application Sent!</h3>
                <p>Good luck, {user.name.split(' ')[0]}!</p>
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <div>
                    <h3>Apply for {job.title}</h3>
                    <p className="modal-subtitle">{job.company}</p>
                  </div>
                  <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                  <label className="form-label">Cover Letter</label>
                  <textarea
                    className="form-textarea"
                    rows={6}
                    placeholder="Tell the employer why you're a great fit for this role..."
                    value={coverLetter}
                    onChange={e => setCoverLetter(e.target.value)}
                  />
                </div>

                <div className="modal-footer">
                  <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleApply} disabled={loading}>
                    {loading ? <><div className="spinner" /> Submitting…</> : 'Submit Application'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

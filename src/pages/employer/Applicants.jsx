// pages/employer/Applicants.jsx
// Employer reviews and updates status for applicants of a specific job

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useJobs } from '../../context/JobsContext';
import { useAuth } from '../../context/AuthContext';
import StatusBadge, { STATUS_CONFIG } from '../../components/StatusBadge';
import './Applicants.css';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

export default function Applicants() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const { jobs, getAppsByJob, updateAppStatus } = useJobs();
  const [selectedApp, setSelectedApp] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const job  = jobs.find(j => j.id === jobId);
  const apps = getAppsByJob(jobId);

  const filtered = filterStatus === 'all'
    ? apps
    : apps.filter(a => a.status === filterStatus);

  if (!job) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>Job not found</h3>
            <Link to="/employer/jobs" className="btn btn-primary">Back to Jobs</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Back */}
        <Link to="/employer/jobs" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-5)' }}>
          ← Back to My Jobs
        </Link>

        {/* Header */}
        <div className="ap-header card animate-fade-in">
          <div className="ap-header-info">
            <div className="ap-job-logo">{job.company.charAt(0)}</div>
            <div>
              <p className="ap-job-company">{job.company}</p>
              <h2 className="ap-job-title">{job.title}</h2>
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <span className="job-info-pill">📍 {job.location}</span>
                <span className="job-info-pill">💰 {job.salary}</span>
                <span className="badge badge-green">{job.type}</span>
              </div>
            </div>
          </div>
          <div className="ap-header-stat">
            <p className="ap-count">{apps.length}</p>
            <p className="ap-count-label">Total Applicants</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="ap-filters animate-fade-in">
          <button
            className={`ap-filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({apps.length})
          </button>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const count = apps.filter(a => a.status === key).length;
            return (
              <button
                key={key}
                className={`ap-filter-btn ${filterStatus === key ? 'active' : ''}`}
                onClick={() => setFilterStatus(key)}
              >
                {cfg.emoji} {cfg.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Applicants List */}
        {filtered.length === 0 ? (
          <div className="empty-state card" style={{ marginTop: 'var(--space-6)' }}>
            <div className="empty-state-icon">📬</div>
            <h3>{filterStatus === 'all' ? 'No applicants yet' : 'No applicants with this status'}</h3>
            <p>Applications will appear here once candidates apply.</p>
          </div>
        ) : (
          <div className="ap-list stagger-children">
            {filtered.map((app, i) => (
              <div
                key={app.id}
                className={`ap-card card animate-fade-in ${selectedApp?.id === app.id ? 'ap-card-selected' : ''}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="ap-card-main">
                  {/* Avatar */}
                  <div className="ap-avatar">{app.seekerName.charAt(0)}</div>

                  {/* Info */}
                  <div className="ap-info">
                    <p className="ap-name">{app.seekerName}</p>
                    <p className="ap-email">{app.seekerEmail}</p>
                    <p className="ap-date">Applied {timeAgo(app.appliedAt)}</p>
                  </div>

                  {/* Current Status */}
                  <StatusBadge status={app.status} />

                  {/* Action buttons */}
                  <div className="ap-actions">
                    {/* ── FEATURE 1: View Resume ── */}
                    {app.resume ? (
                      <button
                        className="btn btn-outline btn-sm"
                        title={app.resumeName || 'View resume PDF'}
                        onClick={() => window.open(app.resume, '_blank', 'noopener,noreferrer')}
                      >
                        📄 View Resume
                      </button>
                    ) : (
                      <button className="btn btn-ghost btn-sm" disabled title="No resume uploaded">
                        📄 No Resume
                      </button>
                    )}

                    {/* ── FEATURE 2: Send Selection Email ── */}
                    <button
                      className="btn btn-outline btn-sm"
                      title={`Send selection email to ${app.seekerEmail}`}
                      onClick={() => {
                        window.location.href =
                          `mailto:${app.seekerEmail}` +
                          `?subject=Interview%20Selection` +
                          `&body=Hello%20${encodeURIComponent(app.seekerName)}%2C%0A%0A` +
                          `You%20are%20selected%20for%20the%20next%20round.%20` +
                          `Please%20attend%20the%20interview%20on%20%5BDATE%5D%20` +
                          `at%20%5BLOCATION%5D.%0A%0ABest%20regards`;
                      }}
                    >
                      ✉ Send Email
                    </button>

                    {/* Existing Manage / Close toggle */}
                   <button
  className="btn btn-outline btn-sm"
  onClick={() => {
    const subject = encodeURIComponent("Interview Selection");
    const body = encodeURIComponent(
      `Hello ${app.seekerName}, you are selected for the next round. Please attend the interview on [DATE] at [LOCATION].`
    );

    window.location.href = `mailto:${app.email}?subject=${subject}&body=${body}`;
  }}
>
  📧 Send Email
</button>
                  </div>
                </div>

                {/* Expanded: cover letter + status controls */}
                {selectedApp?.id === app.id && (
                  <div className="ap-expanded animate-slide-down">
                    {app.coverLetter && (
                      <div className="ap-cover-letter">
                        <p className="ap-cover-label">Cover Letter</p>
                        <p className="ap-cover-text">{app.coverLetter}</p>
                      </div>
                    )}

                    <div className="ap-status-controls">
                      <p className="ap-status-label">Update Status:</p>
                      <div className="ap-status-buttons">
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                          <button
                            key={key}
                            className={`ap-status-btn ${app.status === key ? 'current' : ''}`}
                            onClick={() => {
                              updateAppStatus(app.id, key);
                              setSelectedApp({ ...app, status: key });
                            }}
                          >
                            {cfg.emoji} {cfg.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

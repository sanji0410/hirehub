// pages/seeker/Applications.jsx
// Seeker's application tracker with status badges

import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobsContext';
import { Link } from 'react-router-dom';
import StatusBadge, { STATUS_CONFIG } from '../../components/StatusBadge';
import './Applications.css';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

export default function Applications() {
  const { user } = useAuth();
  const { getAppsBySeeker, jobs } = useJobs();

  const apps = getAppsBySeeker(user.id);

  // Build enriched list: app + job details
  const enriched = apps.map(app => ({
    ...app,
    job: jobs.find(j => j.id === app.jobId),
  })).filter(a => a.job);

  // Stats summary
  const stats = Object.keys(STATUS_CONFIG).map(key => ({
    key,
    label: STATUS_CONFIG[key].label,
    emoji: STATUS_CONFIG[key].emoji,
    count: enriched.filter(a => a.status === key).length,
  }));

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="apps-header animate-fade-in">
          <div>
            <h1>My Applications</h1>
            <p>Track the status of all your job applications</p>
          </div>
          <Link to="/seeker/jobs" className="btn btn-primary">Browse More Jobs</Link>
        </div>

        {/* Status Summary */}
        {enriched.length > 0 && (
          <div className="apps-stats stagger-children">
            {stats.map(s => (
              <div key={s.key} className={`apps-stat-pill animate-fade-in ${s.count > 0 ? 'active' : ''}`}>
                <span className="apps-stat-emoji">{s.emoji}</span>
                <span className="apps-stat-label">{s.label}</span>
                <span className="apps-stat-count">{s.count}</span>
              </div>
            ))}
          </div>
        )}

        {/* Applications Table */}
        {enriched.length === 0 ? (
          <div className="empty-state card" style={{ marginTop: 'var(--space-8)' }}>
            <div className="empty-state-icon">📩</div>
            <h3>No applications yet</h3>
            <p>Start applying to jobs and track your progress here.</p>
            <Link to="/seeker/jobs" className="btn btn-primary">Find Jobs</Link>
          </div>
        ) : (
          <div className="apps-table-wrap card animate-fade-in">
            <table className="apps-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Applied</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {enriched.map((app, i) => (
                  <tr key={app.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <td>
                      <div className="apps-job-cell">
                        <div className="apps-job-logo">
                          {app.job.company.charAt(0)}
                        </div>
                        <div>
                          <p className="apps-job-title">{app.job.title}</p>
                          <p className="apps-job-loc">📍 {app.job.location}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="apps-company">{app.job.company}</span>
                    </td>
                    <td>
                      <span className="badge badge-gray">{app.job.type}</span>
                    </td>
                    <td>
                      <span className="apps-date">{timeAgo(app.appliedAt)}</span>
                    </td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td>
                      <Link to={`/seeker/jobs/${app.jobId}`} className="btn btn-ghost btn-sm">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

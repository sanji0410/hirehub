// pages/employer/EmployerDashboard.jsx
// Employer home: stats, simple bar chart, recent applicants

import { useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobsContext';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import './EmployerDashboard.css';

// ——— Minimal bar chart using canvas ———
function BarChart({ data }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;

    const ctx    = canvas.getContext('2d');
    const dpr    = window.devicePixelRatio || 1;
    const W      = canvas.offsetWidth;
    const H      = canvas.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const max    = Math.max(...data.map(d => d.value), 1);
    const pad    = { top: 20, right: 16, bottom: 40, left: 36 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;
    const barW   = chartW / data.length * 0.55;
    const gap    = chartW / data.length;

    ctx.clearRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth   = 1;
    [0, 0.25, 0.5, 0.75, 1].forEach(ratio => {
      const y = pad.top + chartH * (1 - ratio);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();
      if (ratio > 0) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px DM Sans, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(max * ratio), pad.left - 4, y + 4);
      }
    });

    // Bars
    data.forEach((d, i) => {
      const x    = pad.left + gap * i + (gap - barW) / 2;
      const barH = (d.value / max) * chartH || 0;
      const y    = pad.top + chartH - barH;

      // Bar shadow/glow
      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      grad.addColorStop(0, '#3b82f6');
      grad.addColorStop(1, '#93c5fd');
      ctx.fillStyle = grad;

      const r = Math.min(4, barW / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + barW - r, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      ctx.lineTo(x + barW, y + barH);
      ctx.lineTo(x, y + barH);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();

      // Value label
      if (d.value > 0) {
        ctx.fillStyle = '#1d4ed8';
        ctx.font = 'bold 11px DM Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(d.value, x + barW / 2, y - 6);
      }

      // X label
      ctx.fillStyle = '#64748b';
      ctx.font = '11px DM Sans, sans-serif';
      ctx.textAlign = 'center';
      const label = d.label.length > 12 ? d.label.slice(0, 10) + '…' : d.label;
      ctx.fillText(label, x + barW / 2, pad.top + chartH + 20);
    });
  }, [data]);

  return <canvas ref={canvasRef} className="bar-chart-canvas" />;
}

export default function EmployerDashboard() {
  const { user } = useAuth();
  const { getJobsByEmployer, getAppsByEmployer, jobs } = useJobs();

  const myJobs  = getJobsByEmployer(user.id);
  const allApps = getAppsByEmployer(user.id);

  const newApps = allApps.filter(a => a.status === 'applied');
  const recentApps = [...allApps]
    .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
    .slice(0, 5);

  // Chart data: applications per job (top 6)
  const chartData = useMemo(() => {
    return myJobs.slice(0, 6).map(job => ({
      label: job.title.split(' ').slice(0, 2).join(' '),
      value: allApps.filter(a => a.jobId === job.id).length,
    }));
  }, [myJobs, allApps]);

  // Status distribution for donut-style list
  const statusCounts = useMemo(() => {
    const counts = {};
    allApps.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });
    return counts;
  }, [allApps]);

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hrs  = Math.floor(diff / (1000 * 60 * 60));
    if (days === 0) return hrs === 0 ? 'Just now' : `${hrs}h ago`;
    if (days === 1) return '1d ago';
    return `${days}d ago`;
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Welcome */}
        <div className="emp-welcome animate-fade-in">
          <div>
            <h1>Welcome back, {user.name.split(' ')[0]} 👋</h1>
            <p>{user.company || 'Your Company'} · Employer Dashboard</p>
          </div>
          <div className="emp-welcome-actions">
            <Link to="/employer/post-job" className="btn btn-primary">+ Post a Job</Link>
            <Link to="/employer/jobs"     className="btn btn-outline">View All Jobs</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="emp-stats stagger-children">
          <StatCard
            icon="💼"
            label="Total Jobs"
            value={myJobs.length}
            color="blue"
            trend="Active listings"
          />
          <StatCard
            icon="📩"
            label="Total Applications"
            value={allApps.length}
            color="green"
            trend="Across all jobs"
          />
          <StatCard
            icon="🆕"
            label="New Applications"
            value={newApps.length}
            color="purple"
            trend="Awaiting review"
          />
          <StatCard
            icon="🎯"
            label="Interviews"
            value={allApps.filter(a => a.status === 'interview').length}
            color="yellow"
            trend="Scheduled"
          />
        </div>

        {/* Charts + Recent Row */}
        <div className="emp-grid">
          {/* Applications per Job chart */}
          <div className="emp-chart-card card animate-fade-in">
            <div className="emp-card-header">
              <h4>Applications per Job</h4>
              <span className="badge badge-blue">{myJobs.length} jobs</span>
            </div>
            {myJobs.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <div className="empty-state-icon">📊</div>
                <h3>No data yet</h3>
                <p>Post your first job to see stats.</p>
              </div>
            ) : (
              <BarChart data={chartData} />
            )}
          </div>

          {/* Status Distribution */}
          <div className="emp-status-card card animate-fade-in">
            <div className="emp-card-header">
              <h4>Application Status</h4>
            </div>
            {allApps.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
                <p>No applications yet.</p>
              </div>
            ) : (
              <div className="emp-status-list">
                {[
                  { key: 'applied',     label: 'Applied',       color: '#3b82f6' },
                  { key: 'review',      label: 'Under Review',  color: '#8b5cf6' },
                  { key: 'shortlisted', label: 'Shortlisted',   color: '#10b981' },
                  { key: 'interview',   label: 'Interview',     color: '#f59e0b' },
                  { key: 'rejected',    label: 'Rejected',      color: '#ef4444' },
                ].map(s => {
                  const count  = statusCounts[s.key] || 0;
                  const pct    = allApps.length > 0 ? (count / allApps.length) * 100 : 0;
                  return (
                    <div key={s.key} className="emp-status-row">
                      <span className="emp-status-label">{s.label}</span>
                      <div className="emp-status-bar-wrap">
                        <div
                          className="emp-status-bar"
                          style={{ width: `${pct}%`, background: s.color }}
                        />
                      </div>
                      <span className="emp-status-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="emp-recent card animate-fade-in">
          <div className="emp-card-header">
            <h4>Recent Applications</h4>
            <Link to="/employer/jobs" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          {recentApps.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
              <div className="empty-state-icon">📬</div>
              <h3>No applications yet</h3>
              <p>Applications will appear here when candidates apply.</p>
            </div>
          ) : (
            <div className="emp-recent-list">
              {recentApps.map((app, i) => {
                const job = myJobs.find(j => j.id === app.jobId);
                return (
                  <div key={app.id} className="emp-recent-item animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="emp-recent-avatar">{app.seekerName.charAt(0)}</div>
                    <div className="emp-recent-info">
                      <p className="emp-recent-name">{app.seekerName}</p>
                      <p className="emp-recent-job">{job?.title || 'Unknown Job'}</p>
                    </div>
                    <StatusBadge status={app.status} />
                    <span className="emp-recent-time">{timeAgo(app.appliedAt)}</span>
                    {job && (
                      <Link to={`/employer/jobs/${job.id}/applicants`} className="btn btn-outline btn-sm">
                        Review
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

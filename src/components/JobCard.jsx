// components/JobCard.jsx
// Reusable card for displaying a single job listing

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobsContext';
import './JobCard.css';

// Helper: format relative time
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (days === 0) return hours === 0 ? 'Just now' : `${hours}h ago`;
  if (days === 1) return '1 day ago';
  if (days < 7)  return `${days} days ago`;
  return `${Math.floor(days / 7)}w ago`;
}

// Job type badge colour
function typeClass(type) {
  const map = {
    'Full-time': 'badge-green',
    'Part-time': 'badge-purple',
    'Contract':  'badge-yellow',
    'Internship':'badge-blue',
    'Remote':    'badge-gray',
  };
  return map[type] || 'badge-gray';
}

export default function JobCard({ job, showActions = false, onDelete }) {
  const { user } = useAuth();
  const { hasApplied, getAppsByJob } = useJobs();

  const applied      = user?.role === 'seeker' && hasApplied(job.id, user.id);
  const applicantCount = getAppsByJob(job.id).length;

  return (
    <div className="job-card card card-hover animate-fade-in">
      {/* Header */}
      <div className="job-card-header">
        <div className="job-card-company-logo">
          {job.company.charAt(0)}
        </div>
        <div className="job-card-meta">
          <p className="job-card-company">{job.company}</p>
          <span className={`badge ${typeClass(job.type)}`}>{job.type}</span>
        </div>
        <span className="job-card-time">{timeAgo(job.postedAt)}</span>
      </div>

      {/* Title */}
      <h3 className="job-card-title">{job.title}</h3>

      {/* Info pills */}
      <div className="job-card-info">
        <span className="job-info-pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {job.location}
        </span>
        <span className="job-info-pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          {job.salary}
        </span>
      </div>

      {/* Description preview */}
      <p className="job-card-desc">
        {job.description.length > 120 ? job.description.slice(0, 120) + '…' : job.description}
      </p>

      {/* Skills */}
      <div className="job-card-skills">
        {job.skills.slice(0, 4).map(skill => (
          <span key={skill} className="tag">{skill}</span>
        ))}
        {job.skills.length > 4 && (
          <span className="tag" style={{ background: 'var(--gray-100)', color: 'var(--gray-500)' }}>
            +{job.skills.length - 4}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="job-card-footer">
        {user?.role === 'employer' ? (
          <>
            <span className="job-card-applicants">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              {applicantCount} applicant{applicantCount !== 1 ? 's' : ''}
            </span>
            <div className="job-card-actions">
              <Link to={`/employer/jobs/${job.id}/applicants`} className="btn btn-outline btn-sm">
                View Applicants
              </Link>
              {showActions && onDelete && (
                <button className="btn btn-ghost btn-sm" onClick={() => onDelete(job.id)}
                  style={{ color: 'var(--error)' }}>
                  Delete
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            {applied ? (
              <span className="badge badge-green" style={{ alignSelf: 'center' }}>✓ Applied</span>
            ) : (
              <span />
            )}
            <Link to={`/seeker/jobs/${job.id}`} className="btn btn-primary btn-sm">
              {applied ? 'View Details' : 'Apply Now'}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

// pages/employer/EmployerJobs.jsx
// Employer view of all their posted jobs

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobsContext';
import JobCard from '../../components/JobCard';
import './EmployerJobs.css';

export default function EmployerJobs() {
  const { user } = useAuth();
  const { getJobsByEmployer, deleteJob, getAppsByJob } = useJobs();
  const [confirmDelete, setConfirmDelete] = useState(null);

  const myJobs = getJobsByEmployer(user.id);

  const handleDelete = (jobId) => {
    deleteJob(jobId);
    setConfirmDelete(null);
  };

  const totalApplicants = myJobs.reduce(
    (sum, job) => sum + getAppsByJob(job.id).length, 0
  );

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="ej-header animate-fade-in">
          <div>
            <h1>My Job Listings</h1>
            <p>
              {myJobs.length} job{myJobs.length !== 1 ? 's' : ''} posted
              · {totalApplicants} total applicant{totalApplicants !== 1 ? 's' : ''}
            </p>
          </div>
          <Link to="/employer/post-job" className="btn btn-primary">+ Post New Job</Link>
        </div>

        {myJobs.length === 0 ? (
          <div className="empty-state card" style={{ marginTop: 'var(--space-8)' }}>
            <div className="empty-state-icon">💼</div>
            <h3>No jobs posted yet</h3>
            <p>Create your first job listing to start receiving applications.</p>
            <Link to="/employer/post-job" className="btn btn-primary">Post a Job</Link>
          </div>
        ) : (
          <div className="ej-grid stagger-children">
            {myJobs.map(job => (
              <div key={job.id} className="ej-job-wrap">
                <JobCard
                  job={job}
                  showActions={true}
                  onDelete={(id) => setConfirmDelete(id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-box card animate-fade-in" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)' }}>🗑️</div>
              <h3 style={{ marginBottom: 'var(--space-2)' }}>Delete this job?</h3>
              <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-6)' }}>
                This will permanently remove the listing and all its applications.
                This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
                <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(confirmDelete)}>
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

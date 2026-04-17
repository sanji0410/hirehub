// pages/seeker/JobListings.jsx
// Browse, search, and filter all available job postings

import { useState, useMemo } from 'react';
import { useJobs } from '../../context/JobsContext';
import JobCard from '../../components/JobCard';
import './JobListings.css';

const JOB_TYPES  = ['All Types', 'Full-time', 'Part-time', 'Contract', 'Internship'];
const SALARY_RANGES = [
  { label: 'Any Salary', min: 0 },
  { label: '₹5–10 LPA',  min: 5 },
  { label: '₹10–20 LPA', min: 10 },
  { label: '₹20+ LPA',   min: 20 },
];

export default function JobListings() {
  const { jobs } = useJobs();
  const [search,   setSearch]   = useState('');
  const [typeFilter, setType]   = useState('All Types');
  const [locFilter,  setLoc]    = useState('');
  const [salaryIdx,  setSalary] = useState(0);
  const [sortBy,     setSort]   = useState('newest');

  // Collect unique locations for filter dropdown
  const locations = useMemo(() => {
    const locs = [...new Set(jobs.map(j => j.location))].sort();
    return ['All Locations', ...locs];
  }, [jobs]);

  // Filter + sort jobs
  const filteredJobs = useMemo(() => {
    let result = [...jobs];
    const q = search.toLowerCase().trim();

    if (q) {
      result = result.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.skills.some(s => s.toLowerCase().includes(q)) ||
        j.description.toLowerCase().includes(q)
      );
    }

    if (typeFilter !== 'All Types') {
      result = result.filter(j => j.type === typeFilter);
    }

    if (locFilter && locFilter !== 'All Locations') {
      result = result.filter(j => j.location === locFilter);
    }

    const minSalary = SALARY_RANGES[salaryIdx]?.min || 0;
    if (minSalary > 0) {
      result = result.filter(j => {
        const match = j.salary.match(/\d+/);
        return match ? parseInt(match[0]) >= minSalary : true;
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.postedAt) - new Date(a.postedAt);
      if (sortBy === 'oldest') return new Date(a.postedAt) - new Date(b.postedAt);
      return 0;
    });

    return result;
  }, [jobs, search, typeFilter, locFilter, salaryIdx, sortBy]);

  const clearFilters = () => {
    setSearch(''); setType('All Types');
    setLoc(''); setSalary(0);
  };

  const hasFilters = search || typeFilter !== 'All Types' || locFilter || salaryIdx > 0;

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Page Header */}
        <div className="jl-header animate-fade-in">
          <div>
            <h1>Find Your Next Role</h1>
            <p>{jobs.length} jobs available right now</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="jl-search-bar card animate-fade-in">
          <div className="jl-search-input-wrap">
            <svg className="jl-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              className="jl-search-input"
              placeholder="Search job title, company, or skill…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="jl-clear-btn" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
          <button className="btn btn-primary">Search</button>
        </div>

        <div className="jl-layout">
          {/* Sidebar Filters */}
          <aside className="jl-sidebar animate-fade-in-left">
            <div className="jl-filters card">
              <div className="jl-filter-header">
                <h4>Filters</h4>
                {hasFilters && (
                  <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                    Clear all
                  </button>
                )}
              </div>

              {/* Job Type */}
              <div className="jl-filter-group">
                <p className="jl-filter-label">Job Type</p>
                {JOB_TYPES.map(t => (
                  <label key={t} className={`jl-filter-option ${typeFilter === t ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="type"
                      value={t}
                      checked={typeFilter === t}
                      onChange={() => setType(t)}
                    />
                    {t}
                  </label>
                ))}
              </div>

              <div className="divider" />

              {/* Location */}
              <div className="jl-filter-group">
                <p className="jl-filter-label">Location</p>
                <select
                  className="form-select"
                  value={locFilter || 'All Locations'}
                  onChange={e => setLoc(e.target.value === 'All Locations' ? '' : e.target.value)}
                >
                  {locations.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>

              <div className="divider" />

              {/* Salary */}
              <div className="jl-filter-group">
                <p className="jl-filter-label">Minimum Salary</p>
                {SALARY_RANGES.map((r, i) => (
                  <label key={r.label} className={`jl-filter-option ${salaryIdx === i ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="salary"
                      checked={salaryIdx === i}
                      onChange={() => setSalary(i)}
                    />
                    {r.label}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Job List */}
          <main className="jl-main">
            {/* Sort + Count bar */}
            <div className="jl-bar">
              <p className="jl-count">
                <strong>{filteredJobs.length}</strong> job{filteredJobs.length !== 1 ? 's' : ''} found
              </p>
              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={sortBy}
                onChange={e => setSort(e.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3>No jobs found</h3>
                <p>Try adjusting your search or filters to find what you're looking for.</p>
                {hasFilters && (
                  <button className="btn btn-outline" onClick={clearFilters}>Clear Filters</button>
                )}
              </div>
            ) : (
              <div className="jl-grid stagger-children">
                {filteredJobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

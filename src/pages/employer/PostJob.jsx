// pages/employer/PostJob.jsx
// Form for employers to post a new job listing

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobsContext';
import './PostJob.css';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];

// Skill tag input (inline, reusable)
function SkillInput({ skills, onChange }) {
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim();
    if (v && !skills.includes(v)) onChange([...skills, v]);
    setInput('');
  };

  const remove = (s) => onChange(skills.filter(x => x !== s));

  return (
    <div className="skill-input-wrap">
      <div className="skill-tags">
        {skills.map(s => (
          <span key={s} className="tag tag-removable">
            {s}
            <button type="button" className="tag-remove" onClick={() => remove(s)}>×</button>
          </span>
        ))}
      </div>
      <div className="skill-add-row">
        <input
          type="text"
          className="form-input"
          placeholder="e.g. React, TypeScript…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
        />
        <button type="button" className="btn btn-outline btn-sm" onClick={add}>Add</button>
      </div>
    </div>
  );
}

export default function PostJob() {
  const { user }   = useAuth();
  const { postJob } = useJobs();
  const navigate   = useNavigate();

  const [form, setForm] = useState({
    title:       '',
    location:    '',
    type:        'Full-time',
    salary:      '',
    description: '',
    skills:      [],
  });
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = 'Job title is required.';
    if (!form.location.trim())    e.location    = 'Location is required.';
    if (!form.salary.trim())      e.salary      = 'Salary is required.';
    if (!form.description.trim()) e.description = 'Description is required.';
    if (form.skills.length === 0) e.skills      = 'Add at least one required skill.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    postJob(form, user);
    setLoading(false);
    navigate('/employer/jobs');
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="pj-layout">
          {/* Form */}
          <div className="pj-form-col">
            <div className="pj-header animate-fade-in">
              <h1>Post a New Job</h1>
              <p>Fill in the details below to attract the right candidates</p>
            </div>

            <form onSubmit={handleSubmit} className="pj-form card animate-fade-in">
              <div className="pj-section">
                <h4 className="pj-section-title">Job Details</h4>

                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input
                    type="text"
                    className={`form-input ${errors.title ? 'input-error' : ''}`}
                    placeholder="e.g. Senior React Developer"
                    value={form.title}
                    onChange={e => set('title', e.target.value)}
                  />
                  {errors.title && <span className="field-error">{errors.title}</span>}
                </div>

                <div className="pj-row">
                  <div className="form-group">
                    <label className="form-label">Location *</label>
                    <input
                      type="text"
                      className={`form-input ${errors.location ? 'input-error' : ''}`}
                      placeholder="e.g. Bengaluru or Remote"
                      value={form.location}
                      onChange={e => set('location', e.target.value)}
                    />
                    {errors.location && <span className="field-error">{errors.location}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Job Type *</label>
                    <select
                      className="form-select"
                      value={form.type}
                      onChange={e => set('type', e.target.value)}
                    >
                      {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Salary Range *</label>
                  <input
                    type="text"
                    className={`form-input ${errors.salary ? 'input-error' : ''}`}
                    placeholder="e.g. ₹15-25 LPA  or  $80,000-$100,000"
                    value={form.salary}
                    onChange={e => set('salary', e.target.value)}
                  />
                  {errors.salary && <span className="field-error">{errors.salary}</span>}
                </div>
              </div>

              <div className="divider" />

              <div className="pj-section">
                <h4 className="pj-section-title">Required Skills</h4>
                <SkillInput skills={form.skills} onChange={v => set('skills', v)} />
                {errors.skills && <span className="field-error">{errors.skills}</span>}
              </div>

              <div className="divider" />

              <div className="pj-section">
                <h4 className="pj-section-title">Job Description</h4>
                <div className="form-group">
                  <textarea
                    className={`form-textarea ${errors.description ? 'input-error' : ''}`}
                    rows={8}
                    placeholder="Describe the role, responsibilities, requirements, and what makes this opportunity exciting…"
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                  />
                  {errors.description && <span className="field-error">{errors.description}</span>}
                  <p className="pj-char-count">{form.description.length} characters</p>
                </div>
              </div>

              <div className="pj-form-footer">
                <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading
                    ? <><div className="spinner" /> Publishing…</>
                    : '🚀 Publish Job'
                  }
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview sidebar */}
          <aside className="pj-preview-col animate-fade-in-left">
            <div className="pj-preview card">
              <p className="pj-preview-label">Live Preview</p>
              <div className="pj-preview-header">
                <div className="pj-preview-logo">
                  {(user.company || user.name).charAt(0)}
                </div>
                <div>
                  <p className="pj-preview-company">{user.company || user.name}</p>
                  <h4 className="pj-preview-title">{form.title || 'Job Title'}</h4>
                </div>
              </div>
              <div className="pj-preview-meta">
                {form.location && (
                  <span className="job-info-pill">📍 {form.location}</span>
                )}
                {form.salary && (
                  <span className="job-info-pill">💰 {form.salary}</span>
                )}
                {form.type && (
                  <span className="badge badge-green">{form.type}</span>
                )}
              </div>
              {form.skills.length > 0 && (
                <div className="pj-preview-skills">
                  {form.skills.map(s => <span key={s} className="tag">{s}</span>)}
                </div>
              )}
              {form.description && (
                <p className="pj-preview-desc">
                  {form.description.slice(0, 150)}{form.description.length > 150 ? '…' : ''}
                </p>
              )}
            </div>

            {/* Tips */}
            <div className="pj-tips card">
              <h4 className="pj-tips-title">💡 Posting Tips</h4>
              <ul className="pj-tips-list">
                <li>Use a clear, specific job title</li>
                <li>Include salary range to get 3× more applicants</li>
                <li>List the most important 5–8 skills</li>
                <li>Mention remote/hybrid options if available</li>
                <li>Describe growth opportunities</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

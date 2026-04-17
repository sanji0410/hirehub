// pages/seeker/Profile.jsx
// Profile builder: skills, education, experience, preview

import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

// ——— Tag input component ———
function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) {
      onChange([...tags, val]);
    }
    setInput('');
  };

  const removeTag = (tag) => onChange(tags.filter(t => t !== tag));

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
  };

  return (
    <div className="tag-input-wrapper">
      <div className="tag-input-tags">
        {tags.map(tag => (
          <span key={tag} className="tag tag-removable">
            {tag}
            <button className="tag-remove" onClick={() => removeTag(tag)} type="button">×</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        className="form-input tag-input"
        placeholder="Type a skill and press Enter…"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={addTag}
      />
    </div>
  );
}

// ——— Dynamic list section ———
function DynamicSection({ items, onChange, fields, addLabel }) {
  const addItem  = () => onChange([...items, Object.fromEntries(fields.map(f => [f.name, '']))]);
  const removeItem = (i) => onChange(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, val) => {
    const updated = items.map((item, idx) =>
      idx === i ? { ...item, [field]: val } : item
    );
    onChange(updated);
  };

  return (
    <div className="dynamic-section">
      {items.map((item, i) => (
        <div key={i} className="dynamic-item card">
          <div className="dynamic-item-header">
            <span className="dynamic-item-num">{i + 1}</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm dynamic-remove"
              onClick={() => removeItem(i)}
            >
              Remove
            </button>
          </div>
          <div className="dynamic-fields">
            {fields.map(f => (
              <div key={f.name} className={`form-group ${f.full ? 'full-width' : ''}`}>
                <label className="form-label">{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea
                    className="form-textarea"
                    placeholder={f.placeholder}
                    value={item[f.name] || ''}
                    onChange={e => updateItem(i, f.name, e.target.value)}
                    rows={2}
                  />
                ) : (
                  <input
                    type="text"
                    className="form-input"
                    placeholder={f.placeholder}
                    value={item[f.name] || ''}
                    onChange={e => updateItem(i, f.name, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-outline btn-sm" onClick={addItem}>
        + {addLabel}
      </button>
    </div>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    name:       user.name || '',
    title:      user.title || '',
    location:   user.location || '',
    email:      user.email || '',
    skills:     user.skills || [],
    education:  user.education || [],
    experience: user.experience || [],
  });

  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [tab,     setTab]     = useState('edit'); // 'edit' | 'preview'

  // ── RESUME UPLOAD STATE ──────────────────────────────────────────────────
  // resumeURL  : object URL for the in-memory File (used to open PDF in tab)
  // resumeName : original filename shown in the UI
  // resumeError: validation error message
  // We persist the filename in localStorage so the label survives a reload.
  // NOTE: object URLs are tab-session-only; the user must re-upload after reload.
  const fileInputRef = useRef(null);
  const [resumeURL,   setResumeURL]   = useState(null);
  const [resumeName,  setResumeName]  = useState(
    () => localStorage.getItem(`hh_resume_name_${user.id}`) || null
  );
  const [resumeError, setResumeError] = useState('');

  // Called when user picks a file from the <input type="file">
  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate: must be a PDF
    if (file.type !== 'application/pdf') {
      setResumeError('Only PDF files are accepted. Please choose a .pdf file.');
      // Reset the input so the same file can be re-selected after fixing
      e.target.value = '';
      return;
    }

    // Revoke any previous object URL to avoid memory leaks
    if (resumeURL) URL.revokeObjectURL(resumeURL);

    const url = URL.createObjectURL(file);
    setResumeURL(url);
    setResumeName(file.name);
    setResumeError('');

    // Persist the filename so the label re-appears after a page reload
    localStorage.setItem(`hh_resume_name_${user.id}`, file.name);
    // Also persist the object URL so the apply function can attach it to the application
    localStorage.setItem(`hh_resume_url_${user.id}`, url);
  };

  // Remove the uploaded resume
  const handleResumeRemove = () => {
    if (resumeURL) URL.revokeObjectURL(resumeURL);
    setResumeURL(null);
    setResumeName(null);
    setResumeError('');
    localStorage.removeItem(`hh_resume_name_${user.id}`);
    localStorage.removeItem(`hh_resume_url_${user.id}`);
    // Reset the file input so the same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  // ────────────────────────────────────────────────────────────────────────

  const handleField = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    updateUser(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const eduFields = [
    { name: 'school',  label: 'Institution',  placeholder: 'IIT Bombay' },
    { name: 'degree',  label: 'Degree',        placeholder: 'B.Tech Computer Science' },
    { name: 'year',    label: 'Year',          placeholder: '2022' },
  ];

  const expFields = [
    { name: 'company',  label: 'Company',    placeholder: 'Google' },
    { name: 'role',     label: 'Job Title',  placeholder: 'Software Engineer' },
    { name: 'duration', label: 'Duration',   placeholder: '2021 – Present' },
    { name: 'desc',     label: 'Description', placeholder: 'Key responsibilities...', type: 'textarea', full: true },
  ];

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="profile-header animate-fade-in">
          <div>
            <h1>My Profile</h1>
            <p>Build your professional profile and resume</p>
          </div>
          <div className="profile-header-right">
            <div className="profile-tabs">
              <button
                className={`profile-tab ${tab === 'edit' ? 'active' : ''}`}
                onClick={() => setTab('edit')}
              >✏️ Edit</button>
              <button
                className={`profile-tab ${tab === 'preview' ? 'active' : ''}`}
                onClick={() => setTab('preview')}
              >👁 Preview</button>
            </div>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><div className="spinner" /> Saving…</> : saved ? '✓ Saved!' : 'Save Profile'}
            </button>
          </div>
        </div>

        {tab === 'edit' ? (
          /* ——— Edit Mode ——— */
          <div className="profile-edit stagger-children">
            {/* Basic Info */}
            <section className="profile-section card animate-fade-in">
              <h3 className="profile-section-title">Basic Information</h3>
              <div className="profile-fields-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={form.name}
                    onChange={e => handleField('name', e.target.value)} placeholder="Your full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Title / Headline</label>
                  <input type="text" className="form-input" value={form.title}
                    onChange={e => handleField('title', e.target.value)} placeholder="e.g. Frontend Developer" />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input type="text" className="form-input" value={form.location}
                    onChange={e => handleField('location', e.target.value)} placeholder="City, Country" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={form.email}
                    onChange={e => handleField('email', e.target.value)} placeholder="you@example.com" />
                </div>
              </div>
            </section>

            {/* Skills */}
            <section className="profile-section card animate-fade-in">
              <h3 className="profile-section-title">Skills</h3>
              <p className="profile-section-desc">Add your technical and soft skills (press Enter after each)</p>
              <TagInput tags={form.skills} onChange={v => handleField('skills', v)} />
            </section>

            {/* Education */}
            <section className="profile-section card animate-fade-in">
              <h3 className="profile-section-title">Education</h3>
              <p className="profile-section-desc">Add your educational background</p>
              <DynamicSection
                items={form.education}
                onChange={v => handleField('education', v)}
                fields={eduFields}
                addLabel="Add Education"
              />
            </section>

            {/* Experience */}
            <section className="profile-section card animate-fade-in">
              <h3 className="profile-section-title">Work Experience</h3>
              <p className="profile-section-desc">Add your past work experience</p>
              <DynamicSection
                items={form.experience}
                onChange={v => handleField('experience', v)}
                fields={expFields}
                addLabel="Add Experience"
              />
            </section>

            {/* ── RESUME UPLOAD SECTION ─────────────────────────────────── */}
            <section className="profile-section card animate-fade-in">
              <h3 className="profile-section-title">Resume Upload</h3>
              <p className="profile-section-desc">Upload your resume in PDF format (max 10 MB)</p>

              {/* Error message */}
              {resumeError && (
                <div className="resume-error animate-slide-down">
                  ⚠ {resumeError}
                </div>
              )}

              {resumeName ? (
                /* ── Already uploaded: show file info + actions ── */
                <div className="resume-uploaded animate-fade-in">
                  <div className="resume-file-info">
                    {/* PDF icon */}
                    <div className="resume-pdf-icon" aria-hidden="true">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="9"  y1="13" x2="15" y2="13"/>
                        <line x1="9"  y1="17" x2="15" y2="17"/>
                        <polyline points="9 9 10 9"/>
                      </svg>
                    </div>
                    <div className="resume-file-meta">
                      <p className="resume-file-name">{resumeName}</p>
                      <p className="resume-file-hint">
                        {resumeURL
                          ? 'Ready to view'
                          : 'Re-upload to view — object URLs reset on page reload'}
                      </p>
                    </div>
                  </div>

                  <div className="resume-actions">
                    {/* View button: only active when we have a live object URL */}
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={!resumeURL}
                      onClick={() => window.open(resumeURL, '_blank', 'noopener,noreferrer')}
                    >
                      {/* External-link icon */}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                      View Resume
                    </button>

                    {/* Replace: triggers the hidden file input again */}
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Replace
                    </button>

                    {/* Remove */}
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm resume-remove-btn"
                      onClick={handleResumeRemove}
                    >
                      {/* Trash icon */}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Drop-zone / upload prompt ── */
                <div
                  className="resume-dropzone"
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
                  // Drag-and-drop support
                  onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
                  onDragLeave={e => e.currentTarget.classList.remove('dragover')}
                  onDrop={e => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('dragover');
                    const syntheticEvent = { target: { files: e.dataTransfer.files, value: '' } };
                    handleResumeUpload(syntheticEvent);
                  }}
                >
                  {/* Upload cloud icon */}
                  <svg className="resume-dropzone-icon" width="36" height="36" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="16 16 12 12 8 16"/>
                    <line x1="12" y1="12" x2="12" y2="21"/>
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                  </svg>
                  <p className="resume-dropzone-text">
                    <span className="resume-dropzone-link">Click to upload</span> or drag & drop
                  </p>
                  <p className="resume-dropzone-hint">PDF only · Max 10 MB</p>
                </div>
              )}

              {/* Hidden file input — always rendered so ref works */}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                style={{ display: 'none' }}
                onChange={handleResumeUpload}
              />
            </section>
            {/* ─────────────────────────────────────────────────────────── */}
          </div>
        ) : (
          /* ——— Preview Mode ——— */
          <div className="profile-preview card animate-fade-in">
            {/* Preview Header */}
            <div className="preview-hero">
              <div className="preview-avatar">
                {form.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="preview-name">{form.name || 'Your Name'}</h2>
                <p className="preview-title">{form.title || 'Job Title'}</p>
                <div className="preview-meta">
                  {form.location && <span>📍 {form.location}</span>}
                  {form.email    && <span>✉ {form.email}</span>}
                  {/* Show resume indicator in preview if one has been uploaded */}
                  {resumeName && (
                    <span
                      className="preview-resume-badge"
                      title={resumeName}
                    >
                      📄{' '}
                      {resumeURL ? (
                        <button
                          type="button"
                          className="preview-resume-link"
                          onClick={() => window.open(resumeURL, '_blank', 'noopener,noreferrer')}
                        >
                          View Resume
                        </button>
                      ) : (
                        <span style={{ color: 'var(--gray-400)' }}>Resume on file</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Skills */}
            {form.skills.length > 0 && (
              <div className="preview-section">
                <h4 className="preview-section-title">Skills</h4>
                <div className="preview-skills">
                  {form.skills.map(s => <span key={s} className="tag">{s}</span>)}
                </div>
              </div>
            )}

            {/* Experience */}
            {form.experience.length > 0 && (
              <div className="preview-section">
                <h4 className="preview-section-title">Work Experience</h4>
                {form.experience.map((exp, i) => (
                  <div key={i} className="preview-entry">
                    <div className="preview-entry-header">
                      <div>
                        <p className="preview-entry-title">{exp.role || 'Role'}</p>
                        <p className="preview-entry-sub">{exp.company}</p>
                      </div>
                      <span className="preview-entry-date">{exp.duration}</span>
                    </div>
                    {exp.desc && <p className="preview-entry-desc">{exp.desc}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {form.education.length > 0 && (
              <div className="preview-section">
                <h4 className="preview-section-title">Education</h4>
                {form.education.map((edu, i) => (
                  <div key={i} className="preview-entry">
                    <div className="preview-entry-header">
                      <div>
                        <p className="preview-entry-title">{edu.degree || 'Degree'}</p>
                        <p className="preview-entry-sub">{edu.school}</p>
                      </div>
                      <span className="preview-entry-date">{edu.year}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {form.skills.length === 0 && form.experience.length === 0 && form.education.length === 0 && (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <div className="empty-state-icon">👤</div>
                <h3>Profile is empty</h3>
                <p>Switch to Edit mode to add your information.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ApplyModal = ({ job, isOpen, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [resumeUrl, setResumeUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !job) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedUrl = resumeUrl.trim();
    if (!trimmedUrl) {
      setError('Please provide a valid resume link or portfolio URL');
      return;
    }

    setSubmitting(true);
    try {
      await api.applyForJob(
        {
          jobId: job._id,
          resume: trimmedUrl,
        },
        token
      );

      onSuccess('Application submitted successfully!');
      setResumeUrl('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Apply for Job</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {job.title} • {job.location}
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: '1.5rem' }}>
            <label className="input-label">Resume / Portfolio Link</label>
            <input
              type="url"
              className="form-input"
              placeholder="e.g. https://drive.google.com/your-resume.pdf"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              required
              autoFocus
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
              Paste a link to your resume (Google Drive, Dropbox, LinkedIn, or personal website).
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem' }}
            disabled={submitting}
          >
            {submitting ? 'Submitting Application...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

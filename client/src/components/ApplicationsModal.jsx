import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = [
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interview Scheduled',
  'Interview Completed',
  'Selected',
  'Rejected',
  'Withdrawn',
  'Closed - No Longer Active',
];

export const ApplicationsModal = ({ job, isOpen, onClose }) => {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const loadApplications = useCallback(async () => {
    if (!job || !token) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getJobApplications(job._id, token);
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [job, token]);

  useEffect(() => {
    if (isOpen) {
      loadApplications();
    }
  }, [isOpen, loadApplications]);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      const updated = await api.updateApplicationStatus(appId, newStatus, token);
      setApplications((prev) =>
        prev.map((app) => (app._id === appId ? { ...app, status: updated.status } : app))
      );
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isOpen || !job) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '680px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Job Applicants</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {job.title} • ({applications.length} Total Applications)
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Loading applicants...</span>
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📥</div>
            <h3>No applications submitted yet</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Candidates will appear here once they apply.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {applications.map((app) => {
              const candidate = app.candidateId || {};
              const appliedDate = app.appliedAt
                ? new Date(app.appliedAt).toLocaleDateString()
                : 'Recently';

              return (
                <div
                  key={app._id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        {candidate.name || 'Candidate'}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {candidate.email} • Applied {appliedDate}
                      </p>
                    </div>

                    <a
                      href={app.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      View Resume 📄
                    </a>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid var(--border-color)',
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Status:
                    </span>
                    <select
                      className="form-select"
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.825rem' }}
                      value={app.status}
                      disabled={updatingId === app._id}
                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

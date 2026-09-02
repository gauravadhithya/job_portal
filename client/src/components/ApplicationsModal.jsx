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
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {candidate.profileImage ? (
                        <img
                          src={candidate.profileImage}
                          alt={candidate.name}
                          style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            background: '#0f172a',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '1rem',
                            flexShrink: 0,
                          }}
                        >
                          {candidate.name ? candidate.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                      )}
                      <div>
                        <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', margin: 0 }}>
                          {candidate.name || 'Candidate'}
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                          ✉️ {candidate.email} {candidate.phone ? `• 📞 ${candidate.phone}` : ''} • Applied {appliedDate}
                        </p>
                        {(candidate.degree || candidate.batch || candidate.college) && (
                          <div style={{ marginTop: '0.35rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                            {candidate.degree && (
                              <span className="skill-tag" style={{ background: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd', fontWeight: 600 }}>
                                🎓 {candidate.degree}
                              </span>
                            )}
                            {candidate.batch && (
                              <span className="skill-tag" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fde68a', fontWeight: 600 }}>
                                📅 Batch {candidate.batch}
                              </span>
                            )}
                            {candidate.college && (
                              <span className="skill-tag" style={{ background: '#f1f5f9', color: '#475569' }}>
                                🏛️ {candidate.college}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
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
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.825rem', width: 'auto' }}
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

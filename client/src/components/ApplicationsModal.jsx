import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FiX,
  FiMail,
  FiPhone,
  FiAward,
  FiCalendar,
  FiFileText,
  FiExternalLink,
  FiUser,
  FiInbox,
} from 'react-icons/fi';

export const ApplicationsModal = ({ job, isOpen, onClose }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const { token } = useAuth();

  const fetchApplications = useCallback(async () => {
    if (!job || !token) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getJobApplications(job._id, token);
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch candidate applications');
    } finally {
      setLoading(false);
    }
  }, [job, token]);

  useEffect(() => {
    if (isOpen && job) {
      fetchApplications();
    }
  }, [isOpen, job, fetchApplications]);

  if (!isOpen || !job) return null;

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      await api.updateApplicationStatus(appId, newStatus, token);
      setApplications((prev) =>
        prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      alert(err.message || 'Failed to update application status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Applied':
        return 'status-Applied';
      case 'Under Review':
        return 'status-UnderReview';
      case 'Shortlisted':
        return 'status-Shortlisted';
      case 'Selected':
        return 'status-Selected';
      case 'Rejected':
        return 'status-Rejected';
      default:
        return '';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '780px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Candidate Pipeline</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {job.title} • {applications.length} {applications.length === 1 ? 'Applicant' : 'Applicants'}
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <span style={{ color: 'var(--text-muted)' }}>Loading applicants...</span>
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiInbox size={36} />
            </div>
            <h3>No applications submitted yet</h3>
            <p>Applications will appear here once candidates apply for this position.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                          {candidate.name ? candidate.name.charAt(0).toUpperCase() : <FiUser size={18} />}
                        </div>
                      )}
                      <div>
                        <a
                          href={`/in/${encodeURIComponent((candidate.name || 'candidate').toLowerCase().trim().replace(/\s+/g, '-'))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          title="Open candidate full LinkedIn-style profile in new tab"
                        >
                          {candidate.name || 'Candidate'} <FiExternalLink size={12} style={{ color: '#64748b' }} />
                        </a>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><FiMail size={12} /> {candidate.email}</span>
                          {candidate.phone && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>• <FiPhone size={12} /> {candidate.phone}</span>}
                          <span>• Applied {appliedDate}</span>
                        </p>
                        {(candidate.degree || candidate.batch || candidate.college) && (
                          <div style={{ marginTop: '0.35rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                            {candidate.degree && (
                              <span className="skill-tag" style={{ background: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <FiAward size={12} /> {candidate.degree}
                              </span>
                            )}
                            {candidate.batch && (
                              <span className="skill-tag" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fde68a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <FiCalendar size={12} /> Batch {candidate.batch}
                              </span>
                            )}
                            {candidate.college && (
                              <span className="skill-tag" style={{ background: '#f1f5f9', color: '#475569' }}>
                                {candidate.college}
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
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <FiFileText size={13} /> View Resume <FiExternalLink size={12} />
                    </a>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: '0.65rem',
                      marginTop: '0.25rem',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status:</span>
                      <span className={`status-badge ${getStatusClass(app.status)}`}>
                        {app.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Update Pipeline:
                      </label>
                      <select
                        className="form-select"
                        style={{ width: 'auto', padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                        value={app.status}
                        disabled={updatingId === app._id}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
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

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FiX,
  FiFileText,
  FiMapPin,
  FiExternalLink,
  FiInbox,
} from 'react-icons/fi';
import { BsBuilding } from 'react-icons/bs';

export const MyApplicationsModal = ({ isOpen, onClose }) => {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadApplications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getMyApplications(token);
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load your applications');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isOpen) {
      loadApplications();
    }
  }, [isOpen, loadApplications]);

  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '650px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">My Job Applications</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Track the progress and status of your job applications
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Loading your applications...</span>
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiInbox size={36} />
            </div>
            <h3>No applications submitted yet</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Browse opportunities and click "Apply Now" to start tracking your applications.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {applications.map((app) => {
              const job = app.jobId || {};
              const companyName = job.companyId?.name || job.recruiterId?.name || 'Company';
              const appliedDate = app.appliedAt
                ? new Date(app.appliedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recently';

              const statusClass =
                app.status === 'Shortlisted' || app.status === 'Selected'
                  ? 'status-Shortlisted'
                  : app.status === 'Under Review' || app.status === 'Interview Scheduled'
                  ? 'status-Under-Review'
                  : app.status === 'Rejected' || app.status === 'Withdrawn'
                  ? 'status-Rejected'
                  : 'status-Applied';

              const companySlug = encodeURIComponent(companyName.toLowerCase().trim().replace(/\s+/g, '-'));

              const handleCompanyClick = () => {
                onClose();
                navigate(`/in/${companySlug}`);
              };

              return (
                <div
                  key={app._id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                    padding: '1rem',
                    background: '#f8fafc',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        {job.title || 'Position Title'}
                      </h3>
                      <p
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          marginTop: '0.15rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          cursor: 'pointer',
                          width: 'fit-content',
                        }}
                        onClick={handleCompanyClick}
                        title={`View ${companyName}'s profile and job opportunities`}
                        onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                        onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
                      >
                        <BsBuilding size={12} /> {companyName} • <FiMapPin size={11} /> {job.location || 'Remote'}
                      </p>
                    </div>

                    <span className={`status-badge ${statusClass}`} style={{ flexShrink: 0 }}>
                      {app.status || 'Applied'}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid var(--border-color)',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>Applied on {appliedDate}</span>
                    {app.resume && (
                      <a
                        href={app.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#0f172a', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'underline' }}
                      >
                        View Resume <FiExternalLink size={12} />
                      </a>
                    )}
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

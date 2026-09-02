import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FiClock,
  FiMapPin,
  FiFileText,
  FiTrash2,
  FiArrowRight,
} from 'react-icons/fi';
import { BsBuilding } from 'react-icons/bs';

export const JobCard = ({
  job,
  onApply,
  onViewApplicants,
  onToggleStatus,
  onDeleteJob,
  onRequireAuth,
}) => {
  const { isAuthenticated, isCompany, isAdmin } = useAuth();

  const formattedDeadline = job.deadline
    ? new Date(job.deadline).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No deadline';

  const isClosed = job.status === 'Closed';
  const companyName = job.companyId?.name || job.recruiterId?.name || 'Company';
  const companyInitial = companyName.charAt(0).toUpperCase();

  return (
    <div className="job-card" style={{ opacity: isClosed ? 0.75 : 1 }}>
      <div>
        <div className="job-card-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            {/* Company Profile Icon & Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1rem',
                  flexShrink: 0,
                }}
              >
                {companyInitial}
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <BsBuilding size={13} style={{ color: '#64748b' }} /> {companyName}
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}>
                  <FiMapPin size={11} /> {job.location || 'Remote'}
                </span>
              </div>
            </div>

            <span
              className={`status-badge ${isClosed ? 'status-Rejected' : 'status-Shortlisted'}`}
              style={{ flexShrink: 0 }}
            >
              {job.status || 'Open'}
            </span>
          </div>

          <h3 className="job-title" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            {job.title}
          </h3>

          <div className="job-meta">
            <span className="job-meta-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <FiClock size={12} /> Deadline: {formattedDeadline}
            </span>
          </div>
        </div>

        <p className="job-desc">{job.description}</p>

        {job.skills && job.skills.length > 0 && (
          <div className="skills-list">
            {job.skills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="job-footer">
        <span className="salary-tag">{job.salary || 'Competitive'}</span>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {isAdmin ? (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onDeleteJob(job._id)}
            >
              <FiTrash2 size={13} /> Delete Job
            </button>
          ) : isCompany ? (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onViewApplicants(job)}
              >
                <FiFileText size={13} /> Applicants
              </button>
              <button
                className={`btn btn-sm ${isClosed ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => onToggleStatus(job)}
              >
                {isClosed ? 'Reopen' : 'Close Job'}
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => onDeleteJob(job._id)}
              >
                <FiTrash2 size={13} /> Delete
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              disabled={isClosed}
              onClick={() => {
                if (!isAuthenticated && onRequireAuth) {
                  onRequireAuth();
                } else {
                  onApply(job);
                }
              }}
            >
              {isClosed ? 'Position Closed' : <>Apply Now <FiArrowRight size={13} /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useAuth } from '../context/AuthContext';

export const JobCard = ({
  job,
  onApply,
  onViewApplicants,
  onToggleStatus,
  onDeleteJob,
  onRequireAuth,
}) => {
  const { isAuthenticated, isRecruiter, isAdmin } = useAuth();

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
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                  {companyName}
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {job.location}
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
            <span className="job-meta-item">⏳ Deadline: {formattedDeadline}</span>
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
              onClick={() => onDeleteJob(job)}
            >
              Delete Job
            </button>
          ) : isRecruiter ? (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onViewApplicants(job)}
              >
                Applicants 📋
              </button>
              <button
                className={`btn btn-sm ${isClosed ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => onToggleStatus(job)}
              >
                {isClosed ? 'Reopen' : 'Close Job'}
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => onDeleteJob(job)}
              >
                Delete
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              disabled={isClosed}
              onClick={() => {
                if (!isAuthenticated) {
                  onRequireAuth();
                } else {
                  onApply(job);
                }
              }}
            >
              {isClosed ? 'Position Closed' : 'Apply Now →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

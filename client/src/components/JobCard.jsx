import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiClock,
  FiMapPin,
  FiFileText,
  FiTrash2,
  FiArrowRight,
  FiChevronDown,
  FiChevronUp,
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
  const navigate = useNavigate();
  const { isAuthenticated, isCompany, isAdmin } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

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
  const companySlug = encodeURIComponent(companyName.toLowerCase().trim().replace(/\s+/g, '-'));

  const handleCompanyClick = (e) => {
    e.stopPropagation();
    navigate(`/in/${companySlug}`);
  };

  return (
    <div className="job-card" style={{ opacity: isClosed ? 0.75 : 1 }}>
      <div className="job-card-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          {/* Company Profile Icon & Name */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
            onClick={handleCompanyClick}
            title={`View ${companyName}'s profile and job opportunities`}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                flexShrink: 0,
                transition: 'transform 0.15s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {companyInitial}
            </div>
            <div>
              <h4
                style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
              >
                <BsBuilding size={12} style={{ color: '#64748b' }} /> {companyName}
              </h4>
              <span style={{ fontSize: '0.725rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <FiMapPin size={10} /> {job.location || 'Remote'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="job-meta-item" style={{ fontSize: '0.75rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <FiClock size={11} /> Deadline: {formattedDeadline}
            </span>
            <span
              className={`status-badge ${isClosed ? 'status-Rejected' : 'status-Shortlisted'}`}
              style={{ flexShrink: 0, fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}
            >
              {job.status || 'Open'}
            </span>
          </div>
        </div>

        <h3 className="job-title">
          {job.title}
        </h3>
      </div>

      <div style={{ marginBottom: '0.2rem' }}>
        <p
          className="job-desc"
          style={{
            display: isExpanded ? 'block' : '-webkit-box',
            WebkitLineClamp: isExpanded ? 'unset' : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: '0.25rem',
            whiteSpace: isExpanded ? 'pre-line' : 'normal',
          }}
        >
          {job.description}
        </p>
        {job.description && job.description.length > 90 && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: '#2563eb',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              marginBottom: '0.2rem',
            }}
          >
            {isExpanded ? (
              <>Show Less <FiChevronUp size={12} /></>
            ) : (
              <>Show More <FiChevronDown size={12} /></>
            )}
          </button>
        )}
      </div>

      {job.skills && job.skills.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em', flexShrink: 0 }}>
            Required Skills:
          </span>
          <div className="skills-list">
            {job.skills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

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

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FiUser,
  FiFileText,
  FiPlus,
  FiShield,
  FiShare2,
  FiCheck,
  FiAward,
  FiCalendar,
  FiMail,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiExternalLink,
} from 'react-icons/fi';
import { BsBuilding } from 'react-icons/bs';

export const UserSidebar = ({
  onOpenProfile,
  onOpenMyApplications,
  onOpenPostJob,
  onOpenAdminDashboard,
}) => {
  const { user, isCompany, isJobSeeker, isAdmin } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const handleCopyProfileLink = (e) => {
    e.stopPropagation();
    const userSlug = encodeURIComponent(user.name.toLowerCase().trim().replace(/\s+/g, '-'));
    const url = `${window.location.origin}/in/${userSlug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="user-sidebar-wrapper">
      {/* Profile Summary Card */}
      <div className="sidebar-profile-card">
        {/* Cover Header Accent */}
        <div className="sidebar-cover-header" />

        {/* Avatar & Basic Identity */}
        <div className="sidebar-profile-content">
          <div
            className="sidebar-avatar-container"
            onClick={onOpenProfile}
            title="Click to view full profile"
          >
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="sidebar-avatar-img"
              />
            ) : (
              <div className="sidebar-avatar-fallback">
                {user.name ? user.name.charAt(0).toUpperCase() : <FiUser size={30} />}
              </div>
            )}
          </div>

          <h3
            className="sidebar-user-name"
            onClick={onOpenProfile}
            title="View public profile"
          >
            {user.name}
          </h3>

          <div style={{ marginBottom: '0.65rem' }}>
            <span
              className="role-pill"
              style={{
                fontSize: '0.75rem',
                padding: '0.2rem 0.65rem',
                background: isAdmin ? '#fef3c7' : isCompany ? '#e0f2fe' : '#e2e8f0',
                color: isAdmin ? '#92400e' : isCompany ? '#0369a1' : '#334155',
              }}
            >
              {user.role || 'Member'}
            </span>
          </div>

          {/* Role specific quick details */}
          {isJobSeeker && (
            <div className="sidebar-user-details">
              {user.degree && (
                <div className="sidebar-detail-item">
                  <FiAward size={13} className="sidebar-detail-icon" />
                  <span>{user.degree} {user.batch ? `('${user.batch.slice(-2)})` : ''}</span>
                </div>
              )}
              {user.college && (
                <div className="sidebar-detail-item">
                  <span style={{ fontSize: '0.8rem' }}>🏛️</span>
                  <span>{user.college}</span>
                </div>
              )}
              {user.phone && (
                <div className="sidebar-detail-item">
                  <FiPhone size={13} className="sidebar-detail-icon" />
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="sidebar-detail-item">
                <FiMail size={13} className="sidebar-detail-icon" />
                <span className="sidebar-email-text">{user.email}</span>
              </div>
            </div>
          )}

          {isCompany && (
            <div className="sidebar-user-details">
              {user.industry && (
                <div className="sidebar-detail-item">
                  <BsBuilding size={13} className="sidebar-detail-icon" />
                  <span>{user.industry}</span>
                </div>
              )}
              {user.location && (
                <div className="sidebar-detail-item">
                  <FiMapPin size={13} className="sidebar-detail-icon" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.website && (
                <div className="sidebar-detail-item">
                  <FiGlobe size={13} className="sidebar-detail-icon" />
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'underline', color: '#0f172a' }}
                  >
                    {user.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div className="sidebar-detail-item">
                <FiMail size={13} className="sidebar-detail-icon" />
                <span className="sidebar-email-text">{user.email}</span>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="sidebar-user-details">
              <div className="sidebar-detail-item">
                <FiShield size={13} className="sidebar-detail-icon" />
                <span>Governance & Oversight</span>
              </div>
              <div className="sidebar-detail-item">
                <FiMail size={13} className="sidebar-detail-icon" />
                <span className="sidebar-email-text">{user.email}</span>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Actions & Navigation */}
        <div className="sidebar-actions-section">
          {isJobSeeker && (
            <button
              className="btn btn-primary sidebar-action-btn"
              onClick={onOpenMyApplications}
            >
              <FiFileText size={15} /> My Applications
            </button>
          )}

          {isCompany && (
            <button
              className="btn btn-primary sidebar-action-btn"
              onClick={onOpenPostJob}
            >
              <FiPlus size={15} /> Post a New Job
            </button>
          )}

          {isAdmin && (
            <button
              className="btn btn-primary sidebar-action-btn"
              onClick={onOpenAdminDashboard}
            >
              <FiShield size={15} /> Admin Center
            </button>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onOpenProfile}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '0.45rem 0.4rem' }}
            >
              <FiUser size={12} /> Profile
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleCopyProfileLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
                padding: '0.45rem 0.4rem',
                background: copied ? '#dcfce7' : '#ffffff',
                color: copied ? '#166534' : 'inherit',
                borderColor: copied ? '#86efac' : 'var(--border-color)',
              }}
              title="Copy public profile URL"
            >
              {copied ? <><FiCheck size={12} /> Copied</> : <><FiShare2 size={12} /> Share</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

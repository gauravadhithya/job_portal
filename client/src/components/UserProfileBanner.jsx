import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FiEdit2,
  FiAward,
  FiCalendar,
  FiMail,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiUser,
  FiFileText,
  FiPlus,
  FiShield,
  FiShare2,
  FiCheck,
} from 'react-icons/fi';
import { BsBuilding } from 'react-icons/bs';

export const UserProfileBanner = ({
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
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* LinkedIn-style Cover Accent Banner */}
      <div
        style={{
          height: '70px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          position: 'relative',
        }}
      />

      {/* Profile Details Bar */}
      <div
        style={{
          padding: '0 1.5rem 1.25rem',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          position: 'relative',
        }}
      >
        {/* Left: Avatar + Info */}
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Avatar with Change Profile & Share Buttons underneath */}
          <div style={{ marginTop: '-40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
            <div
              style={{
                position: 'relative',
                cursor: 'pointer',
              }}
              onClick={onOpenProfile}
              title="Click to change avatar"
            >
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    background: '#ffffff',
                    border: '4px solid #ffffff',
                    boxShadow: 'var(--shadow-md)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    background: '#0f172a',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 700,
                    border: '4px solid #ffffff',
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : <FiUser size={36} />}
                </div>
              )}
            </div>

            {/* Profile Action Buttons under the avatar */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={onOpenProfile}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  background: '#f8fafc',
                }}
              >
                <FiEdit2 size={11} /> Change Profile
              </button>

              <button
                className="btn btn-secondary btn-sm"
                onClick={handleCopyProfileLink}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  background: copied ? '#dcfce7' : '#f8fafc',
                  color: copied ? '#166534' : 'inherit',
                  borderColor: copied ? '#86efac' : 'var(--border-color)',
                  transition: 'all 0.15s ease',
                }}
                title="Copy your permanent profile URL (/in/username)"
              >
                {copied ? <><FiCheck size={11} /> Copied!</> : <><FiShare2 size={11} /> Share Link</>}
              </button>
            </div>
          </div>

          {/* User Headline & Bio */}
          <div style={{ paddingTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {user.name}
              </h2>
              <span
                className="role-pill"
                style={{
                  background: isAdmin ? '#fef3c7' : isCompany ? '#e0f2fe' : '#e2e8f0',
                  color: isAdmin ? '#92400e' : isCompany ? '#0369a1' : '#334155',
                }}
              >
                {user.role}
              </span>
            </div>

            {/* Candidate Sub-details */}
            {isJobSeeker && (
              <div style={{ marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {user.degree && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, color: '#0f172a' }}>
                      <FiAward size={13} /> {user.degree}
                    </span>
                  )}
                  {user.batch && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      • <FiCalendar size={13} /> Batch {user.batch}
                    </span>
                  )}
                  {user.college && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      • {user.college}
                    </span>
                  )}
                </p>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FiMail size={12} /> {user.email}
                  </span>
                  {user.phone && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      • <FiPhone size={12} /> {user.phone}
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Company Sub-details */}
            {isCompany && (
              <div style={{ marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {user.industry && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, color: '#0f172a' }}>
                      <BsBuilding size={13} /> {user.industry}
                    </span>
                  )}
                  {user.location && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      • <FiMapPin size={13} /> {user.location}
                    </span>
                  )}
                  {user.website && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      • <FiGlobe size={13} /> <a href={user.website} target="_blank" rel="noopener noreferrer" style={{ color: '#0f172a', textDecoration: 'underline' }}>{user.website.replace(/^https?:\/\//, '')}</a>
                    </span>
                  )}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  <FiMail style={{ verticalAlign: 'middle' }} size={12} /> {user.email}
                </p>
              </div>
            )}

            {/* Admin Sub-details */}
            {isAdmin && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0' }}>
                Master administrator oversight • Full portal governance & authorization privileges
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Role Action Buttons inside the Profile Card */}
        <div style={{ paddingTop: '0.5rem', display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {isJobSeeker && (
            <button
              className="btn btn-primary btn-sm"
              onClick={onOpenMyApplications}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem' }}
            >
              <FiFileText size={15} /> My Applications
            </button>
          )}

          {isCompany && (
            <button
              className="btn btn-primary btn-sm"
              onClick={onOpenPostJob}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem' }}
            >
              <FiPlus size={15} /> Post a Job
            </button>
          )}

          {isAdmin && (
            <button
              className="btn btn-primary btn-sm"
              onClick={onOpenAdminDashboard}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem' }}
            >
              <FiShield size={15} /> Admin Center
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

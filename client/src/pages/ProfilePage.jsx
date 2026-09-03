import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  FiArrowLeft,
  FiUser,
  FiAward,
  FiCalendar,
  FiPhone,
  FiMail,
  FiMapPin,
  FiGlobe,
  FiCheck,
  FiCamera,
  FiShare2,
  FiEdit2,
  FiBriefcase,
} from 'react-icons/fi';
import { BsBuilding } from 'react-icons/bs';
import { PhotoViewerModal } from '../components/PhotoViewerModal';
import { ProfileModal } from '../components/ProfileModal';
import { JobCard } from '../components/JobCard';
import { ApplyModal } from '../components/ApplyModal';

export const ProfilePage = ({ onBack }) => {
  const { username: urlUsername } = useParams();
  const { user, updateUser, isAuthenticated } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [applyingJob, setApplyingJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Determine if active user is owner of this profile
  const isOwner = Boolean(
    isAuthenticated &&
    user &&
    (!urlUsername ||
      urlUsername.toLowerCase().trim() === user.name.toLowerCase().trim().replace(/\s+/g, '-') ||
      urlUsername.toLowerCase().trim() === user.name.toLowerCase().trim() ||
      user._id === profileData?._id)
  );

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');

      let loadedProfile = null;

      // If viewing own profile or no username param
      if (!urlUsername && user) {
        loadedProfile = user;
        setProfileData(user);
      } else if (urlUsername) {
        // If it's the logged-in user
        if (
          user &&
          (urlUsername.toLowerCase().trim() === user.name.toLowerCase().trim().replace(/\s+/g, '-') ||
            urlUsername.toLowerCase().trim() === user.name.toLowerCase().trim())
        ) {
          loadedProfile = user;
          setProfileData(user);
        } else {
          // Otherwise fetch from public profile API
          try {
            const publicUser = await api.getPublicProfile(urlUsername);
            loadedProfile = publicUser;
            setProfileData(publicUser);
          } catch (err) {
            setError(err.message || 'User profile not found.');
          }
        }
      }

      // If loaded profile is a Company or Recruiter, load their jobs
      if (loadedProfile && (loadedProfile.role === 'Company' || loadedProfile.role === 'Recruiter')) {
        try {
          const allJobs = await api.getJobs();
          const targetName = (loadedProfile.name || '').toLowerCase().trim();
          const targetId = loadedProfile._id?.toString();
          const filtered = (Array.isArray(allJobs) ? allJobs : []).filter((j) => {
            const recruiterId = (j.recruiterId?._id || j.recruiterId)?.toString();
            const companyId = (j.companyId?._id || j.companyId)?.toString();
            const recruiterName = (j.recruiterId?.name || '').toLowerCase().trim();
            const companyName = (j.companyId?.name || j.companyName || '').toLowerCase().trim();
            return (
              (targetId && (recruiterId === targetId || companyId === targetId)) ||
              (targetName && (recruiterName === targetName || companyName === targetName))
            );
          });
          setCompanyJobs(filtered);
        } catch (err) {
          console.error('Failed to load company jobs:', err);
        }
      }

      setLoading(false);
    };

    fetchProfile();
  }, [urlUsername, user]);

  const activeProfile = isOwner ? user : profileData;

  const handlePhotoModalSave = async (newImage) => {
    try {
      await updateUser({ profileImage: newImage });
    } catch (err) {
      console.error('Failed to update photo:', err);
    }
  };

  const handleCopyProfileLink = () => {
    const userSlug = encodeURIComponent((activeProfile?.name || user?.name || 'user').toLowerCase().trim().replace(/\s+/g, '-'));
    const url = `${window.location.origin}/in/${userSlug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading user profile...</p>
      </div>
    );
  }

  if (!activeProfile && error) {
    return (
      <div className="container" style={{ padding: '3rem 1rem', maxWidth: '600px', textAlign: 'center' }}>
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
        <button className="btn btn-primary" onClick={onBack}>
          <FiArrowLeft size={16} /> Return to Home
        </button>
      </div>
    );
  }

  const isCompanyProfile = activeProfile?.role === 'Company' || activeProfile?.role === 'Recruiter';
  const isJobSeekerProfile = activeProfile?.role === 'Job Seeker' || !activeProfile?.role;

  return (
    <div className="container" style={{ padding: '2rem 1rem 4rem', maxWidth: '820px' }}>
      {/* Top Header Navigation */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={onBack}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
        >
          <FiArrowLeft size={16} /> Back to Job Opportunities
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isOwner && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowEditProfileModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem' }}
            >
              <FiEdit2 size={13} /> Edit Profile
            </button>
          )}

          <button
            className="btn btn-secondary btn-sm"
            onClick={handleCopyProfileLink}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem' }}
            title="Copy shareable public profile URL"
          >
            {copiedLink ? <><FiCheck size={13} style={{ color: '#16a34a' }} /> Link Copied!</> : <><FiShare2 size={13} /> Share Profile</>}
          </button>
        </div>
      </div>

      {/* Main Profile Card (LinkedIn Style Full Page Header) */}
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
        {/* Cover Header */}
        <div
          style={{
            height: '120px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
            position: 'relative',
          }}
        />

        {/* Profile Details Area */}
        <div style={{ padding: '0 2rem 1.5rem', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '-50px', marginBottom: '1.25rem' }}>
            {/* Clickable Profile Avatar that triggers Zoom-in Modal */}
            <div
              style={{ position: 'relative', cursor: 'pointer' }}
              onClick={() => setShowPhotoModal(true)}
              title="Click to view / manage photo"
            >
              {activeProfile.profileImage ? (
                <img
                  src={activeProfile.profileImage}
                  alt={activeProfile.name}
                  style={{
                    width: '104px',
                    height: '104px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    background: '#ffffff',
                    border: '4px solid #ffffff',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
              ) : (
                <div
                  style={{
                    width: '104px',
                    height: '104px',
                    borderRadius: '50%',
                    background: '#0f172a',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    border: '4px solid #ffffff',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {activeProfile.name ? activeProfile.name.charAt(0).toUpperCase() : <FiUser size={44} />}
                </div>
              )}

              {/* Camera Badge indicator */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  background: '#0f172a',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <FiCamera size={13} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span
                className="role-pill"
                style={{
                  fontSize: '0.85rem',
                  padding: '0.35rem 0.85rem',
                  background: activeProfile.role === 'Admin' ? '#fef3c7' : isCompanyProfile ? '#e0f2fe' : '#e2e8f0',
                  color: activeProfile.role === 'Admin' ? '#92400e' : isCompanyProfile ? '#0369a1' : '#334155',
                }}
              >
                {activeProfile.role || 'Job Seeker'}
              </span>
            </div>
          </div>

          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem' }}>
              {activeProfile.name}
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><FiMail size={13} /> {activeProfile.email}</span>
              {activeProfile.degree && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>• <FiAward size={13} /> {activeProfile.degree}</span>}
              {activeProfile.batch && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>• <FiCalendar size={13} /> Batch {activeProfile.batch}</span>}
              {activeProfile.college && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>• {activeProfile.college}</span>}
            </p>
          </div>
        </div>
      </div>

      {/* CLEAN READ-ONLY INFORMATION OVERVIEW (For both Owners & Visitors) */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {isJobSeekerProfile ? 'Candidate Profile Details' : 'Company Overview'}
          </h2>
        </div>

        {/* Display Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
          {isJobSeekerProfile && (
            <>
              <div style={publicItemCardStyle}>
                <span style={publicItemLabelStyle}><FiAward size={13} /> Qualification / Degree</span>
                <strong style={publicItemValStyle}>{activeProfile.degree || 'Not specified'}</strong>
              </div>

              <div style={publicItemCardStyle}>
                <span style={publicItemLabelStyle}><FiCalendar size={13} /> Batch / Passing Year</span>
                <strong style={publicItemValStyle}>{activeProfile.batch || 'Not specified'}</strong>
              </div>

              <div style={publicItemCardStyle}>
                <span style={publicItemLabelStyle}>🏛️ College / University</span>
                <strong style={publicItemValStyle}>{activeProfile.college || 'Not specified'}</strong>
              </div>

              <div style={publicItemCardStyle}>
                <span style={publicItemLabelStyle}><FiPhone size={13} /> Phone Contact</span>
                <strong style={publicItemValStyle}>{activeProfile.phone || 'Available upon request'}</strong>
              </div>
            </>
          )}

          {isCompanyProfile && (
            <>
              <div style={publicItemCardStyle}>
                <span style={publicItemLabelStyle}><BsBuilding size={13} /> Industry / Domain</span>
                <strong style={publicItemValStyle}>{activeProfile.industry || 'Not specified'}</strong>
              </div>

              <div style={publicItemCardStyle}>
                <span style={publicItemLabelStyle}><FiMapPin size={13} /> Headquarters / Location</span>
                <strong style={publicItemValStyle}>{activeProfile.location || 'Remote / Global'}</strong>
              </div>

              {activeProfile.website && (
                <div style={publicItemCardStyle}>
                  <span style={publicItemLabelStyle}><FiGlobe size={13} /> Website</span>
                  <a
                    href={activeProfile.website.startsWith('http') ? activeProfile.website : `https://${activeProfile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#0f172a',
                      fontWeight: 700,
                      textDecoration: 'underline',
                      fontSize: '1rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      wordBreak: 'break-all',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    }}
                    title={activeProfile.website}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activeProfile.website.replace(/^https?:\/\/(www\.)?/, '')}
                    </span>
                  </a>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <a
            href={`mailto:${activeProfile.email}`}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
          >
            <FiMail size={15} /> Contact via Email
          </a>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCopyProfileLink}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FiShare2 size={15} /> {copiedLink ? 'Link Copied!' : 'Share Profile'}
          </button>
        </div>
      </div>

      {/* COMPANY JOB OPPORTUNITIES SECTION */}
      {isCompanyProfile && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FiBriefcase size={20} /> Open Positions & Opportunities ({companyJobs.length})
            </h2>
          </div>

          {companyJobs.length === 0 ? (
            <div className="empty-state" style={{ padding: '2.5rem 1.5rem', background: '#ffffff', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
              <FiBriefcase size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
              <h3 style={{ fontSize: '1.05rem', color: '#0f172a' }}>No active job listings currently</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {activeProfile.name} has not posted any open positions at the moment. Check back soon!
              </p>
            </div>
          ) : (
            <div className="jobs-grid">
              {companyJobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  onApply={(j) => setApplyingJob(j)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Apply Modal */}
      <ApplyModal
        job={applyingJob}
        isOpen={!!applyingJob}
        onClose={() => setApplyingJob(null)}
      />

      {/* Zoomed-in Photo Viewer & Manager Modal */}
      <PhotoViewerModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        currentImage={activeProfile.profileImage}
        userName={activeProfile.name}
        onSavePhoto={isOwner ? handlePhotoModalSave : () => {}}
      />

      {/* Edit Profile Modal (Only for Owner) */}
      {isOwner && (
        <ProfileModal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
        />
      )}
    </div>
  );
};

const publicItemCardStyle = {
  background: '#f8fafc',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)',
  padding: '1.15rem 1.25rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  minWidth: 0,
  overflow: 'hidden',
};

const publicItemLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  fontSize: '0.75rem',
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: '0.4rem',
  fontWeight: 600,
};

const publicItemValStyle = {
  fontSize: '1.05rem',
  fontWeight: 700,
  color: '#0f172a',
  wordBreak: 'break-word',
};

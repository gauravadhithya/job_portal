import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  FiArrowLeft,
  FiUser,
  FiUpload,
  FiTrash2,
  FiAward,
  FiCalendar,
  FiPhone,
  FiMail,
  FiMapPin,
  FiGlobe,
  FiCheck,
  FiCamera,
  FiShare2,
  FiCopy,
} from 'react-icons/fi';
import { BsBuilding } from 'react-icons/bs';
import { PhotoViewerModal } from '../components/PhotoViewerModal';

export const ProfilePage = ({ onBack }) => {
  const { username: urlUsername } = useParams();
  const { user, updateUser, isAuthenticated } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const directFileInputRef = useRef(null);

  // Form state for owner editing
  const [formData, setFormData] = useState({
    name: '',
    profileImage: '',
    degree: '',
    batch: '',
    college: '',
    phone: '',
    companyName: '',
    industry: '',
    website: '',
    location: '',
  });

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

      // If viewing own profile or no username param
      if (!urlUsername && user) {
        setProfileData(user);
        setFormData({
          name: user.name || '',
          profileImage: user.profileImage || '',
          degree: user.degree || '',
          batch: user.batch || '',
          college: user.college || '',
          phone: user.phone || '',
          companyName: user.companyName || user.name || '',
          industry: user.industry || '',
          website: user.website || '',
          location: user.location || '',
        });
        setLoading(false);
        return;
      }

      // If URL has username, load public profile
      if (urlUsername) {
        // If it's the logged-in user
        if (
          user &&
          (urlUsername.toLowerCase().trim() === user.name.toLowerCase().trim().replace(/\s+/g, '-') ||
            urlUsername.toLowerCase().trim() === user.name.toLowerCase().trim())
        ) {
          setProfileData(user);
          setFormData({
            name: user.name || '',
            profileImage: user.profileImage || '',
            degree: user.degree || '',
            batch: user.batch || '',
            college: user.college || '',
            phone: user.phone || '',
            companyName: user.companyName || user.name || '',
            industry: user.industry || '',
            website: user.website || '',
            location: user.location || '',
          });
          setLoading(false);
          return;
        }

        // Otherwise fetch from public profile API
        try {
          const publicUser = await api.getPublicProfile(urlUsername);
          setProfileData(publicUser);
          setFormData({
            name: publicUser.name || '',
            profileImage: publicUser.profileImage || '',
            degree: publicUser.degree || '',
            batch: publicUser.batch || '',
            college: publicUser.college || '',
            phone: publicUser.phone || '',
            companyName: publicUser.companyName || publicUser.name || '',
            industry: publicUser.industry || '',
            website: publicUser.website || '',
            location: publicUser.location || '',
          });
        } catch (err) {
          setError(err.message || 'User profile not found.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [urlUsername, user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle local file upload
  const handleDirectFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, profileImage: reader.result }));
      setSuccess('Photo selected! Click "Save Profile Changes" to update.');
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoModalSave = (newImage) => {
    setFormData((prev) => ({
      ...prev,
      profileImage: newImage,
    }));
  };

  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await updateUser({
        name: formData.name,
        profileImage: formData.profileImage,
        degree: formData.degree,
        batch: formData.batch,
        college: formData.college,
        phone: formData.phone,
        companyName: formData.companyName,
        industry: formData.industry,
        website: formData.website,
        location: formData.location,
      });

      setSuccess('Profile updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading user profile...</p>
      </div>
    );
  }

  const activeProfile = isOwner ? { ...profileData, ...formData } : profileData;

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
  const isJobSeekerProfile = activeProfile?.role === 'Job Seeker';

  return (
    <div className="container" style={{ padding: '2rem 1rem 4rem', maxWidth: '820px' }}>
      {/* Back button header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={onBack}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
        >
          <FiArrowLeft size={16} /> Back to Job Opportunities
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleCopyProfileLink}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
            title="Copy shareable profile URL"
          >
            {copiedLink ? <><FiCheck size={13} style={{ color: '#16a34a' }} /> Link Copied!</> : <><FiShare2 size={13} /> Share Profile Link</>}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>{success}</div>}

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
            height: '110px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
            position: 'relative',
          }}
        />

        {/* Profile Details Area */}
        <div style={{ padding: '0 2rem 1.5rem', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '-50px', marginBottom: '1rem' }}>
            {/* Clickable Profile Avatar that triggers Zoom-in Modal */}
            <div
              style={{ position: 'relative', cursor: 'pointer' }}
              onClick={() => setShowPhotoModal(true)}
              title="Click to zoom in on photo"
            >
              {activeProfile.profileImage ? (
                <img
                  src={activeProfile.profileImage}
                  alt={activeProfile.name}
                  style={{
                    width: '100px',
                    height: '100px',
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
                    width: '100px',
                    height: '100px',
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                className="role-pill"
                style={{
                  fontSize: '0.85rem',
                  padding: '0.35rem 0.85rem',
                  background: activeProfile.role === 'Admin' ? '#fef3c7' : isCompanyProfile ? '#e0f2fe' : '#e2e8f0',
                  color: activeProfile.role === 'Admin' ? '#92400e' : isCompanyProfile ? '#0369a1' : '#334155',
                }}
              >
                {activeProfile.role}
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

      {/* VIEW FOR RECRUITERS / VISITORS (Read-Only Public Profile) */}
      {!isOwner && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
            Professional Profile Overview
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {isJobSeekerProfile && (
              <>
                <div style={publicItemCardStyle}>
                  <span style={publicItemLabelStyle}><FiAward size={12} /> Qualification / Degree</span>
                  <strong style={publicItemValStyle}>{activeProfile.degree || 'Not specified'}</strong>
                </div>

                <div style={publicItemCardStyle}>
                  <span style={publicItemLabelStyle}><FiCalendar size={12} /> Batch / Passing Year</span>
                  <strong style={publicItemValStyle}>{activeProfile.batch || 'Not specified'}</strong>
                </div>

                <div style={publicItemCardStyle}>
                  <span style={publicItemLabelStyle}>🏛️ College / University</span>
                  <strong style={publicItemValStyle}>{activeProfile.college || 'Not specified'}</strong>
                </div>

                <div style={publicItemCardStyle}>
                  <span style={publicItemLabelStyle}><FiPhone size={12} /> Phone Contact</span>
                  <strong style={publicItemValStyle}>{activeProfile.phone || 'Available upon request'}</strong>
                </div>
              </>
            )}

            {isCompanyProfile && (
              <>
                <div style={publicItemCardStyle}>
                  <span style={publicItemLabelStyle}><BsBuilding size={12} /> Industry</span>
                  <strong style={publicItemValStyle}>{activeProfile.industry || 'Not specified'}</strong>
                </div>

                <div style={publicItemCardStyle}>
                  <span style={publicItemLabelStyle}><FiMapPin size={12} /> Headquarters</span>
                  <strong style={publicItemValStyle}>{activeProfile.location || 'Remote / Global'}</strong>
                </div>

                {activeProfile.website && (
                  <div style={publicItemCardStyle}>
                    <span style={publicItemLabelStyle}><FiGlobe size={12} /> Website</span>
                    <a href={activeProfile.website} target="_blank" rel="noopener noreferrer" style={{ color: '#0f172a', fontWeight: 700, textDecoration: 'underline' }}>
                      {activeProfile.website}
                    </a>
                  </div>
                )}
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a
              href={`mailto:${activeProfile.email}`}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
            >
              <FiMail size={15} /> Contact via Email
            </a>
          </div>
        </div>
      )}

      {/* EDIT PROFILE FORM FOR PROFILE OWNER */}
      {isOwner && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
            Personal & Account Information
          </h2>

          {/* Profile Photo Controls Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem',
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{ cursor: 'pointer' }}
                onClick={() => setShowPhotoModal(true)}
                title="Click to zoom in"
              >
                {formData.profileImage ? (
                  <img
                    src={formData.profileImage}
                    alt={activeProfile.name}
                    style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0f172a' }}
                  />
                ) : (
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem' }}>
                    {activeProfile.name ? activeProfile.name.charAt(0).toUpperCase() : <FiUser size={24} />}
                  </div>
                )}
              </div>

              <div>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'block' }}>Profile Photo</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Click image to zoom in, upload from local folder, or delete
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                ref={directFileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleDirectFileUpload}
              />

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => directFileInputRef.current?.click()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <FiUpload size={13} /> Upload Photo
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowPhotoModal(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <FiCamera size={13} /> View / Manage
              </button>

              {formData.profileImage && (
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => setFormData({ ...formData, profileImage: '' })}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <FiTrash2 size={13} /> Remove
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* User Full Name */}
            <div className="input-group" style={{ marginBottom: '1.25rem' }}>
              <label className="input-label">
                {isCompanyProfile ? 'Company / Recruiter Name *' : 'Full Name *'}
              </label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Job Seeker Candidate Fields */}
            {isJobSeekerProfile && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div className="input-group">
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FiAward size={13} /> Degree / Qualification
                    </label>
                    <input
                      type="text"
                      name="degree"
                      className="form-input"
                      placeholder="e.g. B.Tech CSE, MCA, MBA"
                      value={formData.degree}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FiCalendar size={13} /> Batch / Passing Year
                    </label>
                    <input
                      type="text"
                      name="batch"
                      className="form-input"
                      placeholder="e.g. 2025, 2026"
                      value={formData.batch}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="input-group">
                    <label className="input-label">College / University</label>
                    <input
                      type="text"
                      name="college"
                      className="form-input"
                      placeholder="e.g. Anna University"
                      value={formData.college}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FiPhone size={13} /> Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      placeholder="e.g. +91 9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Company Recruiter Fields */}
            {isCompanyProfile && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div className="input-group">
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <BsBuilding size={13} /> Industry / Domain
                    </label>
                    <input
                      type="text"
                      name="industry"
                      className="form-input"
                      placeholder="e.g. Software, FinTech"
                      value={formData.industry}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FiMapPin size={13} /> Location / Headquarters
                    </label>
                    <input
                      type="text"
                      name="location"
                      className="form-input"
                      placeholder="e.g. Bangalore, Remote"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FiGlobe size={13} /> Company Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    className="form-input"
                    placeholder="https://company.com"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                disabled={submitting}
              >
                <FiCheck size={16} /> {submitting ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '0.75rem 1.25rem' }}
                onClick={onBack}
              >
                Cancel & Return to Jobs
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Zoomed-in Photo Viewer & Manager Modal */}
      <PhotoViewerModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        currentImage={isOwner ? formData.profileImage : activeProfile.profileImage}
        userName={activeProfile.name}
        onSavePhoto={isOwner ? handlePhotoModalSave : () => {}}
      />
    </div>
  );
};

const publicItemCardStyle = {
  background: '#f8fafc',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)',
  padding: '1rem',
};

const publicItemLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.3rem',
  fontSize: '0.75rem',
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: '0.35rem',
};

const publicItemValStyle = {
  fontSize: '1rem',
  fontWeight: 700,
  color: '#0f172a',
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FiX,
  FiUser,
  FiCamera,
  FiAward,
  FiCalendar,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiCheck,
} from 'react-icons/fi';
import { BsBuilding } from 'react-icons/bs';

// 2D Vector Animal SVG Avatars
const makeSvg = (bg, inner) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <rect width="100" height="100" rx="50" fill="${bg}"/>
      ${inner}
    </svg>`
  )}`;

export const VECTOR_ANIMAL_AVATARS = [
  {
    name: 'Fox',
    url: makeSvg(
      '#ffedd5',
      `<!-- Fox Ears -->
       <polygon points="22,46 32,18 46,38" fill="#ea580c"/>
       <polygon points="28,42 34,24 42,38" fill="#fed7aa"/>
       <polygon points="78,46 68,18 54,38" fill="#ea580c"/>
       <polygon points="72,42 66,24 58,38" fill="#fed7aa"/>
       <!-- Head -->
       <polygon points="18,48 82,48 50,84" fill="#f97316"/>
       <!-- White Cheeks -->
       <polygon points="18,48 50,84 36,66 22,54" fill="#ffffff"/>
       <polygon points="82,48 50,84 64,66 78,54" fill="#ffffff"/>
       <!-- Eyes -->
       <ellipse cx="36" cy="50" rx="3.5" ry="4.5" fill="#0f172a"/>
       <ellipse cx="64" cy="50" rx="3.5" ry="4.5" fill="#0f172a"/>
       <circle cx="38" cy="48.5" r="1.2" fill="#ffffff"/>
       <circle cx="66" cy="48.5" r="1.2" fill="#ffffff"/>
       <!-- Nose -->
       <circle cx="50" cy="80" r="4.5" fill="#0f172a"/>`
    ),
  },
  {
    name: 'Panda',
    url: makeSvg(
      '#e0f2fe',
      `<!-- Panda Ears -->
       <circle cx="26" cy="28" r="14" fill="#1e293b"/>
       <circle cx="74" cy="28" r="14" fill="#1e293b"/>
       <!-- Head -->
       <circle cx="50" cy="54" r="32" fill="#ffffff"/>
       <!-- Eye Patches -->
       <ellipse cx="36" cy="50" rx="9" ry="11" fill="#1e293b" transform="rotate(-15 36 50)"/>
       <ellipse cx="64" cy="50" rx="9" ry="11" fill="#1e293b" transform="rotate(15 64 50)"/>
       <!-- Eyes -->
       <circle cx="36" cy="49" r="3" fill="#ffffff"/>
       <circle cx="64" cy="49" r="3" fill="#ffffff"/>
       <!-- Nose & Mouth -->
       <ellipse cx="50" cy="64" rx="5" ry="3.5" fill="#1e293b"/>
       <path d="M46 68 Q50 72 54 68" stroke="#1e293b" stroke-width="2" fill="none" stroke-linecap="round"/>`
    ),
  },
  {
    name: 'Lion',
    url: makeSvg(
      '#fef3c7',
      `<!-- Mane -->
       <circle cx="50" cy="50" r="38" fill="#d97706"/>
       <!-- Ears -->
       <circle cx="26" cy="30" r="9" fill="#f59e0b"/>
       <circle cx="74" cy="30" r="9" fill="#f59e0b"/>
       <circle cx="26" cy="30" r="5" fill="#fed7aa"/>
       <circle cx="74" cy="30" r="5" fill="#fed7aa"/>
       <!-- Face -->
       <circle cx="50" cy="52" r="26" fill="#fbbf24"/>
       <!-- Muzzle -->
       <ellipse cx="50" cy="62" rx="12" ry="9" fill="#fef08a"/>
       <!-- Eyes -->
       <circle cx="38" cy="46" r="3.5" fill="#0f172a"/>
       <circle cx="62" cy="46" r="3.5" fill="#0f172a"/>
       <circle cx="39.5" cy="44.5" r="1.2" fill="#ffffff"/>
       <circle cx="63.5" cy="44.5" r="1.2" fill="#ffffff"/>
       <!-- Nose & Mouth -->
       <polygon points="46,58 54,58 50,63" fill="#78350f"/>
       <path d="M46 66 Q50 70 54 66" stroke="#78350f" stroke-width="1.8" fill="none"/>`
    ),
  },
  {
    name: 'Cat',
    url: makeSvg(
      '#fce7f3',
      `<!-- Ears -->
       <polygon points="22,46 28,18 48,34" fill="#a855f7"/>
       <polygon points="27,42 31,24 44,35" fill="#f472b6"/>
       <polygon points="78,46 72,18 52,34" fill="#a855f7"/>
       <polygon points="73,42 69,24 56,35" fill="#f472b6"/>
       <!-- Head -->
       <circle cx="50" cy="54" r="30" fill="#c084fc"/>
       <!-- Eyes -->
       <ellipse cx="36" cy="50" rx="4" ry="5.5" fill="#0f172a"/>
       <ellipse cx="64" cy="50" rx="4" ry="5.5" fill="#0f172a"/>
       <circle cx="37.5" cy="48" r="1.5" fill="#ffffff"/>
       <circle cx="65.5" cy="48" r="1.5" fill="#ffffff"/>
       <!-- Nose & Mouth -->
       <polygon points="48,60 52,60 50,63" fill="#ec4899"/>
       <path d="M46 65 Q50 68 54 65" stroke="#4c1d95" stroke-width="1.8" fill="none"/>
       <!-- Whiskers -->
       <line x1="22" y1="58" x2="36" y2="60" stroke="#4c1d95" stroke-width="1.5"/>
       <line x1="20" y1="64" x2="36" y2="63" stroke="#4c1d95" stroke-width="1.5"/>
       <line x1="78" y1="58" x2="64" y2="60" stroke="#4c1d95" stroke-width="1.5"/>
       <line x1="80" y1="64" x2="64" y2="63" stroke="#4c1d95" stroke-width="1.5"/>`
    ),
  },
  {
    name: 'Bear',
    url: makeSvg(
      '#fed7aa',
      `<!-- Ears -->
       <circle cx="26" cy="26" r="12" fill="#78350f"/>
       <circle cx="74" cy="26" r="12" fill="#78350f"/>
       <circle cx="26" cy="26" r="6" fill="#fcd34d"/>
       <circle cx="74" cy="26" r="6" fill="#fcd34d"/>
       <!-- Head -->
       <circle cx="50" cy="54" r="32" fill="#92400e"/>
       <!-- Muzzle -->
       <ellipse cx="50" cy="64" rx="14" ry="11" fill="#fde68a"/>
       <!-- Eyes -->
       <circle cx="36" cy="46" r="3.5" fill="#0f172a"/>
       <circle cx="64" cy="46" r="3.5" fill="#0f172a"/>
       <circle cx="37.5" cy="44.5" r="1.2" fill="#ffffff"/>
       <circle cx="65.5" cy="44.5" r="1.2" fill="#ffffff"/>
       <!-- Nose & Mouth -->
       <ellipse cx="50" cy="60" rx="5" ry="3.5" fill="#451a03"/>
       <path d="M46 66 Q50 70 54 66" stroke="#451a03" stroke-width="2" fill="none"/>`
    ),
  },
  {
    name: 'Owl',
    url: makeSvg(
      '#ede9fe',
      `<!-- Ear Tufts -->
       <polygon points="26,38 28,16 44,32" fill="#312e81"/>
       <polygon points="74,38 72,16 56,32" fill="#312e81"/>
       <!-- Head/Body -->
       <ellipse cx="50" cy="54" rx="30" ry="34" fill="#4338ca"/>
       <!-- Eye Circles -->
       <circle cx="37" cy="46" r="13" fill="#ffffff"/>
       <circle cx="63" cy="46" r="13" fill="#ffffff"/>
       <!-- Pupils -->
       <circle cx="37" cy="46" r="6" fill="#0f172a"/>
       <circle cx="63" cy="46" r="6" fill="#0f172a"/>
       <circle cx="39" cy="44" r="2" fill="#ffffff"/>
       <circle cx="65" cy="44" r="2" fill="#ffffff"/>
       <!-- Beak -->
       <polygon points="46,52 54,52 50,66" fill="#f59e0b"/>
       <!-- Chest Feathers -->
       <path d="M42 72 Q50 76 58 72 M44 78 Q50 82 56 78" stroke="#818cf8" stroke-width="2" fill="none" stroke-linecap="round"/>`
    ),
  },
  {
    name: 'Rabbit',
    url: makeSvg(
      '#f3e8ff',
      `<!-- Long Ears -->
       <ellipse cx="34" cy="22" rx="7" ry="18" fill="#ffffff" transform="rotate(-8 34 22)"/>
       <ellipse cx="34" cy="22" rx="4" ry="14" fill="#f472b6" transform="rotate(-8 34 22)"/>
       <ellipse cx="66" cy="22" rx="7" ry="18" fill="#ffffff" transform="rotate(8 66 22)"/>
       <ellipse cx="66" cy="22" rx="4" ry="14" fill="#f472b6" transform="rotate(8 66 22)"/>
       <!-- Head -->
       <circle cx="50" cy="58" r="28" fill="#ffffff"/>
       <!-- Cheeks -->
       <circle cx="28" cy="62" r="5" fill="#fbcfe8" opacity="0.7"/>
       <circle cx="72" cy="62" r="5" fill="#fbcfe8" opacity="0.7"/>
       <!-- Eyes -->
       <ellipse cx="38" cy="52" rx="3.5" ry="4.5" fill="#0f172a"/>
       <ellipse cx="62" cy="52" rx="3.5" ry="4.5" fill="#0f172a"/>
       <circle cx="39.5" cy="50.5" r="1.2" fill="#ffffff"/>
       <circle cx="63.5" cy="50.5" r="1.2" fill="#ffffff"/>
       <!-- Nose & Mouth -->
       <polygon points="48,60 52,60 50,63" fill="#f43f5e"/>
       <path d="M46 64 Q50 67 54 64" stroke="#0f172a" stroke-width="1.8" fill="none"/>`
    ),
  },
  {
    name: 'Penguin',
    url: makeSvg(
      '#ccfbf1',
      `<!-- Head/Body -->
       <ellipse cx="50" cy="54" rx="29" ry="33" fill="#0f172a"/>
       <!-- White Face/Belly -->
       <ellipse cx="50" cy="58" rx="20" ry="25" fill="#ffffff"/>
       <!-- Rosy Cheeks -->
       <circle cx="34" cy="58" r="4.5" fill="#fda4af"/>
       <circle cx="66" cy="58" r="4.5" fill="#fda4af"/>
       <!-- Eyes -->
       <circle cx="40" cy="48" r="3.5" fill="#0f172a"/>
       <circle cx="60" cy="48" r="3.5" fill="#0f172a"/>
       <circle cx="41.5" cy="46.5" r="1.2" fill="#ffffff"/>
       <circle cx="61.5" cy="46.5" r="1.2" fill="#ffffff"/>
       <!-- Beak -->
       <polygon points="44,53 56,53 50,62" fill="#f97316"/>`
    ),
  },
];

export const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser, isCompany, isJobSeeker } = useAuth();

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

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
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
      setError('');
      setSuccess('');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectAvatar = (url) => {
    setFormData((prev) => ({
      ...prev,
      profileImage: url,
    }));
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
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '560px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Change Profile</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Choose a 2D vector avatar, update qualifications, and account details
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Avatar / 2D Vector Animal Suggestions */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1.25rem 1rem',
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
            }}
          >
            {/* Active Preview */}
            <div style={{ position: 'relative' }}>
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt={user.name}
                  style={{
                    width: '88px',
                    height: '88px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #0f172a',
                    boxShadow: 'var(--shadow-md)',
                    background: '#ffffff',
                  }}
                  onError={(e) => {
                    e.target.src = VECTOR_ANIMAL_AVATARS[0].url;
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '88px',
                    height: '88px',
                    borderRadius: '50%',
                    background: '#0f172a',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 700,
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : <FiUser size={38} />}
                </div>
              )}
            </div>

            {/* 2D Vector Animals Preset Grid */}
            <div style={{ width: '100%', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: '0.5rem', textAlign: 'center' }}>
                Select a 2D Vector Avatar:
              </span>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.65rem',
                  justifyItems: 'center',
                }}
              >
                {VECTOR_ANIMAL_AVATARS.map((animal) => {
                  const isSelected = formData.profileImage === animal.url;
                  return (
                    <div
                      key={animal.name}
                      onClick={() => handleSelectAvatar(animal.url)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer',
                        padding: '0.35rem',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? '#e2e8f0' : '#ffffff',
                        border: isSelected ? '2px solid #0f172a' : '1px solid #cbd5e1',
                        transition: 'all 0.15s ease',
                        width: '100%',
                      }}
                      title={`Select ${animal.name}`}
                    >
                      <img
                        src={animal.url}
                        alt={animal.name}
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                        }}
                      />
                      <span style={{ fontSize: '0.725rem', fontWeight: isSelected ? 700 : 500, color: '#0f172a' }}>
                        {animal.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom URL Option */}
            <div style={{ width: '100%', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem', fontSize: '0.775rem' }}>
                <FiCamera size={12} /> Or Custom Avatar URL
              </label>
              <input
                type="url"
                name="profileImage"
                className="form-input"
                placeholder="Paste custom image URL (https://...)"
                value={formData.profileImage}
                onChange={handleChange}
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.65rem' }}
              />
            </div>
          </div>

          {/* User Full Name */}
          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label className="input-label">
              {isCompany ? 'Company / Recruiter Name *' : 'Full Name *'}
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

          {/* Job Seeker Details */}
          {isJobSeeker && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="input-group">
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FiAward size={12} /> Degree / Qualification
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
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FiCalendar size={12} /> Batch / Passing Year
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
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
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FiPhone size={12} /> Phone Number
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

          {/* Company Details */}
          {isCompany && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="input-group">
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <BsBuilding size={12} /> Industry / Domain
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
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FiMapPin size={12} /> Location / Headquarters
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

              <div className="input-group" style={{ marginBottom: '1.25rem' }}>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <FiGlobe size={12} /> Company Website
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

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            disabled={submitting}
          >
            <FiCheck size={15} /> {submitting ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

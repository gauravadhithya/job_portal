import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FiX,
  FiUser,
  FiInfo,
} from 'react-icons/fi';
import { BsBuilding } from 'react-icons/bs';

export const AuthModal = ({ isOpen, onClose, initialMode = 'login', initialRole = 'Job Seeker' }) => {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: initialRole, // 'Job Seeker' | 'Company'
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
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();

  // Reset form whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'login');
      setFormData({
        name: '',
        email: '',
        password: '',
        role: initialRole || 'Job Seeker',
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
      setError('');
      setNotice('');
    }
  }, [isOpen, initialMode, initialRole]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        onClose();
      } else {
        if (!formData.name.trim()) {
          throw new Error(
            formData.role === 'Company' ? 'Please enter your company name' : 'Please enter your full name'
          );
        }

        if (formData.role === 'Job Seeker') {
          if (!formData.degree.trim()) {
            throw new Error('Please specify your Degree / Qualification (e.g. B.Tech, BCA, MCA)');
          }
          if (!formData.batch.trim()) {
            throw new Error('Please enter your Batch / Graduation Year (e.g. 2025, 2026)');
          }
        }

        const res = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          profileImage: formData.profileImage,
          degree: formData.degree,
          batch: formData.batch,
          college: formData.college,
          phone: formData.phone,
          companyName: formData.role === 'Company' ? formData.name : formData.companyName,
          industry: formData.industry,
          website: formData.website,
          location: formData.location,
        });

        // If company registered, they need approval before signing in
        if (formData.role === 'Company' || res?.isApproved === false) {
          setNotice('Registration submitted! Your company/recruiter account is pending Platform Admin approval before you can sign in.');
          setMode('login');
          return;
        }

        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: mode === 'register' ? '580px' : '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              {mode === 'login'
                ? 'Sign in to access your portal account'
                : 'Join as a Candidate or Company Recruiter'}
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>

        <div className="tab-group">
          <button
            className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login');
              setError('');
              setNotice('');
            }}
          >
            Sign In
          </button>
          <button
            className={`tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setMode('register');
              setError('');
              setNotice('');
            }}
          >
            Register
          </button>
        </div>

        {notice && <div className="alert alert-success">{notice}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} autoComplete="off">
          {mode === 'register' && (
            <>
              {/* Role Toggle Selector */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="input-label" style={{ marginBottom: '0.4rem', display: 'block' }}>
                  Select Account Type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${formData.role === 'Job Seeker' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFormData({ ...formData, role: 'Job Seeker' })}
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    <FiUser size={14} /> Job Seeker (Candidate)
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${formData.role === 'Company' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFormData({ ...formData, role: 'Company' })}
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    <BsBuilding size={14} /> Company / Recruiter
                  </button>
                </div>
                {formData.role === 'Company' && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FiInfo size={12} /> Company registrations are verified and approved by the Platform Administrator.
                  </p>
                )}
              </div>

              {/* Basic Info */}
              <div className="input-group" style={{ marginBottom: '1rem' }}>
                <label className="input-label">
                  {formData.role === 'Company' ? 'Company Name *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder={formData.role === 'Company' ? 'e.g. Acme Technologies' : 'e.g. Alex Smith'}
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="off"
                  required
                />
              </div>

              {/* CANDIDATE SPECIFIC FIELDS */}
              {formData.role === 'Job Seeker' && (
                <>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.75rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div className="input-group">
                      <label className="input-label">Degree / Qualification *</label>
                      <input
                        type="text"
                        name="degree"
                        className="form-input"
                        placeholder="e.g. B.Tech CSE, MCA, B.Sc"
                        value={formData.degree}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Batch / Passing Year *</label>
                      <input
                        type="text"
                        name="batch"
                        className="form-input"
                        placeholder="e.g. 2025, 2026"
                        value={formData.batch}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.75rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div className="input-group">
                      <label className="input-label">College / University</label>
                      <input
                        type="text"
                        name="college"
                        className="form-input"
                        placeholder="e.g. Anna University, IIT..."
                        value={formData.college}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Phone Number</label>
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

              {/* COMPANY SPECIFIC FIELDS */}
              {formData.role === 'Company' && (
                <>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.75rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div className="input-group">
                      <label className="input-label">Industry / Domain</label>
                      <input
                        type="text"
                        name="industry"
                        className="form-input"
                        placeholder="e.g. Software, FinTech, AI"
                        value={formData.industry}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Company Location / HQ</label>
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

                  <div className="input-group" style={{ marginBottom: '1rem' }}>
                    <label className="input-label">Company Website URL</label>
                    <input
                      type="url"
                      name="website"
                      className="form-input"
                      placeholder="e.g. https://company.com"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}
            </>
          )}

          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label className="input-label">Email Address *</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder={formData.role === 'Company' && mode === 'register' ? 'recruiter@company.com' : 'Enter your email ID'}
              value={formData.email}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </div>

          <div className="input-group" style={{ marginBottom: '1.25rem' }}>
            <label className="input-label">Password *</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem' }}
            disabled={submitting}
          >
            {submitting
              ? 'Please wait...'
              : mode === 'login'
              ? 'Sign In'
              : `Register as ${formData.role === 'Company' ? 'Company / Recruiter' : 'Job Seeker'}`}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {mode === 'login' ? (
            <p>
              New user or recruiter?{' '}
              <a
                href="#register"
                style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'underline' }}
                onClick={(e) => {
                  e.preventDefault();
                  setMode('register');
                  setError('');
                  setNotice('');
                }}
              >
                Register here
              </a>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <a
                href="#login"
                style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'underline' }}
                onClick={(e) => {
                  e.preventDefault();
                  setMode('login');
                  setError('');
                  setNotice('');
                }}
              >
                Sign in here
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

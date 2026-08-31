import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdminDashboardModal = ({ isOpen, onClose, onRefreshData }) => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'recruiters' | 'candidates'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add Recruiter Form State
  const [showAddRecruiter, setShowAddRecruiter] = useState(false);
  const [recruiterForm, setRecruiterForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [creatingRecruiter, setCreatingRecruiter] = useState(false);

  const loadAdminData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [statsData, usersData] = await Promise.all([
        api.getAdminStats(token),
        api.getAdminUsers(token),
      ]);
      setStats(statsData);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isOpen) {
      loadAdminData();
      setShowAddRecruiter(false);
    }
  }, [isOpen, loadAdminData]);

  if (!isOpen) return null;

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to remove user "${userName}" from the portal?`)) return;
    try {
      await api.deleteAdminUser(userId, token);
      setSuccess(`User "${userName}" removed successfully.`);
      loadAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleCreateRecruiter = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreatingRecruiter(true);

    try {
      await api.createRecruiter(recruiterForm, token);
      setSuccess(`Recruiter account for "${recruiterForm.name}" registered successfully!`);
      setRecruiterForm({ name: '', email: '', password: '' });
      setShowAddRecruiter(false);
      loadAdminData();
    } catch (err) {
      setError(err.message || 'Failed to create recruiter');
    } finally {
      setCreatingRecruiter(false);
    }
  };

  const recruiters = users.filter((u) => u.role === 'Recruiter');
  const candidates = users.filter((u) => u.role === 'Job Seeker');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '800px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">JobPortal Admin Center</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Centralized platform administration & user oversight
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="tab-group" style={{ marginBottom: '1.5rem' }}>
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Platform Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'recruiters' ? 'active' : ''}`}
            onClick={() => setActiveTab('recruiters')}
          >
            Recruiters / Companies ({recruiters.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'candidates' ? 'active' : ''}`}
            onClick={() => setActiveTab('candidates')}
          >
            Job Seekers ({candidates.length})
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Loading platform metrics...</span>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {!loading && activeTab === 'overview' && stats && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div style={statCardStyle}>
                <span style={statLabelStyle}>Total Users</span>
                <strong style={statValStyle}>{stats.totalUsers}</strong>
              </div>
              <div style={statCardStyle}>
                <span style={statLabelStyle}>Recruiters (Companies)</span>
                <strong style={statValStyle}>{stats.totalRecruiters}</strong>
              </div>
              <div style={statCardStyle}>
                <span style={statLabelStyle}>Job Seekers</span>
                <strong style={statValStyle}>{stats.totalJobSeekers}</strong>
              </div>
              <div style={statCardStyle}>
                <span style={statLabelStyle}>Active Job Openings</span>
                <strong style={statValStyle}>{stats.openJobs} / {stats.totalJobs}</strong>
              </div>
              <div style={statCardStyle}>
                <span style={statLabelStyle}>Total Applications</span>
                <strong style={statValStyle}>{stats.totalApplications}</strong>
              </div>
            </div>
          </div>
        )}

        {/* RECRUITERS TAB */}
        {!loading && activeTab === 'recruiters' && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <h4 style={{ margin: 0, fontWeight: 600 }}>
                Authorized Recruiters ({recruiters.length})
              </h4>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowAddRecruiter(!showAddRecruiter)}
              >
                {showAddRecruiter ? '✕ Cancel' : '+ Register New Recruiter'}
              </button>
            </div>

            {/* Recruiter Creation Form */}
            {showAddRecruiter && (
              <form
                onSubmit={handleCreateRecruiter}
                autoComplete="off"
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  marginBottom: '1.25rem',
                }}
              >
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>
                  Register Recruiter / Employer Account
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className="input-group">
                    <label className="input-label">Recruiter / Company Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Company name"
                      value={recruiterForm.name}
                      onChange={(e) => setRecruiterForm({ ...recruiterForm, name: e.target.value })}
                      autoComplete="off"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Enter your email ID"
                      value={recruiterForm.email}
                      onChange={(e) => setRecruiterForm({ ...recruiterForm, email: e.target.value })}
                      autoComplete="off"
                      required
                    />
                  </div>
                </div>

                <div className="input-group" style={{ marginBottom: '1rem' }}>
                  <label className="input-label">Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter your password"
                    value={recruiterForm.password}
                    onChange={(e) => setRecruiterForm({ ...recruiterForm, password: e.target.value })}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={creatingRecruiter}
                >
                  {creatingRecruiter ? 'Creating Account...' : 'Register Recruiter'}
                </button>
              </form>
            )}

            {recruiters.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No recruiters registered yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {recruiters.map((rec) => (
                  <div
                    key={rec._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: '#f8fafc',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.95rem' }}>🏢 {rec.name}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '0.75rem' }}>
                        {rec.email} • Registered {new Date(rec.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteUser(rec._id, rec.name)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CANDIDATES TAB */}
        {!loading && activeTab === 'candidates' && (
          <div>
            <h4 style={{ marginBottom: '0.75rem', fontWeight: 600 }}>
              Registered Job Seekers ({candidates.length})
            </h4>
            {candidates.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No job seekers registered yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {candidates.map((cand) => (
                  <div
                    key={cand._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: '#f8fafc',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.95rem' }}>👤 {cand.name}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '0.75rem' }}>
                        {cand.email} • Joined {new Date(cand.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteUser(cand._id, cand.name)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const statCardStyle = {
  background: '#f8fafc',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)',
  padding: '1rem',
  textAlign: 'center',
};

const statLabelStyle = {
  display: 'block',
  fontSize: '0.75rem',
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '0.25rem',
};

const statValStyle = {
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#0f172a',
};

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FiX,
  FiClock,
  FiCheck,
  FiTrash2,
  FiUser,
  FiShield,
  FiPlus,
  FiMail,
  FiMapPin,
  FiCheckCircle,
} from 'react-icons/fi';
import { BsBuilding } from 'react-icons/bs';

export const AdminDashboardModal = ({ isOpen, onClose, onRefreshData }) => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'pending' | 'companies' | 'candidates'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Add Company Form State
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    email: '',
    password: '',
    profileImage: '',
    industry: '',
    location: '',
  });
  const [creatingCompany, setCreatingCompany] = useState(false);

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
      setShowAddCompany(false);
      setSuccess('');
      setError('');
    }
  }, [isOpen, loadAdminData]);

  if (!isOpen) return null;

  const handleApproveCompany = async (userId, userName) => {
    setActionLoadingId(userId);
    setError('');
    setSuccess('');
    try {
      await api.approveCompany(userId, token);
      setSuccess(`Company account for "${userName}" has been APPROVED! They can now log in and post jobs.`);
      loadAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      setError(err.message || 'Failed to approve company');
    } finally {
      setActionLoadingId(null);
    }
  };

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

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreatingCompany(true);

    try {
      await api.createCompany(companyForm, token);
      setSuccess(`Company account for "${companyForm.name}" registered & approved successfully!`);
      setCompanyForm({ name: '', email: '', password: '', profileImage: '', industry: '', location: '' });
      setShowAddCompany(false);
      loadAdminData();
    } catch (err) {
      setError(err.message || 'Failed to create company');
    } finally {
      setCreatingCompany(false);
    }
  };

  const companies = users.filter((u) => u.role === 'Company' || u.role === 'Recruiter');
  const pendingCompanies = companies.filter((u) => u.isApproved === false);
  const candidates = users.filter((u) => u.role === 'Job Seeker');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '820px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">JobPortal Administration Hub</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Centralized platform administration & company approval center
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="tab-group" style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Platform Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <FiClock size={13} /> Pending Approvals
            {pendingCompanies.length > 0 && (
              <span
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.1rem 0.45rem',
                  borderRadius: '9999px',
                }}
              >
                {pendingCompanies.length}
              </span>
            )}
          </button>
          <button
            className={`tab-btn ${activeTab === 'companies' ? 'active' : ''}`}
            onClick={() => setActiveTab('companies')}
          >
            All Companies ({companies.length})
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div style={statCardStyle}>
                <span style={statLabelStyle}>Total Users</span>
                <strong style={statValStyle}>{stats.totalUsers}</strong>
              </div>
              <div style={statCardStyle}>
                <span style={statLabelStyle}>Companies</span>
                <strong style={statValStyle}>{stats.totalCompanies}</strong>
              </div>
              <div style={{ ...statCardStyle, borderColor: pendingCompanies.length > 0 ? '#fca5a5' : 'var(--border-color)' }}>
                <span style={statLabelStyle}>Pending Approval</span>
                <strong style={{ ...statValStyle, color: pendingCompanies.length > 0 ? '#dc2626' : 'inherit' }}>
                  {pendingCompanies.length}
                </strong>
              </div>
              <div style={statCardStyle}>
                <span style={statLabelStyle}>Job Seekers</span>
                <strong style={statValStyle}>{stats.totalJobSeekers}</strong>
              </div>
              <div style={statCardStyle}>
                <span style={statLabelStyle}>Active Job Openings</span>
                <strong style={statValStyle}>{stats.openJobs} / {stats.totalJobs}</strong>
              </div>
            </div>
          </div>
        )}

        {/* PENDING APPROVALS TAB */}
        {!loading && activeTab === 'pending' && (
          <div>
            <h4 style={{ marginBottom: '0.75rem', fontWeight: 700, fontSize: '0.95rem' }}>
              Pending Company / Recruiter Registrations ({pendingCompanies.length})
            </h4>

            {pendingCompanies.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <FiCheckCircle size={36} style={{ color: '#16a34a' }} />
                </div>
                <h3>No pending company approvals</h3>
                <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  All registered company and recruiter accounts are currently approved and active.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pendingCompanies.map((comp) => (
                  <div
                    key={comp._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: 'var(--radius-md)',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {comp.profileImage ? (
                        <img
                          src={comp.profileImage}
                          alt={comp.name}
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: 'var(--radius-md)',
                            background: '#0f172a',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                          }}
                        >
                          {comp.name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{comp.name}</strong>
                        <span className="role-pill" style={{ marginLeft: '0.5rem', background: '#fef3c7', color: '#92400e' }}>
                          Pending Approval
                        </span>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><FiMail size={12} /> {comp.email}</span>
                          {comp.industry && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>• <BsBuilding size={12} /> {comp.industry}</span>}
                          {comp.location && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>• <FiMapPin size={12} /> {comp.location}</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Registered on {new Date(comp.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ background: '#16a34a', borderColor: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        disabled={actionLoadingId === comp._id}
                        onClick={() => handleApproveCompany(comp._id, comp.name)}
                      >
                        <FiCheck size={13} /> {actionLoadingId === comp._id ? 'Approving...' : 'Approve Company'}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        onClick={() => handleDeleteUser(comp._id, comp.name)}
                      >
                        <FiTrash2 size={13} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ALL COMPANIES TAB */}
        {!loading && activeTab === 'companies' && (
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
                All Registered Companies ({companies.length})
              </h4>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowAddCompany(!showAddCompany)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                {showAddCompany ? <><FiX size={13} /> Cancel</> : <><FiPlus size={13} /> Register New Company</>}
              </button>
            </div>

            {/* Company Creation Form */}
            {showAddCompany && (
              <form
                onSubmit={handleCreateCompany}
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
                  Register and Auto-Approve Company Account
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className="input-group">
                    <label className="input-label">Company Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Company name"
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                      autoComplete="off"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Enter company email ID"
                      value={companyForm.email}
                      onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                      autoComplete="off"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="input-group">
                    <label className="input-label">Password *</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter password"
                      value={companyForm.password}
                      onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })}
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Logo URL (Optional)</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://..."
                      value={companyForm.profileImage}
                      onChange={(e) => setCompanyForm({ ...companyForm, profileImage: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={creatingCompany}
                >
                  {creatingCompany ? 'Creating Account...' : 'Register & Approve Company'}
                </button>
              </form>
            )}

            {companies.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No companies registered yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {companies.map((comp) => {
                  const isPending = comp.isApproved === false;
                  return (
                    <div
                      key={comp._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        background: '#f8fafc',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        {comp.profileImage ? (
                          <img
                            src={comp.profileImage}
                            alt={comp.name}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <FiBuilding size={16} style={{ color: '#64748b' }} />
                        )}
                        <div>
                          <strong style={{ fontSize: '0.95rem' }}>{comp.name}</strong>
                          <span
                            className="role-pill"
                            style={{
                              marginLeft: '0.5rem',
                              background: isPending ? '#fef3c7' : '#dcfce7',
                              color: isPending ? '#92400e' : '#166534',
                            }}
                          >
                            {isPending ? 'Pending Approval' : 'Approved'}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                            {comp.email} • Registered {new Date(comp.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {isPending && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ background: '#16a34a', borderColor: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                            disabled={actionLoadingId === comp._id}
                            onClick={() => handleApproveCompany(comp._id, comp.name)}
                          >
                            <FiCheck size={12} /> Approve
                          </button>
                        )}
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          onClick={() => handleDeleteUser(comp._id, comp.name)}
                        >
                          <FiTrash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
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
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      {cand.profileImage ? (
                        <img
                          src={cand.profileImage}
                          alt={cand.name}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <FiUser size={16} style={{ color: '#64748b' }} />
                      )}
                      <div>
                        <strong style={{ fontSize: '0.95rem' }}>{cand.name}</strong>
                        {cand.degree && (
                          <span className="skill-tag" style={{ marginLeft: '0.4rem', fontSize: '0.7rem' }}>
                            {cand.degree} {cand.batch ? `(${cand.batch})` : ''}
                          </span>
                        )}
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {cand.email} • Joined {new Date(cand.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <button
                      className="btn btn-danger btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      onClick={() => handleDeleteUser(cand._id, cand.name)}
                    >
                      <FiTrash2 size={12} /> Remove
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

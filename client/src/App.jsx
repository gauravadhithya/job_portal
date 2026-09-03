import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { JobCard } from './components/JobCard';
import { AuthModal } from './components/AuthModal';
import { PostJobModal } from './components/PostJobModal';
import { ApplyModal } from './components/ApplyModal';
import { ApplicationsModal } from './components/ApplicationsModal';
import { MyApplicationsModal } from './components/MyApplicationsModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { AdminCenterView } from './components/AdminCenterView';
import { UserSidebar } from './components/UserSidebar';
import { Footer } from './components/Footer';
import { ProfilePage } from './pages/ProfilePage';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import heroIllustration from './assets/landing-hero.jpg';
import {
  FiBriefcase,
  FiTrendingUp,
  FiZap,
  FiUser,
  FiPlus,
  FiMapPin,
  FiArrowRight,
  FiX,
  FiAward,
  FiShield,
  FiShare2,
} from 'react-icons/fi';
import { BsBuilding } from 'react-icons/bs';

export function App() {
  const { user, isAuthenticated, isCompany, isJobSeeker, isAdmin, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Create clean user slug for URL routing (e.g. 'gaurav')
  const userSlug = useMemo(() => {
    if (!user?.name) return 'user';
    return encodeURIComponent(user.name.toLowerCase().trim().replace(/\s+/g, '-'));
  }, [user]);

  // State Management
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [companyStatusFilter, setCompanyStatusFilter] = useState('All'); // 'All' | 'Open' | 'Closed'

  // Modal Visibility States
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: 'login',
    role: 'Job Seeker',
  });
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [showMyApplicationsModal, setShowMyApplicationsModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Selected Data for Modals
  const [applyingJob, setApplyingJob] = useState(null);
  const [viewingApplicantsJob, setViewingApplicantsJob] = useState(null);

  // Fetch Jobs Data
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (isCompany && !isAdmin) {
        const data = await api.getRecruiterJobs(token);
        setJobs(Array.isArray(data) ? data : []);
      } else {
        const data = await api.getJobs();
        setJobs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to the jobs server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [isCompany, isAdmin, token]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Ensure logged-in users are always on /feed or /in/:username
  useEffect(() => {
    if (isAuthenticated && user?.name) {
      // If user is on root '/' or legacy non-standard URLs, redirect to /feed
      if (
        location.pathname === '/' ||
        location.pathname === `/${userSlug}` ||
        location.pathname === `/${userSlug}/profile`
      ) {
        navigate('/feed', { replace: true });
      }
    } else if (!isAuthenticated) {
      if (location.pathname === '/feed' || location.pathname === '/feed/') {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user?.name, userSlug, location.pathname, navigate]);

  // Unified Single Search Filter
  const displayedJobs = useMemo(() => {
    return jobs.filter((job) => {
      // For Company users, strictly filter to show ONLY jobs belonging to this company
      if (isCompany && !isAdmin) {
        const recruiterId = (job.recruiterId?._id || job.recruiterId)?.toString();
        const companyId = (job.companyId?._id || job.companyId)?.toString();
        const currentUserId = user?._id?.toString();
        const currentUserName = (user?.name || '').toLowerCase().trim();
        const recruiterName = (job.recruiterId?.name || '').toLowerCase().trim();
        const companyName = (job.companyId?.name || job.companyName || '').toLowerCase().trim();

        const belongsToUser =
          (currentUserId && (recruiterId === currentUserId || companyId === currentUserId)) ||
          (currentUserName && (recruiterName === currentUserName || companyName === currentUserName));

        if (!belongsToUser) return false;

        // Company status filter
        if (companyStatusFilter !== 'All' && job.status !== companyStatusFilter) {
          return false;
        }
      }

      // Single Unified Search matching title, company, skills, or location
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesTitle = job.title?.toLowerCase().includes(query);
        const matchesCompany = job.companyName?.toLowerCase().includes(query);
        const matchesLocation = job.location?.toLowerCase().includes(query);
        const matchesSkills = Array.isArray(job.skills) && job.skills.some((s) => s.toLowerCase().includes(query));

        if (!matchesTitle && !matchesCompany && !matchesLocation && !matchesSkills) {
          return false;
        }
      }

      return true;
    });
  }, [jobs, searchQuery, isCompany, isAdmin, companyStatusFilter, user]);

  // Metrics & Company Spotlight for Guest Landing Page
  const landingOverview = useMemo(() => {
    const companiesMap = new Map();
    const allSkills = new Set();
    let openJobsCount = 0;

    jobs.forEach((job) => {
      const cName = job.companyId?.name || job.recruiterId?.name || job.companyName || 'Company';
      const cLocation = job.companyId?.location || job.location || 'Remote';
      if (job.status !== 'Closed') {
        openJobsCount += 1;
      }
      if (!companiesMap.has(cName)) {
        companiesMap.set(cName, {
          name: cName,
          location: cLocation,
          jobCount: 1,
          openJobs: job.status !== 'Closed' ? 1 : 0,
          roles: [job.title],
          skills: Array.isArray(job.skills) ? job.skills : [],
        });
      } else {
        const existing = companiesMap.get(cName);
        existing.jobCount += 1;
        if (job.status !== 'Closed') existing.openJobs += 1;
        if (!existing.roles.includes(job.title)) existing.roles.push(job.title);
        if (Array.isArray(job.skills)) {
          job.skills.forEach((s) => {
            if (!existing.skills.includes(s)) existing.skills.push(s);
          });
        }
      }

      if (Array.isArray(job.skills)) {
        job.skills.forEach((s) => s && allSkills.add(s));
      }
    });

    return {
      totalOpportunities: jobs.length,
      openJobsCount,
      totalCompanies: Math.max(companiesMap.size, 1),
      companiesList: Array.from(companiesMap.values()),
      popularSkills: Array.from(allSkills).slice(0, 10),
    };
  }, [jobs]);

  // Auth Modal openers
  const openSignIn = () => {
    setAuthModal({ isOpen: true, mode: 'login', role: 'Job Seeker' });
  };

  const openRegister = (role = 'Job Seeker') => {
    setAuthModal({ isOpen: true, mode: 'register', role });
  };

  const closeAuthModal = () => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Job Actions
  const handleApplyClick = (job) => {
    if (!isAuthenticated) {
      openSignIn();
      return;
    }
    setApplyingJob(job);
  };

  const handleToggleJobStatus = async (job) => {
    const newStatus = job.status === 'Open' ? 'Closed' : 'Open';
    try {
      await api.updateJobStatus(job._id, newStatus, token);
      fetchJobs();
    } catch (err) {
      alert(err.message || 'Failed to update job status');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to permanently delete this job listing?')) {
      return;
    }
    try {
      await api.deleteJob(jobId, token);
      fetchJobs();
    } catch (err) {
      alert(err.message || 'Failed to delete job');
    }
  };

  // Navigations
  const handleGoHome = () => {
    navigate(isAuthenticated ? '/feed' : '/');
  };

  const handleGoProfile = () => {
    navigate(isAuthenticated ? `/in/${userSlug}` : '/profile');
  };

  const mainPortalContent = (
    <div className="container">
      {isAdmin ? (
        /* ADMIN EXECUTIVE VIEW: INTEGRATED ADMIN CENTER ATTRIBUTES BAR & DASHBOARD */
        <AdminCenterView
          jobs={jobs}
          onDeleteJob={handleDeleteJob}
          onApplyClick={handleApplyClick}
          onViewApplicants={(jb) => setViewingApplicantsJob(jb)}
          onToggleStatus={handleToggleJobStatus}
          onRefreshJobs={fetchJobs}
          onGoProfile={handleGoProfile}
          userSlug={userSlug}
        />
      ) : isAuthenticated ? (
        /* JOB SEEKER & COMPANY 2-COLUMN SIDEBAR + FEED LAYOUT */
        <div className="portal-feed-layout">
          {/* Left Column: Role Sidebar (Job Seeker / Company) */}
          <aside className="portal-sidebar-column">
            <UserSidebar
              onOpenProfile={handleGoProfile}
              onOpenMyApplications={() => setShowMyApplicationsModal(true)}
              onOpenPostJob={() => setShowPostJobModal(true)}
              onOpenAdminDashboard={() => setShowAdminModal(true)}
            />
          </aside>

          {/* Right Column: Feed Content & Listings */}
          <div className="portal-main-column">
            {/* Jobs Listing Header */}
            <div className="jobs-header">
              <div>
                <h2 className="jobs-title">
                  {isCompany
                    ? 'Your Company Postings'
                    : 'Explore All Opportunities'}{' '}
                  ({displayedJobs.length})
                </h2>
                {searchQuery.trim() && (
                  <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      Filtered by: <strong>"{searchQuery}"</strong>
                    </span>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.15rem 0.45rem', fontSize: '0.75rem' }}
                      onClick={() => setSearchQuery('')}
                    >
                      Clear Filter <FiX size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Company quick status tabs */}
              {isCompany && (
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {['All', 'Open', 'Closed'].map((st) => (
                    <button
                      key={st}
                      className={`btn btn-sm ${companyStatusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setCompanyStatusFilter(st)}
                    >
                      {st} Postings
                    </button>
                  ))}
                </div>
              )}

              {loading && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Refreshing...</span>}
            </div>

            {error && (
              <div className="alert alert-danger" style={{ marginBottom: '2rem' }}>
                <strong>Notice:</strong> {error}
              </div>
            )}

            {/* Jobs Grid */}
            {!loading && displayedJobs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <FiBriefcase size={36} />
                </div>
                <h3>No jobs found matching "{searchQuery}"</h3>
                <p>Try searching for a different job title, company name, skill, or location.</p>
                {searchQuery && (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '1rem' }}
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="jobs-grid">
                {displayedJobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    onApply={handleApplyClick}
                    onViewApplicants={(jb) => setViewingApplicantsJob(jb)}
                    onToggleStatus={handleToggleJobStatus}
                    onDeleteJob={handleDeleteJob}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* GUEST LANDING PAGE: 2-PARTITION HERO LAYOUT */
        <div>
          <div className="landing-split-container">
            {/* LEFT PARTITION: Welcome & Registration Action Block */}
            <div className="landing-left-partition">
              <span className="role-pill" style={{ width: 'fit-content', background: '#e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <FiZap size={12} /> The Modern Professional Platform
              </span>
              <h1 className="landing-main-title">
                Welcome to JobPortal
              </h1>
              <p className="landing-description">
                Find the right job or internship for you, connect with top hiring companies, and accelerate your career path with seamless verified applications.
              </p>

              {/* Register Callout if you are a new user */}
              <div className="landing-auth-actions">
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                  New to JobPortal? Create an account:
                </span>

                <div className="landing-auth-btn-row">
                  <button
                    className="btn btn-primary"
                    onClick={() => openRegister('Job Seeker')}
                  >
                    <FiUser size={14} /> Sign Up as Job Seeker
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => openRegister('Company')}
                  >
                    <BsBuilding size={14} /> Register as Company
                  </button>
                </div>

                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Already registered?{' '}
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0f172a',
                      fontWeight: 700,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: 0,
                      font: 'inherit',
                    }}
                    onClick={openSignIn}
                  >
                    Sign In here →
                  </button>
                </div>
              </div>

              {/* Quick stats counter */}
              <div className="landing-stats-row">
                <div className="landing-stat-item">
                  <span className="landing-stat-number">{jobs.length}+</span>
                  <span className="landing-stat-label">Active Listings</span>
                </div>
                <div className="landing-stat-item">
                  <span className="landing-stat-number">Verified</span>
                  <span className="landing-stat-label">Top Employers</span>
                </div>
                <div className="landing-stat-item">
                  <span className="landing-stat-number">Instant</span>
                  <span className="landing-stat-label">Resume Apply</span>
                </div>
              </div>
            </div>

            {/* RIGHT PARTITION: Hero Vector Illustration */}
            <div
              className="landing-right-partition"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                boxShadow: 'none',
                padding: '0',
              }}
            >
              <img
                src={heroIllustration}
                alt="Work & Career Opportunities"
                style={{
                  width: '100%',
                  maxWidth: '460px',
                  height: 'auto',
                  maxHeight: '400px',
                  objectFit: 'contain',
                  border: 'none',
                }}
              />
            </div>
          </div>

          {/* PLATFORM LIVE METRICS & OPPORTUNITIES OVERVIEW */}
          <div style={{ marginTop: '3rem', marginBottom: '2.5rem' }}>
            <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 2.5rem' }}>
              <span className="role-pill" style={{ background: '#e0f2fe', color: '#0369a1', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.6rem' }}>
                <FiTrendingUp size={12} /> Live Network Overview
              </span>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
                Platform Opportunities & Active Hiring
              </h2>
              <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', margin: 0 }}>
                Explore live verified openings, connect with active recruiters, and fast-track your next career move.
              </p>
            </div>

            {/* 4 Interactive Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
              <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
                  <FiBriefcase size={20} />
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                  {landingOverview.totalOpportunities}+
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginTop: '0.35rem' }}>
                  Career Opportunities
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Live verified listings across software, engineering & tech
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
                  <BsBuilding size={20} />
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                  {landingOverview.totalCompanies}
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginTop: '0.35rem' }}>
                  Hiring Companies
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Verified organizations actively recruiting candidates
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
                  <FiZap size={20} />
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                  {landingOverview.openJobsCount}
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginTop: '0.35rem' }}>
                  Open Positions
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Currently accepting direct resume applications
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
                  <FiAward size={20} />
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                  100%
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginTop: '0.35rem' }}>
                  Direct Matching
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Transparent application tracking for candidates
                </div>
              </div>
            </div>

            {/* COMPANY HIRING SPOTLIGHT PREVIEWS */}
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Active Hiring Companies & Openings
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>
                    Click on any company to view their public profile and job listings
                  </p>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={openSignIn}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  Sign In to Apply <FiArrowRight size={13} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {landingOverview.companiesList.map((comp, idx) => {
                  const compSlug = encodeURIComponent(comp.name.toLowerCase().trim().replace(/\s+/g, '-'));
                  return (
                    <div
                      key={`${comp.name}-${idx}`}
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.15s ease, border-color 0.15s ease',
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/in/${compSlug}`)}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = '#94a3b8';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                      }}
                      title={`View ${comp.name}'s profile & job opportunities`}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: 'var(--radius-md)',
                                background: '#0f172a',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '1.05rem',
                              }}
                            >
                              {comp.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                                {comp.name}
                              </h4>
                              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <FiMapPin size={11} /> {comp.location}
                              </span>
                            </div>
                          </div>

                          <span className="status-badge status-Shortlisted" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>
                            {comp.openJobs} Open {comp.openJobs === 1 ? 'Job' : 'Jobs'}
                          </span>
                        </div>

                        {/* Recent Roles */}
                        <div style={{ marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em', display: 'block', marginBottom: '0.3rem' }}>
                            Available Roles:
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                            {comp.roles.slice(0, 3).map((r, rIdx) => (
                              <span key={rIdx} style={{ fontSize: '0.75rem', background: '#f8fafc', border: '1px solid var(--border-color)', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-sm)', color: '#0f172a', fontWeight: 500 }}>
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Skills Needed */}
                        {comp.skills && comp.skills.length > 0 && (
                          <div>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em', display: 'block', marginBottom: '0.3rem' }}>
                              Required Skills:
                            </span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                              {comp.skills.slice(0, 4).map((sk, sIdx) => (
                                <span key={sIdx} className="skill-tag" style={{ fontSize: '0.7rem' }}>
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{ paddingTop: '0.85rem', marginTop: '0.85rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          View Opportunities <FiArrowRight size={12} />
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Verified Recruiter
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* IN-DEMAND SKILLS & FAST APPLY CALLOUT */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.5rem',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div style={{ maxWidth: '520px' }}>
                <span className="role-pill" style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', marginBottom: '0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FiZap size={12} /> Ready to Get Started?
                </span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem' }}>
                  Unlock all {landingOverview.totalOpportunities}+ opportunities today
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                  Sign in or create a free profile to view full salary packages, submit instant resume applications, and connect with top hiring teams.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  className="btn"
                  style={{ background: '#ffffff', color: '#0f172a', fontWeight: 700, padding: '0.75rem 1.4rem' }}
                  onClick={openSignIn}
                >
                  Sign In to Browse & Apply
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)', padding: '0.75rem 1.25rem' }}
                  onClick={() => openRegister('Job Seeker')}
                >
                  Create Free Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="app-layout">
      {/* Top Bar Navigation with Single Unified Search */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAuth={openSignIn}
        onOpenPostJob={() => setShowPostJobModal(true)}
        onOpenAdminDashboard={() => setShowAdminModal(true)}
        onOpenMyApplications={() => setShowMyApplicationsModal(true)}
        onNavigateHome={handleGoHome}
        jobs={jobs}
      />

      <main className="main-content">
        <Routes>
          {/* LINKEDIN INDIVIDUAL PERSON'S PROFILE ROUTE (/in/:username) */}
          <Route
            path="/in/:username"
            element={<ProfilePage onBack={handleGoHome} />}
          />
          <Route
            path="/in/:username/profile"
            element={<ProfilePage onBack={handleGoHome} />}
          />
          <Route
            path="/profile"
            element={<ProfilePage onBack={handleGoHome} />}
          />

          {/* LINKEDIN USER PAGE / FEED ROUTE (/feed) */}
          <Route path="/feed" element={mainPortalContent} />
          <Route path="/feed/*" element={mainPortalContent} />

          {/* ROOT & REDIRECTS */}
          <Route path="/" element={mainPortalContent} />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/feed" : "/"} replace />} />
        </Routes>
      </main>

      {/* FOOTER ABOUT THE WEBSITE */}
      <Footer
        onOpenSignIn={openSignIn}
        onOpenSignUpJobSeeker={() => openRegister('Job Seeker')}
        onOpenSignUpCompany={() => openRegister('Company')}
      />

      {/* MODALS */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        initialMode={authModal.mode}
        initialRole={authModal.role}
      />

      <PostJobModal
        isOpen={showPostJobModal}
        onClose={() => setShowPostJobModal(false)}
        onJobPosted={fetchJobs}
      />

      <ApplyModal
        job={applyingJob}
        isOpen={!!applyingJob}
        onClose={() => setApplyingJob(null)}
      />

      <ApplicationsModal
        job={viewingApplicantsJob}
        isOpen={!!viewingApplicantsJob}
        onClose={() => setViewingApplicantsJob(null)}
      />

      <MyApplicationsModal
        isOpen={showMyApplicationsModal}
        onClose={() => setShowMyApplicationsModal(false)}
      />

      <AdminDashboardModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onRefreshData={fetchJobs}
      />
    </div>
  );
}

export default App;

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
import { UserProfileBanner } from './components/UserProfileBanner';
import { ProfilePage } from './pages/ProfilePage';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import {
  FiBriefcase,
  FiTrendingUp,
  FiZap,
  FiUser,
  FiPlus,
  FiMapPin,
  FiArrowRight,
  FiX,
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
      // Company status filter
      if (isCompany && !isAdmin && companyStatusFilter !== 'All') {
        if (job.status !== companyStatusFilter) return false;
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
  }, [jobs, searchQuery, isCompany, isAdmin, companyStatusFilter]);

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
      {/* LOGGED IN VIEWS: LinkedIn-style Profile Header below the Top Bar */}
      {isAuthenticated ? (
        <UserProfileBanner
          onOpenProfile={handleGoProfile}
          onOpenMyApplications={() => setShowMyApplicationsModal(true)}
          onOpenPostJob={() => setShowPostJobModal(true)}
          onOpenAdminDashboard={() => setShowAdminModal(true)}
        />
      ) : (
        /* GUEST LANDING PAGE: 2-PARTITION HERO LAYOUT */
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

          {/* RIGHT PARTITION: Interactive Opportunities Showcase */}
          <div className="landing-right-partition">
            <div className="showcase-header">
              <span className="showcase-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <FiTrendingUp size={15} /> Featured Opportunities
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Live Openings</span>
            </div>

            {jobs.slice(0, 3).map((jb) => (
              <div key={jb._id} className="showcase-item">
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>
                    {jb.title}
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                    <BsBuilding size={12} /> {jb.companyName} {jb.location ? `• ` : ''} {jb.location && <><FiMapPin size={11} /> {jb.location}</>}
                  </span>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                  onClick={() => handleApplyClick(jb)}
                >
                  Apply
                </button>
              </div>
            ))}

            {jobs.length === 0 && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                Opportunities are being listed. Check back shortly!
              </p>
            )}

            <div style={{ background: '#ffffff', borderRadius: 'var(--radius-sm)', padding: '0.75rem', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                Are you hiring?{' '}
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0f172a',
                    fontWeight: 700,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    font: 'inherit',
                  }}
                  onClick={() => openRegister('Company')}
                >
                  Post your job opening here <FiArrowRight style={{ verticalAlign: 'middle' }} size={12} />
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Jobs Listing Header */}
      <div className="jobs-header">
        <div>
          <h2 className="jobs-title">
            {isAdmin
              ? 'All Platform Job Listings'
              : isCompany
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

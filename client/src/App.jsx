import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { JobCard } from './components/JobCard';
import { JobSearchFilter } from './components/JobSearchFilter';
import { ApplyModal } from './components/ApplyModal';
import { PostJobModal } from './components/PostJobModal';
import { ApplicationsModal } from './components/ApplicationsModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { MyApplicationsModal } from './components/MyApplicationsModal';

function App() {
  const { user, token, isRecruiter, isJobSeeker, isAdmin, loading: authLoading } = useAuth();

  // State
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [filters, setFilters] = useState({});
  const [recruiterStatusFilter, setRecruiterStatusFilter] = useState('All'); // 'All' | 'Open' | 'Closed'

  // Modals state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showMyApplicationsModal, setShowMyApplicationsModal] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);

  const fetchJobsList = useCallback(async (activeFilters = {}) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getJobs(token, activeFilters);
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading) {
      fetchJobsList(filters);
    }
  }, [fetchJobsList, filters, authLoading]);

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification('');
    }, 4000);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  const handleToggleJobStatus = async (job) => {
    const nextStatus = job.status === 'Closed' ? 'Open' : 'Closed';
    try {
      await api.updateJobStatus(job._id, nextStatus, token);
      showToast(`Job listing is now marked as ${nextStatus}!`);
      fetchJobsList(filters);
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleDeleteJob = async (job) => {
    if (!window.confirm(`Are you sure you want to permanently delete the job listing "${job.title}"?`)) return;
    try {
      await api.deleteJob(job._id, token);
      showToast(`Job listing "${job.title}" deleted successfully.`);
      fetchJobsList(filters);
    } catch (err) {
      alert(`Failed to delete job: ${err.message}`);
    }
  };

  // Filter jobs for recruiter if they only want their own / specific status
  const displayedJobs = jobs.filter((job) => {
    if (isRecruiter) {
      const recId = job.recruiterId?._id?.toString() || job.recruiterId?.toString();
      const currentUserId = user?._id?.toString();
      const isMyJob = !recId || recId === currentUserId;

      if (recruiterStatusFilter === 'Open') return isMyJob && job.status === 'Open';
      if (recruiterStatusFilter === 'Closed') return isMyJob && job.status === 'Closed';
      return isMyJob;
    }
    if (isAdmin) {
      return true; // Admins view all platform jobs with moderation control
    }
    // Job seekers only see open jobs
    return job.status === 'Open' || !job.status;
  });

  return (
    <>
      <Navbar
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenPostJob={() => setShowPostJobModal(true)}
        onOpenAdminDashboard={() => setShowAdminModal(true)}
        onOpenMyApplications={() => setShowMyApplicationsModal(true)}
      />

      <main className="main-content">
        <div className="container">
          {/* Notification Alert */}
          {notification && (
            <div className="alert alert-success" style={{ textAlign: 'center' }}>
              {notification}
            </div>
          )}

          {/* DYNAMIC HERO / HEADER BASED ON ROLE */}
          {isAdmin ? (
            /* Admin Platform Management Banner */
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem 1.5rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.25rem',
              }}
            >
              <div>
                <span className="role-pill" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                  Platform Administrator
                </span>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>
                  JobPortal Administration Hub
                </h1>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Manage platform users, oversee registered recruiters, and monitor platform statistics.
                </p>
              </div>

              <div>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAdminModal(true)}
                >
                  Open Admin Center
                </button>
              </div>
            </div>
          ) : isRecruiter ? (
            /* Recruiter Workspace Banner */
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem 1.5rem',
                marginBottom: '2rem',
              }}
            >
              <div>
                <span className="role-pill" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                  Recruiter Workspace
                </span>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>
                  {user?.name}’s Job Postings
                </h1>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Manage your company's open positions, track applicants, and review submissions.
                </p>
              </div>
            </div>
          ) : (
            /* Candidate & Guest Search Experience */
            <>
              <section className="hero-section">
                <h1 className="hero-title">Discover Your Next Strategic Role</h1>
                <p className="hero-subtitle">
                  Browse top opportunities from vetted companies and apply seamlessly with your resume.
                </p>
              </section>

              <JobSearchFilter
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
              />
            </>
          )}

          {/* Jobs Listing Header */}
          <div className="jobs-header">
            <div>
              <h2 className="jobs-title">
                {isAdmin
                  ? 'All Platform Job Listings'
                  : isRecruiter
                  ? 'Your Company Postings'
                  : 'Featured Opportunities'}{' '}
                ({displayedJobs.length})
              </h2>
            </div>

            {/* Recruiter quick status tabs */}
            {isRecruiter && (
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {['All', 'Open', 'Closed'].map((st) => (
                  <button
                    key={st}
                    className={`btn btn-sm ${recruiterStatusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setRecruiterStatusFilter(st)}
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

          {loading && displayedJobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Loading positions...</p>
            </div>
          ) : displayedJobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💼</div>
              <h3>
                {isRecruiter
                  ? "You haven't posted any jobs under this status yet."
                  : 'No job listings found.'}
              </h3>
              {isRecruiter && (
                <button
                  className="btn btn-primary"
                  style={{ marginTop: '1rem' }}
                  onClick={() => setShowPostJobModal(true)}
                >
                  + Post Your First Job Opening
                </button>
              )}
            </div>
          ) : (
            <div className="job-grid">
              {displayedJobs.map((job) => (
                <JobCard
                  key={job._id || job.id || Math.random()}
                  job={job}
                  onApply={(j) => setSelectedJobForApply(j)}
                  onViewApplicants={(j) => setSelectedJobForApplicants(j)}
                  onToggleStatus={handleToggleJobStatus}
                  onDeleteJob={handleDeleteJob}
                  onRequireAuth={() => setShowAuthModal(true)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <ApplyModal
        job={selectedJobForApply}
        isOpen={!!selectedJobForApply}
        onClose={() => setSelectedJobForApply(null)}
        onSuccess={(msg) => showToast(msg)}
      />

      <PostJobModal
        isOpen={showPostJobModal}
        onClose={() => setShowPostJobModal(false)}
        onSuccess={(msg) => {
          showToast(msg);
          fetchJobsList(filters);
        }}
      />

      <ApplicationsModal
        job={selectedJobForApplicants}
        isOpen={!!selectedJobForApplicants}
        onClose={() => setSelectedJobForApplicants(null)}
      />

      <AdminDashboardModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onRefreshData={() => fetchJobsList(filters)}
      />

      <MyApplicationsModal
        isOpen={showMyApplicationsModal}
        onClose={() => setShowMyApplicationsModal(false)}
      />
    </>
  );
}

export default App;

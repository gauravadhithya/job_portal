import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ onOpenAuth, onOpenPostJob, onOpenAdminDashboard, onOpenMyApplications }) => {
  const { user, isAuthenticated, logout, isRecruiter, isJobSeeker, isAdmin } = useAuth();

  return (
    <header className="navbar">
      <div className="container nav-container">
        <div className="brand-logo">
          {/* Black & White Circle Ripple Icon */}
          <div className="logo-ripple-badge">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer Ripple */}
              <circle cx="12" cy="12" r="10" stroke="#0f172a" strokeWidth="1.5" strokeOpacity="0.25" />
              {/* Mid Ripple */}
              <circle cx="12" cy="12" r="6.8" stroke="#0f172a" strokeWidth="1.8" strokeOpacity="0.65" />
              {/* Inner Solid Circle */}
              <circle cx="12" cy="12" r="3.6" fill="#0f172a" />
            </svg>
          </div>
          <span>JobPortal</span>
        </div>

        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              {isJobSeeker && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={onOpenMyApplications}
                >
                  My Applications 📋
                </button>
              )}

              {isRecruiter && (
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={onOpenPostJob}
                >
                  + Post a Job
                </button>
              )}

              <div className="user-badge">
                <span>{user.name}</span>
                <span className="role-pill">{user.role}</span>
              </div>

              <button 
                className="btn btn-secondary btn-sm"
                onClick={logout}
              >
                Sign Out
              </button>
            </>
          ) : (
            <button 
              className="btn btn-primary"
              onClick={onOpenAuth}
            >
              Sign In / Register
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

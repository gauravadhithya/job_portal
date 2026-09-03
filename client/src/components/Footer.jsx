import React from 'react';
import {
  FiShield,
  FiZap,
  FiCheckCircle,
} from 'react-icons/fi';

export const Footer = ({ onOpenSignIn, onOpenSignUpJobSeeker, onOpenSignUpCompany }) => {
  return (
    <footer className="portal-footer">
      <div className="container">
        {/* Main Footer Content Grid */}
        <div className="footer-grid">
          {/* Column 1: Brand & About the Website */}
          <div className="footer-col-about">
            <div className="footer-brand-logo">
              <div
                className="logo-ripple-badge"
                style={{
                  width: '30px',
                  height: '30px',
                  background: '#1e293b',
                  borderColor: '#334155',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.3" />
                  <circle cx="12" cy="12" r="6.8" stroke="#ffffff" strokeWidth="1.8" strokeOpacity="0.75" />
                  <circle cx="12" cy="12" r="3.6" fill="#ffffff" />
                </svg>
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                JobPortal
              </span>
            </div>

            <p className="footer-about-text">
              JobPortal is a premier career network designed to bridge top-tier talent with verified hiring organizations. We empower job seekers with seamless resume applications and provide companies with modern hiring tools to recruit top professionals.
            </p>

            <div className="footer-badges-row">
              <span className="footer-pill-badge">
                <FiCheckCircle size={12} style={{ color: '#4ade80' }} /> Verified Companies
              </span>
              <span className="footer-pill-badge">
                <FiShield size={12} style={{ color: '#60a5fa' }} /> Secure Authentication
              </span>
              <span className="footer-pill-badge">
                <FiZap size={12} style={{ color: '#fbbf24' }} /> Instant Apply
              </span>
            </div>
          </div>

          {/* Column 2: For Candidates */}
          <div className="footer-col">
            <h4 className="footer-col-title">For Job Seekers</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" className="footer-link-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  Explore Opportunities
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={onOpenSignUpJobSeeker}>
                  Create Seeker Profile
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={onOpenSignIn}>
                  Track Applications
                </button>
              </li>
              <li>
                <span className="footer-link-text">Permanent Shareable URL</span>
              </li>
            </ul>
          </div>

          {/* Column 3: For Employers */}
          <div className="footer-col">
            <h4 className="footer-col-title">For Employers</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" className="footer-link-btn" onClick={onOpenSignUpCompany}>
                  Register Company Account
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={onOpenSignIn}>
                  Post Job Openings
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={onOpenSignIn}>
                  Manage Applicants
                </button>
              </li>
              <li>
                <span className="footer-link-text">Company Branding Pages</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Platform Overview & Governance */}
          <div className="footer-col">
            <h4 className="footer-col-title">About the Platform</h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Built with modern React, high-performance REST APIs, MongoDB cloud persistence, and responsive design principles.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

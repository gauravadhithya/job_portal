import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FiSearch,
  FiX,
  FiPlus,
  FiShield,
  FiLogOut,
  FiBriefcase,
  FiAward,
  FiMapPin,
  FiTrendingUp,
} from 'react-icons/fi';
import { BsBuilding } from 'react-icons/bs';

const POPULAR_SUGGESTIONS = [
  { label: 'Frontend Developer', type: 'Role' },
  { label: 'Full Stack Engineer', type: 'Role' },
  { label: 'Backend Developer', type: 'Role' },
  { label: 'React', type: 'Skill' },
  { label: 'Node.js', type: 'Skill' },
  { label: 'TypeScript', type: 'Skill' },
  { label: 'Python', type: 'Skill' },
  { label: 'Remote', type: 'Location' },
  { label: 'Bangalore', type: 'Location' },
  { label: 'New York', type: 'Location' },
];

export const Navbar = ({
  searchQuery = '',
  onSearchChange,
  onOpenAuth,
  onOpenPostJob,
  onOpenAdminDashboard,
  onNavigateHome,
  jobs = [],
}) => {
  const { isAuthenticated, logout, isCompany, isAdmin } = useAuth();
  const [isFocused, setIsFocused] = useState(false);
  const searchWrapperRef = useRef(null);

  const handleLogoClick = () => {
    if (onNavigateHome) onNavigateHome();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute dynamic suggestions from active jobs & defaults
  const suggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // Extract unique titles, skills, companies, locations from active jobs
    const jobTitles = new Set();
    const skills = new Set();
    const companies = new Set();
    const locations = new Set();

    jobs.forEach((job) => {
      if (job.title) jobTitles.add(job.title);
      if (job.companyName) companies.add(job.companyName);
      if (job.location) locations.add(job.location);
      if (Array.isArray(job.skills)) {
        job.skills.forEach((s) => s && skills.add(s));
      }
    });

    const allItems = [
      ...Array.from(jobTitles).map((t) => ({ label: t, type: 'Role' })),
      ...Array.from(skills).map((s) => ({ label: s, type: 'Skill' })),
      ...Array.from(companies).map((c) => ({ label: c, type: 'Company' })),
      ...Array.from(locations).map((l) => ({ label: l, type: 'Location' })),
      ...POPULAR_SUGGESTIONS,
    ];

    // Deduplicate by label
    const seen = new Set();
    const unique = [];
    allItems.forEach((item) => {
      const key = item.label.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    });

    if (!query) {
      return POPULAR_SUGGESTIONS.slice(0, 8);
    }

    return unique
      .filter((item) => item.label.toLowerCase().includes(query))
      .slice(0, 8);
  }, [searchQuery, jobs]);

  const handleSelectSuggestion = (label) => {
    if (onSearchChange) {
      onSearchChange(label);
    }
    setIsFocused(false);
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'Role':
        return <FiBriefcase size={13} style={{ color: '#0f172a' }} />;
      case 'Skill':
        return <FiAward size={13} style={{ color: '#2563eb' }} />;
      case 'Company':
        return <BsBuilding size={13} style={{ color: '#059669' }} />;
      case 'Location':
        return <FiMapPin size={13} style={{ color: '#d97706' }} />;
      default:
        return <FiTrendingUp size={13} style={{ color: '#64748b' }} />;
    }
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Left Side: Logo & Name */}
        <div className="brand-logo" onClick={handleLogoClick}>
          <div className="logo-ripple-badge">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" stroke="#0f172a" strokeWidth="1.5" strokeOpacity="0.25" />
              <circle cx="12" cy="12" r="6.8" stroke="#0f172a" strokeWidth="1.8" strokeOpacity="0.65" />
              <circle cx="12" cy="12" r="3.6" fill="#0f172a" />
            </svg>
          </div>
          <span>JobPortal</span>
        </div>

        {/* Center: Search Bar with Suggestions Dropdown */}
        {onSearchChange && (
          <div className="nav-search-wrapper" ref={searchWrapperRef}>
            <FiSearch className="nav-search-icon" size={15} />
            <input
              type="text"
              className="nav-search-input"
              placeholder="Search jobs, skills, companies, locations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              aria-label="Search jobs"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                className="nav-search-clear"
                onClick={() => onSearchChange('')}
                title="Clear search"
              >
                <FiX size={14} />
              </button>
            )}

            {/* Interactive Search Suggestions Dropdown */}
            {isFocused && suggestions.length > 0 && (
              <div className="nav-search-suggestions">
                <div className="search-suggestion-header">
                  {searchQuery.trim() ? 'Matching Suggestions' : 'Popular & Trending Searches'}
                </div>
                {suggestions.map((item, idx) => (
                  <div
                    key={`${item.label}-${idx}`}
                    className="search-suggestion-item"
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevents blur before click handles
                      handleSelectSuggestion(item.label);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getIconForType(item.type)}
                      <span style={{ fontWeight: 500 }}>{item.label}</span>
                    </div>
                    <span className="suggestion-type-badge">{item.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right Side: Actions & Sign In/Out */}
        <div className="nav-actions">
          {isAuthenticated ? (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={logout}
            >
              <FiLogOut size={13} /> Sign Out
            </button>
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

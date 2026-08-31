import React, { useState } from 'react';

export const JobSearchFilter = ({ onFilterChange, onReset }) => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange({ keyword, location, skills });
  };

  const handleReset = () => {
    setKeyword('');
    setLocation('');
    setSkills('');
    onReset();
  };

  return (
    <div className="search-card">
      <form onSubmit={handleSubmit}>
        <div className="filter-grid">
          <div className="input-group">
            <label className="input-label">Job Title / Keyword</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Developer, Designer..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Location</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Remote, New York..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Skills (comma separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. React, Node, Python..."
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Search Jobs
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

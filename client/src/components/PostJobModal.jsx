import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const PostJobModal = ({ isOpen, onClose, onSuccess }) => {
  const { token, user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    salary: '$80k - $110k / yr',
    skills: '',
    deadline: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
    setSubmitting(true);

    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      if (skillsArray.length === 0) {
        throw new Error('Please enter at least one skill requirement');
      }

      await api.createJob(
        {
          title: formData.title,
          description: formData.description,
          location: formData.location,
          salary: formData.salary,
          skills: skillsArray,
          deadline: formData.deadline,
          status: 'Open',
        },
        token
      );

      onSuccess('Job opportunity posted successfully!');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to post job');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Post a New Job</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Posting as <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong> (Company)
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label className="input-label">Job Title</label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g. Frontend Developer"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label className="input-label">Job Description</label>
            <textarea
              name="description"
              className="form-textarea"
              rows={4}
              placeholder="Outline responsibilities, day-to-day role, and candidate expectations..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div className="input-group">
              <label className="input-label">Location</label>
              <input
                type="text"
                name="location"
                className="form-input"
                placeholder="e.g. Remote, New York, London"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Salary Range</label>
              <input
                type="text"
                name="salary"
                className="form-input"
                placeholder="e.g. $80k - $110k / yr"
                value={formData.salary}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label className="input-label">Skills Required (comma separated)</label>
            <input
              type="text"
              name="skills"
              className="form-input"
              placeholder="React, TypeScript, CSS, Node, Git"
              value={formData.skills}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group" style={{ marginBottom: '1.5rem' }}>
            <label className="input-label">Application Deadline</label>
            <input
              type="date"
              name="deadline"
              className="form-input"
              value={formData.deadline}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem' }}
            disabled={submitting}
          >
            {submitting ? 'Publishing...' : 'Publish Job Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

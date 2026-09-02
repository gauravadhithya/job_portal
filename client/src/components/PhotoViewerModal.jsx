import React, { useState, useRef } from 'react';
import {
  FiX,
  FiUpload,
  FiTrash2,
  FiEdit2,
  FiUser,
  FiCheck,
} from 'react-icons/fi';

export const PhotoViewerModal = ({
  isOpen,
  onClose,
  currentImage = '',
  userName = 'User',
  onSavePhoto,
}) => {
  const [previewImage, setPreviewImage] = useState(currentImage);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    if (isOpen) {
      setPreviewImage(currentImage || '');
      setShowUrlInput(false);
      setUrlInput(currentImage || '');
      setUploadError('');
    }
  }, [isOpen, currentImage]);

  if (!isOpen) return null;

  // Handle local file upload from local device / folder
  const handleFileChange = (e) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, JPEG, WEBP, or SVG).');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setPreviewImage(dataUrl);
      setShowUrlInput(false);
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file from your device.');
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleDeletePhoto = () => {
    setPreviewImage('');
    setUrlInput('');
    setShowUrlInput(false);
  };

  const handleApplyUrl = (e) => {
    e.preventDefault();
    if (urlInput.trim()) {
      setPreviewImage(urlInput.trim());
      setShowUrlInput(false);
    }
  };

  const handleSaveAndClose = () => {
    onSavePhoto(previewImage);
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        zIndex: 1100,
      }}
    >
      <div
        className="modal-content photo-zoom-content"
        style={{
          maxWidth: '480px',
          padding: '2rem',
          textAlign: 'center',
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Profile Photo
          </h3>
          <button className="close-btn" onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>

        {uploadError && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem', fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}>
            {uploadError}
          </div>
        )}

        {/* Zoomed-In Profile Picture View */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '1rem 0 1.75rem',
          }}
        >
          {previewImage ? (
            <img
              src={previewImage}
              alt={userName}
              style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '5px solid #0f172a',
                boxShadow: '0 12px 24px -6px rgba(0, 0, 0, 0.2)',
                transition: 'transform 0.2s ease',
              }}
            />
          ) : (
            <div
              style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '4.5rem',
                fontWeight: 800,
                border: '5px solid #ffffff',
                boxShadow: '0 12px 24px -6px rgba(0, 0, 0, 0.2)',
              }}
            >
              {userName ? userName.charAt(0).toUpperCase() : <FiUser size={80} />}
            </div>
          )}
        </div>

        {/* Hidden native local file picker */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Action Toolbar: Upload (Local Folder), Edit, Delete */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Upload from Local Device / Folder */}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleTriggerUpload}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.9rem' }}
          >
            <FiUpload size={14} />Upload
          </button>

          {/* Edit / Paste Image URL */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowUrlInput(!showUrlInput)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.9rem' }}
          >
            <FiEdit2 size={14} /> Edit Image Link
          </button>

          {/* Delete Photo */}
          {previewImage && (
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleDeletePhoto}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.9rem' }}
            >
              <FiTrash2 size={14} /> Delete
            </button>
          )}
        </div>

        {/* Optional URL editor input */}
        {showUrlInput && (
          <form onSubmit={handleApplyUrl} style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.5rem' }}>
            <input
              type="url"
              className="form-input"
              placeholder="Paste direct image URL (https://...)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
              autoFocus
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Apply
            </button>
          </form>
        )}

        {/* Bottom Save Changes Button */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            style={{ flex: 1, padding: '0.65rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            onClick={handleSaveAndClose}
          >
            <FiCheck size={16} /> Save & Apply Photo
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '0.65rem 1rem' }}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

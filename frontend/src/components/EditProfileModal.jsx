import React, { useState, useRef } from 'react';
import { editProfile } from '../api';
import './EditProfileModal.css';

const EditProfileModal = ({ isOpen, onClose, userEmail, onProfileUpdate }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const modalRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');

    const response = await editProfile(token, {
      fullName,
      phone,
      bio
    });

    if (response.success) {
      setSuccess('Profile updated successfully!');
      setFullName('');
      setPhone('');
      setBio('');

      if (onProfileUpdate) {
        onProfileUpdate(response.user);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setError(response.message || 'Failed to update profile');
    }

    setLoading(false);
  };

  // Handle click outside modal to close
  const handleBackdropClick = (e) => {
    if (modalRef.current && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div ref={modalRef} className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Edit Profile</h2>
        </div>

        {error && <div className="alert-box alert-error">{error}</div>}
        {success && <div className="alert-box alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Full Name Input */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="form-input"
            />
          </div>

          {/* Phone Input */}
          <div className="form-group">
            <label className="form-label">Phone (Optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="form-input"
            />
          </div>

          {/* Bio Input */}
          <div className="form-group">
            <label className="form-label">Bio (Optional)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              rows="4"
              className="form-textarea"
            />
          </div>

          {/* Buttons */}
          <div className="modal-actions">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
            <button type="button" onClick={onClose} disabled={loading} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
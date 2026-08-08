import React, { useState, useRef } from 'react';
import { editProfile } from '../api';

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
    <div 
      className="modal-backdrop" 
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <div 
        ref={modalRef}
        className="modal-content"
        style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '12px',
          padding: '2rem',
          width: '90%',
          maxWidth: '450px',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
          animation: 'slideDown 0.3s ease-out'
        }}
      >
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#e5e7eb',
          marginBottom: '1.5rem',
          marginTop: 0
        }}>
          Edit Profile
        </h2>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            color: '#fca5a5',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.5)',
            color: '#86efac',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Full Name Input */}
          <div>
            <label style={{
              display: 'block',
              color: '#d1d5db',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
              style={{
                width: '100%',
                backgroundColor: '#0f0f0f',
                color: '#e5e7eb',
                padding: '0.75rem 1rem',
                border: '1px solid #333',
                borderRadius: '6px',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#333'}
            />
          </div>

          {/* Phone Input */}
          <div>
            <label style={{
              display: 'block',
              color: '#d1d5db',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Phone (Optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              style={{
                width: '100%',
                backgroundColor: '#0f0f0f',
                color: '#e5e7eb',
                padding: '0.75rem 1rem',
                border: '1px solid #333',
                borderRadius: '6px',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#333'}
            />
          </div>

          {/* Bio Input */}
          <div>
            <label style={{
              display: 'block',
              color: '#d1d5db',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Bio (Optional)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              rows="4"
              style={{
                width: '100%',
                backgroundColor: '#0f0f0f',
                color: '#e5e7eb',
                padding: '0.75rem 1rem',
                border: '1px solid #333',
                borderRadius: '6px',
                fontSize: '0.95rem',
                outline: 'none',
                resize: 'vertical',
                transition: 'border-color 0.2s',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#333'}
            />
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            paddingTop: '0.5rem'
          }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                backgroundColor: loading ? '#4b5563' : '#3b82f6',
                color: 'white',
                fontWeight: 'bold',
                padding: '0.75rem 1rem',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem',
                transition: 'background-color 0.2s',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#3b82f6')}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                backgroundColor: '#374151',
                color: 'white',
                fontWeight: 'bold',
                padding: '0.75rem 1rem',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem',
                transition: 'background-color 0.2s',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#4b5563')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#374151')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
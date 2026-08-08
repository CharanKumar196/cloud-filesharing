import React, { useState, useRef } from 'react';
import { createFeedback } from '../api';

const FeedbackModal = ({ isOpen, onClose }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
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

    const response = await createFeedback(token, {
      subject,
      message,
      rating: parseInt(rating)
    });

    if (response.success) {
      setSuccess('Thank you for your feedback!');
      setSubject('');
      setMessage('');
      setRating(5);

      // Close modal after 1.5 seconds
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setError(response.message || 'Failed to submit feedback');
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
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#e5e7eb',
            marginBottom: '0.5rem',
            marginTop: 0
          }}
        >
          Send Feedback
        </h2>
        <p
          style={{
            color: '#9ca3af',
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
            margin: '0.5rem 0 1.5rem 0'
          }}
        >
          Help us improve! Share your thoughts and suggestions.
        </p>

        {error && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              color: '#fca5a5',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.5)',
              color: '#86efac',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Subject */}
          <div>
            <label
              style={{
                display: 'block',
                color: '#d1d5db',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}
            >
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief subject"
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
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
              onBlur={(e) => (e.target.style.borderColor = '#333')}
            />
          </div>

          {/* Feedback Message */}
          <div>
            <label
              style={{
                display: 'block',
                color: '#d1d5db',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}
            >
              Your Feedback
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your thoughts, suggestions, or bug reports"
              rows="4"
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
                resize: 'vertical',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
              onBlur={(e) => (e.target.style.borderColor = '#333')}
            />
          </div>

          {/* Star Rating */}
          <div>
            <label
              style={{
                display: 'block',
                color: '#d1d5db',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.75rem'
              }}
            >
              Rating: <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{rating}/5</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    fontSize: '1.75rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: star <= rating ? '#fbbf24' : '#4b5563',
                    transition: 'color 0.2s, transform 0.2s',
                    padding: '0.25rem',
                    transform: 'scale(1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#fbbf24';
                    e.target.style.transform = 'scale(1.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = star <= rating ? '#fbbf24' : '#4b5563';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.5rem' }}>
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
              {loading ? 'Sending...' : 'Submit Feedback'}
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

export default FeedbackModal;
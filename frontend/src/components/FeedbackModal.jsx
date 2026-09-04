import React, { useState } from 'react';
import { createFeedback } from '../api';
import './FeedbackModal.css';

export default function FeedbackModal({ isOpen, onClose, token }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setSubject('');
    setMessage('');
    setRating(5);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError('Please fill in both subject and message.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await createFeedback(token, { subject, message, rating });
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setError(res.message || 'Failed to submit feedback.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="feedback-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="feedback-card">
        <div className="feedback-header">
          <h2 className="feedback-title">Send Feedback</h2>
          <button className="feedback-close-btn" onClick={handleClose}>✕</button>
        </div>

        {success ? (
          <div className="feedback-success">✅ Thanks for your feedback!</div>
        ) : (
          <form className="feedback-form" onSubmit={handleSubmit}>
            <div className="feedback-field">
              <label className="feedback-label">Subject</label>
              <input
                className="feedback-input"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What's this about?"
                maxLength={100}
              />
            </div>

            <div className="feedback-field">
              <label className="feedback-label">Message</label>
              <textarea
                className="feedback-textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us more..."
                rows={5}
                maxLength={1000}
              />
            </div>

            <div className="feedback-field">
              <label className="feedback-label">Rating</label>
              <div className="feedback-stars">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    type="button"
                    key={r}
                    className={`feedback-star-btn ${r <= rating ? 'active' : ''}`}
                    onClick={() => setRating(r)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {error && <div className="feedback-error">{error}</div>}

            <button type="submit" className="feedback-submit-btn" disabled={submitting}>
              {submitting ? 'Sending...' : 'Submit Feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
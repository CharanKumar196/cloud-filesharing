import React, { useState } from 'react';
import { createFeedback } from '../api';

const FeedbackModal = ({ isOpen, onClose }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-8 w-96 shadow-2xl border border-blue-500">
        <h2 className="text-2xl font-bold text-white mb-2">Send Feedback</h2>
        <p className="text-gray-400 text-sm mb-6">Help us improve! Share your thoughts and suggestions.</p>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-400 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief subject"
              required
              className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Your Feedback
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your thoughts, suggestions, or bug reports"
              rows="4"
              required
              className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Rating: <span className="text-blue-400 font-bold">{rating}/5</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl transition ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-600'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition"
            >
              {loading ? 'Sending...' : 'Submit Feedback'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition"
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
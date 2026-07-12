import React, { useState } from 'react';
import { editProfile } from '../api';

const EditProfileModal = ({ isOpen, onClose, userEmail, onProfileUpdate }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-8 w-96 shadow-2xl border border-blue-500">
        <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>

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
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Phone (Optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Bio (Optional)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              rows="4"
              className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition"
            >
              {loading ? 'Updating...' : 'Update Profile'}
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

export default EditProfileModal;
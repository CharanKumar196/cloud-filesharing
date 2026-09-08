import React, { useState } from 'react';
import './TermsModal.css';

const SECTIONS = {
  terms: {
    label: 'Terms',
    points: [
      'You must verify your email and keep your password confidential.',
      "Don't upload malware, illegal content, or files you don't have rights to.",
      'You keep ownership of your files — we just store and display them for you.',
      'We can suspend accounts that violate these terms; you can delete yours anytime.',
      'The Service is provided "as is" — please keep independent backups of important files.',
    ],
  },
  privacy: {
    label: 'Privacy',
    points: [
      'We collect your name, email, files, and basic usage data to run the Service.',
      'Passwords are hashed and files are encrypted in transit and at rest.',
      'We never sell your data and only share it with infra providers or when legally required.',
      'You can access, update, or delete your data anytime from account settings.',
      'Deleted files go to Trash first, then are permanently removed after the retention period.',
    ],
  },
  cookies: {
    label: 'Cookies',
    points: [
      'Essential cookies keep you signed in — the Service needs these to work.',
      'We use local storage to keep your session token on your device.',
      'Preference and analytics cookies help us remember settings and improve the Service.',
      'No third-party advertising cookies are used.',
      'You can block cookies in your browser, but core features may stop working.',
    ],
  },
};

export default function TermsModal({ isOpen, onClose }) {
  const [tab, setTab] = useState('terms');

  if (!isOpen) return null;

  return (
    <div
      className="terms-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="terms-modal-card">
        <div className="terms-modal-header">
          <h2 className="terms-modal-title">Terms & Conditions</h2>
          <button
            type="button"
            className="terms-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="terms-modal-subtitle">
          A quick summary — the full text is always available at{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer">/terms</a>.
        </p>

        <div className="terms-modal-tabs">
          {Object.entries(SECTIONS).map(([key, section]) => (
            <button
              key={key}
              type="button"
              className={`terms-tab-btn ${tab === key ? 'active' : ''}`}
              onClick={() => setTab(key)}
            >
              {section.label}
            </button>
          ))}
        </div>

        <ul className="terms-modal-list">
          {SECTIONS[tab].points.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>

        <button type="button" className="terms-modal-done-btn" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}
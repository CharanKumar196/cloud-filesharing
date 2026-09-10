import React, { useState, useEffect, useRef } from 'react';
import SendNotificationForm from '../SendNotificationForm';
import './AdminDashboard.css';
import {
  getAdminOverview,
  getAdminFeedback,
  markFeedbackReviewed,
  getAdminTrash,
  getAdminPurgeLog,
  getAdminSettings,
  updateAdminSettings,
  editProfile,
  changePassword,
} from '../../api';

const IconOverview = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
);
const IconFeedback = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
  </svg>
);
const IconTrashA = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
);
const IconSettingsA = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </svg>
);
const IconBellA = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);
const IconStar = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const IconUser = (props) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconKey = (props) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m21 2-9.6 9.6" />
    <path d="m15.5 7.5 3 3L22 7l-3-3" />
  </svg>
);
const IconMessage = (props) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
  </svg>
);
const IconLogOut = (props) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);
const IconBadge = ({ children, color = '#2563eb' }) => (
  <span className="icon-badge" style={{ backgroundColor: color }}>
    {children}
  </span>
);


const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(Math.max(1, bytes)) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function AdminDashboard({ token, onLogout }) {
  const [section, setSection] = useState('overview');
  const [settingsSubTab, setSettingsSubTab] = useState('platform');
  const [userName, setUserName] = useState('Admin');
  const [userEmail, setUserEmail] = useState('admin@example.com');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const name = localStorage.getItem('userName') || 'Admin';
    const email = localStorage.getItem('userEmail') || 'admin@example.com';
    setUserName(name);
    setUserEmail(email);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setShowUserDropdown(false);
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  };

  const goToProfile = () => {
    setShowUserDropdown(false);
    setSection('settings');
    setSettingsSubTab('profile');
  };

  const goToSecurity = () => {
    setShowUserDropdown(false);
    setSection('settings');
    setSettingsSubTab('security');
  };

  const goToFeedback = () => {
    setShowUserDropdown(false);
    setSection('feedback');
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1 className="admin-brand">Admin</h1>

        <div className="admin-user-menu-wrapper" ref={dropdownRef}>
          <button
            className="admin-user-profile-btn"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
          >
            <div className="admin-user-avatar-small">{userName.charAt(0).toUpperCase()}</div>
            <span className="admin-user-name-short">{userName}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {showUserDropdown && (
            <div className="admin-user-dropdown">
              <div className="admin-dropdown-header">
                <div className="admin-dropdown-avatar">{userName.charAt(0).toUpperCase()}</div>
                <div className="admin-dropdown-user-info">
                  <p className="admin-dropdown-name">{userName}</p>
                  <p className="admin-dropdown-email">{userEmail}</p>
                </div>
              </div>
              <div className="admin-dropdown-divider"></div>
              <button onClick={goToProfile} className="admin-dropdown-item">
                <IconUser /> Edit profile
              </button>
              <button onClick={goToSecurity} className="admin-dropdown-item">
                <IconKey /> Change password
              </button>
              <button onClick={goToFeedback} className="admin-dropdown-item">
                <IconMessage /> Feedback
              </button>
              <button className="admin-dropdown-item logout" onClick={handleLogoutClick}>
                <IconLogOut /> Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="admin-body">
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            <button className={`admin-nav-item ${section === 'overview' ? 'active' : ''}`} onClick={() => setSection('overview')}>
              <IconOverview /> Overview
            </button>
            <button className={`admin-nav-item ${section === 'feedback' ? 'active' : ''}`} onClick={() => setSection('feedback')}>
              <IconFeedback /> Feedback
            </button>
            <button className={`admin-nav-item ${section === 'notifications' ? 'active' : ''}`} onClick={() => setSection('notifications')}>
              <IconBellA /> Notifications
            </button>
            <button className={`admin-nav-item ${section === 'trash' ? 'active' : ''}`} onClick={() => setSection('trash')}>
              <IconTrashA /> Trash
            </button>
            <button className={`admin-nav-item ${section === 'settings' ? 'active' : ''}`} onClick={() => { setSection('settings'); setSettingsSubTab('platform'); }}>
              <IconSettingsA /> Settings
            </button>
          </nav>
        </aside>
        <main className="admin-main">
          {section === 'overview' && <OverviewSection token={token} />}
          {section === 'feedback' && <FeedbackSection token={token} />}
          {section === 'trash' && <TrashSection token={token} />}
          {section === 'notifications' && <NotificationsSection token={token} />}
          {section === 'settings' && (
            <SettingsSection
              token={token}
              subTab={settingsSubTab}
              setSubTab={setSettingsSubTab}
              userName={userName}
              userEmail={userEmail}
              setUserName={setUserName}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// ============================================
// OVERVIEW
// ============================================
function OverviewSection({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminOverview(token).then((res) => {
      if (res.success) setData(res);
      setLoading(false);
    });
  }, [token]);

  if (loading) return <div className="admin-loading">Loading overview…</div>;
  if (!data) return <div className="admin-empty">Couldn't load overview data.</div>;

  const maxTrend = Math.max(1, ...data.storageTrend.map((d) => d.cumulativeBytes));
  const breakdownTotal = Object.values(data.breakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Overview</h2>

      <div className="admin-stat-grid">
        <StatCard label="Total users" value={data.totalUsers} />
        <StatCard label="New this week" value={data.newUsersWeek} />
        <StatCard label="New this month" value={data.newUsersMonth} />
        <StatCard label="Total files" value={data.totalFiles} />
        <StatCard label="Total folders" value={data.totalFolders} />
        <StatCard label="Active share links" value={data.sharedLinksActive} />
        <StatCard label="Total storage used" value={formatBytes(data.totalStorageUsed)} wide />
      </div>

      <div className="admin-panel">
        <h3 className="admin-panel-title">Storage used — last 30 days</h3>
        <svg viewBox="0 0 600 140" className="admin-trend-svg" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="2.5"
            points={data.storageTrend
              .map((d, i) => `${(i / (data.storageTrend.length - 1)) * 600},${140 - (d.cumulativeBytes / maxTrend) * 130 - 5}`)
              .join(' ')}
          />
        </svg>
        <div className="admin-trend-labels">
          <span>{data.storageTrend[0]?.date}</span>
          <span>{data.storageTrend[data.storageTrend.length - 1]?.date}</span>
        </div>
      </div>

      <div className="admin-panel">
        <h3 className="admin-panel-title">Storage by file type</h3>
        {Object.entries(data.breakdown).map(([type, bytes]) => (
          <div key={type} className="admin-breakdown-row">
            <span className="admin-breakdown-label">{type}</span>
            <div className="admin-breakdown-bar">
              <div className="admin-breakdown-fill" style={{ width: `${(bytes / breakdownTotal) * 100}%` }}></div>
            </div>
            <span className="admin-breakdown-value">{formatBytes(bytes)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, wide }) {
  return (
    <div className={`admin-stat-card ${wide ? 'wide' : ''}`}>
      <p className="admin-stat-value">{value}</p>
      <p className="admin-stat-label">{label}</p>
    </div>
  );
}

// ============================================
// FEEDBACK MODERATION
// ============================================
function FeedbackSection({ token }) {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('');

  const load = () => {
    setLoading(true);
    getAdminFeedback(token, ratingFilter ? { rating: ratingFilter } : {}).then((res) => {
      if (res.success) setFeedback(res.feedback);
      setLoading(false);
    });
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [ratingFilter]);

  const toggleReviewed = async (id, current) => {
    await markFeedbackReviewed(token, id, !current);
    load();
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header-row">
        <h2 className="admin-section-title">Feedback</h2>
        <select className="admin-select" value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
          <option value="">All ratings</option>
          {[1, 2, 3, 4, 5].map((r) => <option key={r} value={r}>{r} star{r > 1 ? 's' : ''}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="admin-loading">Loading…</div>
      ) : feedback.length === 0 ? (
        <div className="admin-empty">No feedback yet.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Subject</th><th>Message</th><th>Rating</th><th>From</th><th>Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((f) => (
                <tr key={f.id} className={f.reviewed ? 'reviewed' : ''}>
                  <td>{f.subject}</td>
                  <td className="admin-td-message">{f.message}</td>
                  <td>
                    <span className="admin-rating">
                      {f.rating} <IconStar />
                    </span>
                  </td>
                  <td>{f.users?.fullName || f.users?.email || '—'}</td>
                  <td>{formatDate(f.created_at)}</td>
                  <td>
                    <button className={`admin-review-btn ${f.reviewed ? 'done' : ''}`} onClick={() => toggleReviewed(f.id, f.reviewed)}>
                      {f.reviewed ? 'Reviewed' : 'Mark reviewed'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================
// TRASH MONITORING
// ============================================
function TrashSection({ token }) {
  const [trash, setTrash] = useState({ files: [], folders: [] });
  const [log, setLog] = useState([]);
  const [tab, setTab] = useState('current');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminTrash(token), getAdminPurgeLog(token)]).then(([trashRes, logRes]) => {
      if (trashRes.success) setTrash(trashRes);
      if (logRes.success) setLog(logRes.log);
      setLoading(false);
    });
  }, [token]);

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Trash</h2>
      <div className="admin-subtabs">
        <button className={`admin-subtab-btn ${tab === 'current' ? 'active' : ''}`} onClick={() => setTab('current')}>Currently in Trash</button>
        <button className={`admin-subtab-btn ${tab === 'log' ? 'active' : ''}`} onClick={() => setTab('log')}>Purge log</button>
      </div>

      {loading ? (
        <div className="admin-loading">Loading…</div>
      ) : tab === 'current' ? (
        (trash.files.length === 0 && trash.folders.length === 0) ? (
          <div className="admin-empty">Nothing in Trash platform-wide.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Type</th><th>User</th><th>Days left</th></tr></thead>
              <tbody>
                {trash.folders.map((f) => (
                  <tr key={`folder-${f.id}`}>
                    <td>{f.name}</td><td>Folder</td>
                    <td>{f.users?.fullName || f.users?.email || '—'}</td>
                    <td>{f.daysLeft}</td>
                  </tr>
                ))}
                {trash.files.map((f) => (
                  <tr key={`file-${f.id}`}>
                    <td>{f.filename}</td><td>File</td>
                    <td>{f.users?.fullName || f.users?.email || '—'}</td>
                    <td>{f.daysLeft}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        log.length === 0 ? (
          <div className="admin-empty">Nothing purged yet.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Type</th><th>User</th><th>Deleted</th><th>Purged</th></tr></thead>
              <tbody>
                {log.map((l) => (
                  <tr key={l.id}>
                    <td>{l.item_name}</td>
                    <td style={{ textTransform: 'capitalize' }}>{l.item_type}</td>
                    <td>{l.users?.fullName || l.users?.email || '—'}</td>
                    <td>{formatDate(l.deleted_at)}</td>
                    <td>{formatDate(l.purged_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
// ============================================
// NOTIFICATIONS (broadcast to all users)
// ============================================
function NotificationsSection({ token }) {
  return (
    <div className="admin-section">
      <h2 className="admin-section-title admin-title-with-icon">
        <IconBadge><IconBellA /></IconBadge> Notifications
      </h2>
      <SendNotificationForm />
    </div>
  );
}
// ============================================
// SETTINGS (Profile / Security / Platform)
// ============================================
function SettingsSection({ token, subTab, setSubTab, userName, userEmail, setUserName }) {
  // ---- Profile form state ----
  const [profileFullName, setProfileFullName] = useState(userName);
  const [profilePhone, setProfilePhone] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    setProfileFullName(userName);
  }, [userName]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    setProfileMessage('');
    try {
      const response = await editProfile(token, {
        fullName: profileFullName,
        phone: profilePhone,
        bio: profileBio,
      });
      if (response.success) {
        setProfileMessage('Profile updated successfully!');
        const newName = response.user?.fullName || profileFullName;
        setUserName(newName);
        localStorage.setItem('userName', newName);
      } else {
        setProfileError(response.message || 'Failed to update profile');
      }
    } catch (error) {
      setProfileError('Failed to update profile');
    }
    setProfileSaving(false);
  };

  // ---- Security form state ----
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await changePassword(token, { currentPassword, newPassword });
      if (res.success) {
        setPasswordMessage('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setPasswordError(res.message || 'Failed to update password.');
      }
    } catch (error) {
      setPasswordError('Failed to update password.');
    }
    setPasswordSaving(false);
  };

  // ---- Platform settings state ----
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    getAdminSettings(token).then((res) => { if (res.success) setSettings(res.settings); });
  }, [token]);

  const savePlatformSettings = async () => {
    setSaving(true);
    const res = await updateAdminSettings(token, {
      defaultStorageLimit: settings.default_storage_limit,
      allowSignups: settings.allow_signups,
      maintenanceMode: settings.maintenance_mode,
    });
    if (res.success) {
      setSettings(res.settings);
      setSavedMessage('Settings saved!');
      setTimeout(() => setSavedMessage(''), 2000);
    }
    setSaving(false);
  };

  // ---- Storage summary (for the mini card) ----
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    getAdminOverview(token).then((res) => {
      if (res.success) setOverview(res);
    });
  }, [token]);

  const breakdownTotal = overview
    ? Object.values(overview.breakdown).reduce((a, b) => a + b, 0) || 1
    : 1;

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Settings</h2>

      <div className="admin-settings-grid">
        <div className="admin-settings-main">
          <div className="admin-subtabs">
            <button className={`admin-subtab-btn ${subTab === 'profile' ? 'active' : ''}`} onClick={() => setSubTab('profile')}>
              Profile
            </button>
            <button className={`admin-subtab-btn ${subTab === 'security' ? 'active' : ''}`} onClick={() => setSubTab('security')}>
              Security
            </button>
            <button className={`admin-subtab-btn ${subTab === 'platform' ? 'active' : ''}`} onClick={() => setSubTab('platform')}>
              Platform
            </button>
          </div>

          {subTab === 'profile' && (
            <div className="admin-panel">
              <h3 className="admin-panel-title">Personal information</h3>
              {profileError && <div className="admin-alert error">{profileError}</div>}
              {profileMessage && <div className="admin-alert success">{profileMessage}</div>}
              <form onSubmit={handleSaveProfile}>
                <div className="admin-field">
                  <label className="admin-field-label">Full name</label>
                  <input
                    className="admin-field-input"
                    type="text"
                    value={profileFullName}
                    onChange={(e) => setProfileFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-field-label">Email</label>
                  <input className="admin-field-input" type="email" value={userEmail} disabled />
                </div>
                <div className="admin-field">
                  <label className="admin-field-label">Phone (Optional)</label>
                  <input
                    className="admin-field-input"
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-field-label">Bio</label>
                  <textarea
                    className="admin-field-input"
                    rows="3"
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    placeholder="Tell us about yourself"
                  />
                </div>
                <button type="submit" className="admin-save-btn" disabled={profileSaving}>
                  {profileSaving ? 'Saving...' : 'Save changes'}
                </button>
              </form>
            </div>
          )}

          {subTab === 'security' && (
            <div className="admin-panel">
              <h3 className="admin-panel-title">Password &amp; access</h3>
              {passwordError && <div className="admin-alert error">{passwordError}</div>}
              {passwordMessage && <div className="admin-alert success">{passwordMessage}</div>}
              <form onSubmit={handleChangePassword}>
                <div className="admin-field">
                  <label className="admin-field-label">Current password</label>
                  <input
                    className="admin-field-input"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-field-label">New password</label>
                  <input
                    className="admin-field-input"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-field-label">Confirm new password</label>
                  <input
                    className="admin-field-input"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <button type="submit" className="admin-save-btn" disabled={passwordSaving}>
                  {passwordSaving ? 'Updating...' : 'Update password'}
                </button>
              </form>
            </div>
          )}

          {subTab === 'platform' && (
            settings ? (
              <div className="admin-panel">
                <div className="admin-field">
                  <label className="admin-field-label">Default storage limit for new users (GB)</label>
                  <input
                    className="admin-field-input"
                    type="number"
                    value={(settings.default_storage_limit / (1024 * 1024 * 1024)).toFixed(1)}
                    onChange={(e) => setSettings({ ...settings, default_storage_limit: Math.round(Number(e.target.value) * 1024 * 1024 * 1024) })}
                  />
                </div>

                <div className="admin-toggle-row">
                  <span>Allow new signups</span>
                  <button
                    className={`admin-switch ${settings.allow_signups ? 'on' : ''}`}
                    onClick={() => setSettings({ ...settings, allow_signups: !settings.allow_signups })}
                  >
                    <span className="admin-switch-knob"></span>
                  </button>
                </div>

                <div className="admin-toggle-row">
                  <span>Maintenance mode</span>
                  <button
                    className={`admin-switch ${settings.maintenance_mode ? 'on' : ''}`}
                    onClick={() => setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode })}
                  >
                    <span className="admin-switch-knob"></span>
                  </button>
                </div>

                {savedMessage && <div className="admin-alert success">{savedMessage}</div>}

                <button className="admin-save-btn" onClick={savePlatformSettings} disabled={saving}>
                  {saving ? 'Saving...' : 'Save settings'}
                </button>
              </div>
            ) : (
              <div className="admin-loading">Loading…</div>
            )
          )}
        </div>

        {/* ---- Storage mini card (fills the empty right column) ---- */}
        <aside className="admin-storage-mini-card">
          <h3 className="admin-panel-title">Storage overview</h3>
          {!overview ? (
            <div className="admin-loading">Loading…</div>
          ) : (
            <>
              <p className="admin-storage-mini-total">{formatBytes(overview.totalStorageUsed)}</p>
              <p className="admin-storage-mini-sub">across all users</p>
              {Object.entries(overview.breakdown).map(([type, bytes]) => (
                <div key={type} className="admin-breakdown-row mini">
                  <span className="admin-breakdown-label">{type}</span>
                  <div className="admin-breakdown-bar">
                    <div className="admin-breakdown-fill" style={{ width: `${(bytes / breakdownTotal) * 100}%` }}></div>
                  </div>
                  <span className="admin-breakdown-value">{formatBytes(bytes)}</span>
                </div>
              ))}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
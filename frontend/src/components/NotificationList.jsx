import { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead } from '../api';

function NotificationList({ onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    getNotifications(token).then((data) => {
      if (data.success) {
        setNotifications(data.notifications);
        const unread = data.notifications.filter(n => !n.isRead).length;
        onUnreadCountChange?.(unread);
      }
      setLoading(false);
    });
  }, [onUnreadCountChange]);

  const handleOpen = async (id) => {
    const token = localStorage.getItem('token');
    await markNotificationRead(token, id);
    setNotifications(prev => {
      const updated = prev.map(n => (n.id === id ? { ...n, isRead: true } : n));
      const unread = updated.filter(n => !n.isRead).length;
      onUnreadCountChange?.(unread);
      return updated;
    });
  };

  if (loading) return <p style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '12px 16px' }}>Loading...</p>;

  if (notifications.length === 0) {
    return <p style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '12px 16px' }}>No notifications yet.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {notifications.map(n => (
        <div
          key={n.id}
          onClick={() => handleOpen(n.id)}
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            border: 'none',
            background: n.isRead ? 'white' : '#eff6ff',
            cursor: 'pointer',
            transition: 'background 0.15s'

          }}
        >
          <p style={{ fontWeight: 500, margin: 0 }}>{n.title}</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>{n.message}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {new Date(n.created_at).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}

export default NotificationList;
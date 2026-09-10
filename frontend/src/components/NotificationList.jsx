import { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead } from '../api';

function NotificationList({ onUnreadCountChange, onItemClick }) {
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

  const handleOpen = async (n) => {
    const token = localStorage.getItem('token');
    if (!n.isRead) {
      await markNotificationRead(token, n.id);
      setNotifications(prev => {
        const updated = prev.map(x => (x.id === n.id ? { ...x, isRead: true } : x));
        const unread = updated.filter(x => !x.isRead).length;
        onUnreadCountChange?.(unread);
        return updated;
      });
    }
    onItemClick?.(n);
  };

  if (loading) return <p style={{ fontSize: 13, color: '#6b7280', padding: '12px 16px' }}>Loading...</p>;

  if (notifications.length === 0) {
    return <p style={{ fontSize: 13, color: '#6b7280', padding: '12px 16px' }}>No notifications yet.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {notifications.map(n => (
        <div
          key={n.id}
          onClick={() => handleOpen(n)}
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            border: 'none',
            background: n.isRead ? 'white' : '#eff6ff',
            cursor: 'pointer'
          }}
        >
          <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>{n.title}</p>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>{n.message}</p>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0' }}>
            {new Date(n.created_at).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}

export default NotificationList;
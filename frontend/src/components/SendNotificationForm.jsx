import { useState, useEffect } from 'react';
import { sendNotification, getNotifications, deleteNotification, deleteAllNotifications } from '../api';

function SendNotificationForm() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const typeLabels = { info: 'Informational', warning: 'Warning', billing: 'Billing' };
  const token = localStorage.getItem('token');

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await getNotifications(token);
      if (res.success) setHistory(res.notifications);
    } catch (err) {
      console.error('Failed to load notification history:', err);
    }
    setHistoryLoading(false);
  };

  useEffect(() => { loadHistory(); }, []);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      setStatus('Enter a title and message first.');
      return;
    }

    setSending(true);
    setStatus('');
    try {
      const data = await sendNotification(token, { title, message, type });
      if (!data.success) throw new Error(data.message || 'Send failed');

      setStatus('Sent to all users.');
      setTitle('');
      setMessage('');
      loadHistory();
    } catch (err) {
      setStatus(err.message || 'Failed to send. Try again.');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteOne = async (id) => {
    if (!window.confirm('Delete this message for everyone? This cannot be undone.')) return;
    const res = await deleteNotification(token, id);
    if (res.success) {
      setHistory(prev => prev.filter(m => m.id !== id));
      if (selected?.id === id) setSelected(null);
    }
  };

  const handleDeleteAll = async () => {
    if (history.length === 0) return;
    if (!window.confirm('Delete ALL broadcast messages for everyone? This cannot be undone.')) return;
    const res = await deleteAllNotifications(token);
    if (res.success) {
      setHistory([]);
      setSelected(null);
    }
  };

    return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      {/* ===== Send form ===== */}
      <div style={{
        background: 'white', border: '1px solid #e5e7eb', borderRadius: 14,
        padding: '24px 28px', flex: '1 1 480px', maxWidth: 640
      }}>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 0.6,
          color: '#111827', textTransform: 'uppercase'
        }}>
          Send a broadcast notification
        </span>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '6px 0 20px' }}>
          This message will be instantly visible to every user currently active on the platform.
        </p>

        <label style={{
          fontSize: 11, fontWeight: 600, letterSpacing: 0.4, color: '#9ca3af',
          textTransform: 'uppercase', display: 'block', marginBottom: 6
        }}>
          Title
        </label>
        <input
          placeholder="Title (e.g. Storage pricing update)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box', padding: '10px 12px',
            fontSize: 14, border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 18
          }}
        />

        <label style={{
          fontSize: 11, fontWeight: 600, letterSpacing: 0.4, color: '#9ca3af',
          textTransform: 'uppercase', display: 'block', marginBottom: 6
        }}>
          Message
        </label>
        <textarea
          placeholder="Message to all users..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          style={{
            width: '100%', boxSizing: 'border-box', padding: '10px 12px',
            fontSize: 14, border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 20, resize: 'vertical'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{
              padding: '8px 14px', fontSize: 13, fontWeight: 500,
              border: '1px solid #e5e7eb', borderRadius: 20, background: 'white', color: '#374151'
            }}
          >
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <button
            onClick={handleSend}
            disabled={sending}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#2563eb', color: 'white', border: 'none',
              borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600,
              cursor: sending ? 'default' : 'pointer', opacity: sending ? 0.7 : 1
            }}
          >
            {sending ? 'Sending...' : <>Send to all users <span>→</span></>}
          </button>
        </div>

        {status && <p style={{ fontSize: 13, color: '#6b7280', marginTop: 14 }}>{status}</p>}

        <div style={{
          borderTop: '1px solid #f3f4f6', marginTop: 24, paddingTop: 14,
          display: 'flex', justifyContent: 'space-between',
          fontSize: 11, color: '#9ca3af', letterSpacing: 0.3
        }}>
          <span>• Broadcast channel online</span>
          <span>CloudShare admin</span>
        </div>
      </div>

      {/* ===== Message history ===== */}
        <div style={{
        background: 'white', border: '1px solid #e5e7eb', borderRadius: 14,
        padding: '24px 28px', flex: '1 1 480px', maxWidth: 640
      }}>
        {selected ? (
          <div>
            <button
              onClick={() => setSelected(null)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 13, color: '#2563eb', padding: 0, marginBottom: 16
              }}
            >
              ← Back to messages
            </button>

            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: 0.3,
              padding: '3px 8px', borderRadius: 6, marginBottom: 10,
              background: selected.type === 'billing' ? '#fef3c7'
                : selected.type === 'warning' ? '#fee2e2' : '#dbeafe',
              color: selected.type === 'billing' ? '#92400e'
                : selected.type === 'warning' ? '#991b1b' : '#1e40af'
            }}>
              {selected.type || 'info'}
            </span>

            <h2 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 6px' }}>{selected.title}</h2>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 20px' }}>
              {new Date(selected.created_at).toLocaleString()}
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: '#374151', whiteSpace: 'pre-wrap', marginBottom: 24 }}>
              {selected.message}
            </p>

            <button
              onClick={() => handleDeleteOne(selected.id)}
              style={{
                background: '#fee2e2', color: '#991b1b', border: 'none',
                borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}
            >
              Delete this message
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: 0.6,
                color: '#111827', textTransform: 'uppercase'
              }}>
                Recent messages
              </span>
              {history.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, color: '#991b1b'
                  }}
                >
                  Delete all
                </button>
              )}
            </div>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>
              Everything sent so far. Click a message to view or delete it.
            </p>

            {historyLoading ? (
              <p style={{ fontSize: 13, color: '#9ca3af' }}>Loading...</p>
            ) : history.length === 0 ? (
              <p style={{ fontSize: 13, color: '#9ca3af' }}>Nothing sent yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {history.map(msg => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '12px 0', borderBottom: '1px solid #f3f4f6'
                    }}
                  >
                    <div
                      onClick={() => setSelected(msg)}
                      style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                    >
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>{msg.title}</p>
                      <p style={{
                        margin: '2px 0 0', fontSize: 13, color: '#6b7280',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        {msg.message}
                      </p>
                    </div>
                    <span style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0, paddingTop: 2 }}>
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDeleteOne(msg.id)}
                      title="Delete"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#9ca3af', fontSize: 16, padding: '0 4px', flexShrink: 0
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SendNotificationForm;
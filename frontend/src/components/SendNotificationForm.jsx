import { useState } from 'react';
import { sendNotification } from '../api';

function SendNotificationForm() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      setStatus('Enter a title and message first.');
      return;
    }

    setSending(true);
    setStatus('');
    try {
      const token = localStorage.getItem('token');
      const data = await sendNotification(token, { title, message, type });

      if (!data.success) throw new Error(data.message || 'Send failed');

      setStatus('Sent to all users.');
      setTitle('');
      setMessage('');
    } catch (err) {
      setStatus(err.message || 'Failed to send. Try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: 480 }}>
      <input
        placeholder="Title (e.g. Storage pricing update)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Message to all users..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
      />
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="info">Info</option>
        <option value="warning">Warning</option>
        <option value="billing">Billing</option>
      </select>
      <button onClick={handleSend} disabled={sending}>
        {sending ? 'Sending...' : 'Send to all users'}
      </button>
      {status && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{status}</p>}
    </div>
  );
}

export default SendNotificationForm;
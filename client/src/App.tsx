import { useState, useEffect } from 'react';
import { setupPushNotifications } from './push-notifications';
import { getNotifications, sendNotification } from './api';
import './App.css';

interface Notification {
  title: string;
  body: string;
  timestamp: string;
}

function App() {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial load push registration
    setupPushNotifications().catch(err => console.error('Push setup failed:', err));
    
    // Fetch initial history
    fetchHistory();
    
    // Polling history every 5 seconds for visual updates in this demo
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchHistory = async () => {
    const data = await getNotifications();
    setHistory(data);
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      await sendNotification(message);
      setMessage('');
      await fetchHistory();
    } catch (err) {
      alert('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Broadcast Push</h1>
      
      <div className="card">
        <h3>Send Notification</h3>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter notification message..."
          rows={4}
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? 'Sending...' : 'Send Notification'}
        </button>
      </div>

      <div className="history">
        <h3>History</h3>
        {history.length === 0 ? (
          <p>No notifications sent yet.</p>
        ) : (
          <ul>
            {history.map((notif, idx) => (
              <li key={idx}>
                <div className="notif-body">{notif.body}</div>
                <div className="notif-time">{new Date(notif.timestamp).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;

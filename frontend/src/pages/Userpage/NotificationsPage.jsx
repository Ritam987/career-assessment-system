import React, { useState, useEffect } from 'react';
import { FaCheck, FaClipboardList, FaCheckCircle, FaFilePdf, FaBullhorn, FaGift, FaInfoCircle } from 'react-icons/fa';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        credentials: 'include'
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getIcon = (type, title) => {
    if (title?.includes('Reminder') || type === 'reminder') return <FaClipboardList className="icon-blue" />;
    if (title?.includes('Completed') || type === 'completed') return <FaCheckCircle className="icon-green" />;
    if (title?.includes('Report') || type === 'report') return <FaFilePdf className="icon-purple" />;
    if (title?.includes('Update') || type === 'update') return <FaBullhorn className="icon-amber" />;
    return <FaGift className="icon-pink" />;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="notifications-container">
      <div className="notif-header">
        <div>
          <h1 className="notif-title">Notifications</h1>
        </div>
        <button className="btn-mark-read" onClick={handleMarkAllAsRead}>
          <FaCheck /> <span>Mark all as read</span>
        </button>
      </div>

      {loading ? (
        <div className="notif-loading">Loading notifications...</div>
      ) : (
        <div className="notif-list">
          {notifications.map((notif) => {
            const isUnread = !notif.is_read;
            return (
              <div
                key={notif.id}
                className={`notif-card glass-card ${isUnread ? 'unread-card' : ''}`}
              >
                <div className="notif-icon-box">
                  {getIcon(notif.type, notif.title)}
                </div>

                <div className="notif-content">
                  <div className="notif-top-row">
                    <h3 className="notif-item-title">{notif.title}</h3>
                    <span className="notif-time">{formatTime(notif.created_at)}</span>
                  </div>
                  <p className="notif-message">{notif.message}</p>
                </div>

                {isUnread && <span className="unread-blue-dot" title="Unread"></span>}
              </div>
            );
          })}

          <div className="notif-footer-note">
            <FaInfoCircle /> <span>Unread notifications are shown in blue.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;

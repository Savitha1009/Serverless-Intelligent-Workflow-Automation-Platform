import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Check,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { notificationApi } from '../services/api';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD, ERROR, SUCCESS

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const list = await notificationApi.getAll();
      setNotifications(list);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.is_read;
    if (filter === 'ERROR') return n.notification_type === 'ERROR';
    if (filter === 'SUCCESS') return n.notification_type === 'SUCCESS';
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle2 size={18} color="#34d399" />;
      case 'ERROR':
        return <XCircle size={18} color="#f87171" />;
      case 'WARNING':
        return <AlertTriangle size={18} color="#fbbf24" />;
      case 'INFO':
      default:
        return <Info size={18} color="#38bdf8" />;
    }
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem' }}>Notification Hub</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Event alerts, execution results, and Step Functions failure notifications.
          </p>
        </div>

        <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
          <Check size={14} /> Mark All as Read
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['ALL', 'UNREAD', 'SUCCESS', 'ERROR'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`btn btn-sm ${filter === tab ? 'btn-primary' : 'btn-ghost'}`}
            style={{ textTransform: 'capitalize' }}
          >
            {tab.toLowerCase()}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Loading alerts...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Bell size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>No Notifications</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              You're all caught up! New execution events will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map((notif) => (
              <div
                key={notif.notification_id}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: notif.is_read ? 'rgba(15, 23, 42, 0.4)' : 'rgba(99, 102, 241, 0.08)',
                  border: `1px solid ${notif.is_read ? 'var(--border-subtle)' : 'var(--border-active)'}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ marginTop: '2px' }}>{getIcon(notif.notification_type)}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        {notif.title}
                      </span>
                      {!notif.is_read && (
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary-500)'
                          }}
                        />
                      )}
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem', lineHeight: '1.4' }}>
                      {notif.message}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(notif.created_at).toLocaleString()}
                      </span>

                      {notif.execution_id && (
                        <Link
                          to={`/executions/${notif.execution_id}`}
                          style={{
                            fontSize: '0.75rem',
                            color: '#818cf8',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          View Execution <ExternalLink size={11} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(notif.notification_id)}
                    className="btn btn-ghost btn-sm"
                    title="Mark as read"
                    style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                  >
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

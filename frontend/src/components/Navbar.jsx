import React from 'react';
import { Bell, Plus, LogOut, User, Shield, Terminal } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ notificationCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: 'rgba(12, 19, 34, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 30
      }}
    >
      {/* Title / Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <Terminal size={15} color="#818cf8" />
          <span>Serverless Orchestrator Console</span>
        </div>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Quick Create Button */}
        <Link to="/workflows/create" className="btn btn-primary btn-sm">
          <Plus size={15} />
          <span>New Workflow</span>
        </Link>

        {/* Notifications Icon Button */}
        <Link
          to="/notifications"
          className="btn btn-ghost"
          style={{ position: 'relative', padding: '0.55rem', borderRadius: '50%' }}
          title="Notifications"
        >
          <Bell size={18} color="var(--text-secondary)" />
          {notificationCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                backgroundColor: 'var(--primary-500)',
                borderRadius: '50%',
                boxShadow: '0 0 8px var(--primary-500)'
              }}
            />
          )}
        </Link>

        {/* User Profile Pill */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.75rem', borderLeft: '1px solid var(--border-subtle)' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {user.role}
              </div>
            </div>

            <img
              src={user.avatarUrl}
              alt={user.name}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '2px solid var(--border-medium)',
                objectFit: 'cover'
              }}
            />

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="btn btn-ghost"
              style={{ padding: '0.4rem', color: 'var(--text-muted)' }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-secondary btn-sm">
            <User size={14} />
            <span>Login</span>
          </Link>
        )}
      </div>
    </header>
  );
};

import React from 'react';

export const MetricCard = ({ title, value, icon: Icon, changeText, changeType = 'positive', color = 'indigo' }) => {
  const colorMap = {
    indigo: {
      border: 'rgba(99, 102, 241, 0.3)',
      bgIcon: 'rgba(99, 102, 241, 0.15)',
      textIcon: '#818cf8',
      glow: 'rgba(99, 102, 241, 0.2)'
    },
    emerald: {
      border: 'rgba(16, 185, 129, 0.3)',
      bgIcon: 'rgba(16, 185, 129, 0.15)',
      textIcon: '#34d399',
      glow: 'rgba(16, 185, 129, 0.2)'
    },
    amber: {
      border: 'rgba(245, 158, 11, 0.3)',
      bgIcon: 'rgba(245, 158, 11, 0.15)',
      textIcon: '#fbbf24',
      glow: 'rgba(245, 158, 11, 0.2)'
    },
    rose: {
      border: 'rgba(239, 68, 68, 0.3)',
      bgIcon: 'rgba(239, 68, 68, 0.15)',
      textIcon: '#f87171',
      glow: 'rgba(239, 68, 68, 0.2)'
    },
    cyan: {
      border: 'rgba(6, 182, 212, 0.3)',
      bgIcon: 'rgba(6, 182, 212, 0.15)',
      textIcon: '#38bdf8',
      glow: 'rgba(6, 182, 212, 0.2)'
    }
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.25rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
        borderLeft: `4px solid ${scheme.textIcon}`
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          <div style={{ fontSize: '1.875rem', fontWeight: 700, marginTop: '0.35rem', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {value}
          </div>
        </div>
        <div
          style={{
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: scheme.bgIcon,
            color: scheme.textIcon,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {Icon && <Icon size={22} />}
        </div>
      </div>

      {changeText && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: changeType === 'positive' ? '#34d399' : '#f87171', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span>{changeType === 'positive' ? '↑' : '↓'}</span>
          <span>{changeText}</span>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Play, Calendar, Zap } from 'lucide-react';

export const TriggerBadge = ({ trigger }) => {
  const norm = (trigger || '').toUpperCase();

  switch (norm) {
    case 'SCHEDULED':
      return (
        <span className="badge badge-purple">
          <Calendar size={13} />
          Scheduled
        </span>
      );
    case 'EVENT':
      return (
        <span className="badge badge-info">
          <Zap size={13} />
          EventBridge
        </span>
      );
    case 'MANUAL':
    default:
      return (
        <span className="badge badge-neutral">
          <Play size={13} />
          Manual
        </span>
      );
  }
};

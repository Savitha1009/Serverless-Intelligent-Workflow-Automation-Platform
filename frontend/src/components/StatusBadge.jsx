import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Clock, PlayCircle } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const normalized = (status || '').toUpperCase();

  switch (normalized) {
    case 'ACTIVE':
    case 'SUCCEEDED':
      return (
        <span className="badge badge-success">
          <CheckCircle2 size={13} />
          {normalized === 'ACTIVE' ? 'Active' : 'Succeeded'}
        </span>
      );
    case 'INACTIVE':
      return (
        <span className="badge badge-neutral">
          <Clock size={13} />
          Inactive
        </span>
      );
    case 'RUNNING':
      return (
        <span className="badge badge-info">
          <PlayCircle size={13} className="animate-spin" />
          Running
        </span>
      );
    case 'FAILED':
      return (
        <span className="badge badge-danger">
          <XCircle size={13} />
          Failed
        </span>
      );
    case 'TIMED_OUT':
      return (
        <span className="badge badge-warning">
          <AlertCircle size={13} />
          Timed Out
        </span>
      );
    default:
      return (
        <span className="badge badge-neutral">
          {status}
        </span>
      );
  }
};

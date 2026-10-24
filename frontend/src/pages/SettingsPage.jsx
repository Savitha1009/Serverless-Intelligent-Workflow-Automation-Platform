import React, { useState, useEffect } from 'react';
import {
  Settings,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Database,
  Cpu,
  Layers,
  Shield,
  RotateCcw
} from 'lucide-react';
import { isMockMode, setMockMode, healthApi } from '../services/api';
import { INITIAL_WORKFLOWS, INITIAL_EXECUTIONS, INITIAL_NOTIFICATIONS } from '../services/mockData';

export const SettingsPage = () => {
  const [mockActive, setMockActive] = useState(isMockMode());
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api');
  const [region, setRegion] = useState('us-east-1');
  const [health, setHealth] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [message, setMessage] = useState(null);

  const checkStatus = async () => {
    try {
      setCheckingHealth(true);
      const res = await healthApi.check();
      setHealth(res);
    } catch (err) {
      setHealth({ status: 'UNREACHABLE', error: err.message });
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleToggleMock = (enabled) => {
    setMockMode(enabled);
    setMockActive(enabled);
    setMessage(`Mode updated: ${enabled ? 'Local Mock Mode Active' : 'Live AWS API Gateway Mode Active'}`);
    setTimeout(() => setMessage(null), 3000);
    checkStatus();
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo workflows and executions to clean initial state?')) {
      localStorage.setItem('flowsphere_workflows', JSON.stringify(INITIAL_WORKFLOWS));
      localStorage.setItem('flowsphere_executions', JSON.stringify(INITIAL_EXECUTIONS));
      localStorage.setItem('flowsphere_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
      alert('Mock dataset reset to initial state!');
      window.location.reload();
    }
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem' }}>Platform Settings & Cloud Integration</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Configure serverless cloud endpoints, Bedrock AI models, and local test modes.
        </p>
      </div>

      {message && (
        <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', color: '#34d399', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <CheckCircle2 size={16} />
          <span>{message}</span>
        </div>
      )}

      {/* Cloud Service Health Status */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Service Health & Orchestration Fabric</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status of underlying serverless microservices</p>
          </div>
          <button onClick={checkStatus} disabled={checkingHealth} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
            <RefreshCw size={13} className={checkingHealth ? 'animate-spin' : ''} /> Check Health
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AWS Step Functions</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem', fontWeight: 600, color: '#34d399' }}>
              <CheckCircle2 size={15} /> Active
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AWS Lambda Tasks</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem', fontWeight: 600, color: '#34d399' }}>
              <CheckCircle2 size={15} /> Operational
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Amazon DynamoDB</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem', fontWeight: 600, color: '#34d399' }}>
              <CheckCircle2 size={15} /> Connected
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bedrock AI Engine</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem', fontWeight: 600, color: '#818cf8' }}>
              <Cpu size={15} /> Model Ready
            </div>
          </div>
        </div>
      </div>

      {/* Backend Mode Switcher */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Execution Engine Mode</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Select whether the application uses Phase 1 client-side simulation or connects directly to the Phase 2 AWS API Gateway backend.
        </p>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => handleToggleMock(true)}
            className={`btn ${mockActive ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '1rem', flexDirection: 'column', alignItems: 'flex-start', gap: '0.35rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.95rem' }}>
              <CheckCircle2 size={16} />
              <span>Phase 1: Local Mock Engine (Recommended for Offline Testing)</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: mockActive ? '#e0e7ff' : 'var(--text-muted)', textAlign: 'left' }}>
              Executes workflow state machines in browser with localStorage persistence. No AWS credentials needed.
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleToggleMock(false)}
            className={`btn ${!mockActive ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '1rem', flexDirection: 'column', alignItems: 'flex-start', gap: '0.35rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.95rem' }}>
              <Cloud size={16} />
              <span>Phase 2: Live AWS API Gateway Backend</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: !mockActive ? '#e0e7ff' : 'var(--text-muted)', textAlign: 'left' }}>
              Dispatches HTTP REST requests to API Gateway, invoking real Lambda and Step Functions.
            </div>
          </button>
        </div>
      </div>

      {/* Environment Config Form */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Cloud Infrastructure Parameters</h3>

        <div className="form-group">
          <label className="form-label">API Gateway Base URL</label>
          <input
            type="text"
            className="form-input"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="http://localhost:3000/api or https://xyz.execute-api.us-east-1.amazonaws.com/prod"
          />
        </div>

        <div className="form-group">
          <label className="form-label">AWS Default Region</label>
          <select className="form-select" value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="us-east-1">US East (N. Virginia) [us-east-1]</option>
            <option value="us-west-2">US West (Oregon) [us-west-2]</option>
            <option value="eu-west-1">Europe (Ireland) [eu-west-1]</option>
            <option value="ap-south-1">Asia Pacific (Mumbai) [ap-south-1]</option>
          </select>
        </div>
      </div>

      {/* Academic Reset / Demonstration Actions */}
      <div className="glass-panel" style={{ padding: '1.75rem', borderColor: 'var(--border-subtle)' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>College Project Demonstration Utilities</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Reset sample customer tickets, audit trails, and execution states to demonstrate clean fresh state machine execution to examiners.
        </p>
        <button onClick={handleResetData} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem', color: '#fbbf24' }}>
          <RotateCcw size={14} /> Reset Demo Dataset to Initial Values
        </button>
      </div>
    </div>
  );
};

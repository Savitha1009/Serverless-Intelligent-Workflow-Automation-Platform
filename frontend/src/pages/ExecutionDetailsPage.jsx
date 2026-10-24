import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
  Database,
  Layers,
  AlertTriangle,
  Code2,
  ExternalLink
} from 'lucide-react';
import { executionApi } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

export const ExecutionDetailsPage = () => {
  const { id } = useParams();
  const [execution, setExecution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);

  const loadExecution = async () => {
    try {
      setLoading(true);
      const data = await executionApi.getById(id);
      setExecution(data);
    } catch (err) {
      setError(err.message || 'Execution not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExecution();
  }, [id]);

  const handleRetry = async () => {
    try {
      setRetrying(true);
      const retried = await executionApi.retry(id);
      alert(`Retry executed! New execution record: ${retried.execution_id}`);
      window.location.href = `/executions/${retried.execution_id}`;
    } catch (err) {
      alert('Retry error: ' + err.message);
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
        Retrieving execution telemetry and task states...
      </div>
    );
  }

  if (error || !execution) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <AlertTriangle size={32} color="#f87171" style={{ margin: '0 auto 1rem' }} />
        <h3>Execution Record Not Found</h3>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>{error || 'No record exists with this ID.'}</p>
        <Link to="/executions" className="btn btn-secondary">
          Return to Executions
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Top Back Nav */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/executions" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0, gap: '0.4rem' }}>
          <ArrowLeft size={16} /> Back to Execution Monitoring
        </Link>
      </div>

      {/* Execution Summary Header */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <StatusBadge status={execution.execution_status} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#818cf8', fontWeight: 600 }}>
                {execution.execution_id}
              </span>
            </div>
            <h1 style={{ fontSize: '1.875rem' }}>
              Workflow: {execution.workflow_name || execution.workflow_id}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
              State Machine Execution Arn: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>arn:aws:states:us-east-1:123456789012:execution:{execution.workflow_id}:{execution.execution_id}</span>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to={`/workflows/${execution.workflow_id}`} className="btn btn-secondary">
              <Layers size={16} /> Workflow Definition
            </Link>

            {execution.execution_status === 'FAILED' && (
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="btn btn-primary"
                style={{ gap: '0.4rem' }}
              >
                <RotateCcw size={16} className={retrying ? 'animate-spin' : ''} />
                {retrying ? 'Retrying...' : 'Retry Execution'}
              </button>
            )}
          </div>
        </div>

        {/* Timestamps Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Started At</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '0.2rem' }}>
              {new Date(execution.started_at).toLocaleString()}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completed At</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '0.2rem' }}>
              {execution.completed_at ? new Date(execution.completed_at).toLocaleString() : 'Running...'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Duration</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '0.2rem', color: '#38bdf8' }}>
              {execution.duration_ms ? `${(execution.duration_ms / 1000).toFixed(2)} seconds` : '—'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Executor User</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '0.2rem' }}>
              {execution.user_id || 'usr-admin-01'}
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner if Failed */}
      {execution.error_message && (
        <div
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-danger-bg)',
            border: '1px solid var(--color-danger-border)',
            color: '#f87171',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}
        >
          <XCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Step Function Execution Exception</div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>
              {execution.error_message}
            </div>
          </div>
        </div>
      )}

      {/* AI Decision Audit Box */}
      {execution.output_data?.ai_decision && (
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem',
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(99, 102, 241, 0.08) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#c084fc', fontWeight: 600 }}>
            <Sparkles size={18} />
            <span>Amazon Bedrock AI Decision & Intent Audit Trail</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Classified Intent</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.2rem' }}>
                {execution.output_data.ai_decision.category}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Model Confidence Score</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399', marginTop: '0.2rem' }}>
                {Math.round((execution.output_data.ai_decision.confidence || 0.95) * 100)}%
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Conditional Routing Target</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8', marginTop: '0.2rem' }}>
                {execution.output_data.ai_decision.routed_to || 'General Triage'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* State Machine Tasks Breakdown */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Individual Task Execution Timeline</h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Task ID</th>
                <th>Task Name</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Task Output / Audit</th>
              </tr>
            </thead>
            <tbody>
              {(!execution.tasks || execution.tasks.length === 0) ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                    No granular task execution items recorded.
                  </td>
                </tr>
              ) : (
                execution.tasks.map((task) => (
                  <tr key={task.task_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {task.task_id}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {task.task_name}
                    </td>
                    <td>
                      <StatusBadge status={task.task_status} />
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {task.duration_ms ? `${task.duration_ms} ms` : '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#38bdf8' }}>
                      {task.output ? JSON.stringify(task.output) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Input & Output Payloads Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Input Data */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h4 style={{ fontSize: '0.95rem' }}>Workflow Input Payload (JSON)</h4>
          </div>
          <div className="code-box" style={{ maxHeight: '250px' }}>
            {JSON.stringify(execution.input_data, null, 2)}
          </div>
        </div>

        {/* Output Data */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h4 style={{ fontSize: '0.95rem' }}>Workflow Final Output State</h4>
          </div>
          <div className="code-box" style={{ maxHeight: '250px' }}>
            {JSON.stringify(execution.output_data, null, 2)}
          </div>
        </div>
      </div>
    </div>
  );
};

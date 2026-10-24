import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  Play,
  Edit2,
  Trash2,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Database,
  Bell,
  ArrowRight,
  ExternalLink,
  Code2
} from 'lucide-react';
import { workflowApi, executionApi } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { TriggerBadge } from '../components/TriggerBadge';
import { ExecutionModal } from '../components/ExecutionModal';

export const WorkflowDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workflow, setWorkflow] = useState(null);
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExecModalOpen, setIsExecModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'executions' | 'json'

  const loadData = async () => {
    try {
      setLoading(true);
      const [wfData, execsData] = await Promise.all([
        workflowApi.getById(id),
        executionApi.getAll({ workflow_id: id })
      ]);
      setWorkflow(wfData);
      setExecutions(execsData);
    } catch (err) {
      console.error('Failed to load workflow details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete workflow ${id}?`)) {
      try {
        await workflowApi.delete(id);
        navigate('/workflows');
      } catch (err) {
        alert('Error deleting: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
        Loading workflow orchestrator definition...
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>Workflow Not Found</h3>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>The requested workflow could not be retrieved.</p>
        <Link to="/workflows" className="btn btn-secondary">
          Return to Workflows
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/workflows" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0, gap: '0.4rem' }}>
          <ArrowLeft size={16} /> Back to Workflows
        </Link>
      </div>

      {/* Header Overview Card */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <TriggerBadge trigger={workflow.trigger_type} />
              <StatusBadge status={workflow.status} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {workflow.workflow_id}
              </span>
            </div>
            <h1 style={{ fontSize: '1.875rem' }}>{workflow.name}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem', maxWidth: '750px', lineHeight: '1.6' }}>
              {workflow.description}
            </p>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link to={`/workflows/edit/${workflow.workflow_id}`} className="btn btn-secondary">
              <Edit2 size={16} /> Edit
            </Link>
            <button onClick={() => setIsExecModalOpen(true)} className="btn btn-primary" style={{ gap: '0.5rem' }}>
              <Play size={16} fill="currentColor" /> Run Workflow
            </button>
            <button onClick={handleDelete} className="btn btn-danger" title="Delete Workflow">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Metadata Strip */}
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Trigger Source</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: '0.2rem' }}>
              {workflow.trigger_type === 'SCHEDULED' ? `EventBridge: ${workflow.schedule_cron}` : workflow.trigger_type}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>State Tasks</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: '0.2rem' }}>
              {workflow.steps?.length || 0} Steps Configured
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Executions</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: '0.2rem', color: '#818cf8' }}>
              {executions.length} Runs Logged
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Last Updated</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: '0.2rem' }}>
              {new Date(workflow.updated_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('pipeline')}
          style={{
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'pipeline' ? '2px solid var(--primary-500)' : '2px solid transparent',
            color: activeTab === 'pipeline' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Step Functions Pipeline Graph
        </button>

        <button
          onClick={() => setActiveTab('executions')}
          style={{
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'executions' ? '2px solid var(--primary-500)' : '2px solid transparent',
            color: activeTab === 'executions' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Execution History ({executions.length})
        </button>

        <button
          onClick={() => setActiveTab('json')}
          style={{
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'json' ? '2px solid var(--primary-500)' : '2px solid transparent',
            color: activeTab === 'json' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          JSON Definition (SAM / ASL)
        </button>
      </div>

      {/* Tab 1: Step Functions Pipeline Visualizer */}
      {activeTab === 'pipeline' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Amazon States Language (ASL) Flow</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Execution pipeline managed through AWS Step Functions state machine.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {workflow.steps?.map((step, idx) => (
              <div key={step.id || idx}>
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: step.type === 'AI_DECISION' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                        color: step.type === 'AI_DECISION' ? '#c084fc' : '#818cf8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700
                      }}
                    >
                      {idx + 1}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{step.name}</span>
                        <span className={step.type === 'AI_DECISION' ? 'badge badge-purple' : 'badge badge-neutral'} style={{ fontSize: '0.7rem' }}>
                          {step.type}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {step.type === 'AI_DECISION' && (
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                        <Sparkles size={11} /> {step.config?.model || 'Bedrock Claude-v2'}
                      </span>
                    </div>
                  )}

                  {step.type === 'DATABASE_WRITE' && (
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                        <Database size={11} /> {step.config?.table || 'DynamoDB'}
                      </span>
                    </div>
                  )}
                </div>

                {idx < (workflow.steps?.length || 0) - 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '0.4rem 0' }}>
                    <div style={{ width: '2px', height: '18px', backgroundColor: 'var(--border-medium)' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Workflow Linked Executions */}
      {activeTab === 'executions' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Execution ID</th>
                  <th>Status</th>
                  <th>Started At</th>
                  <th>Duration</th>
                  <th>Outcome</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {executions.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                      No executions have run for this workflow yet.
                    </td>
                  </tr>
                ) : (
                  executions.map((exec) => (
                    <tr key={exec.execution_id}>
                      <td style={{ fontFamily: 'var(--font-mono)', color: '#818cf8', fontWeight: 500 }}>
                        {exec.execution_id}
                      </td>
                      <td>
                        <StatusBadge status={exec.execution_status} />
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>
                        {new Date(exec.started_at).toLocaleString()}
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>
                        {exec.duration_ms ? `${(exec.duration_ms / 1000).toFixed(2)}s` : '—'}
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>
                        {exec.output_data?.ai_decision?.category ? (
                          <span className="badge badge-purple">
                            AI: {exec.output_data.ai_decision.category}
                          </span>
                        ) : exec.error_message ? (
                          <span style={{ color: '#f87171' }}>{exec.error_message.slice(0, 30)}...</span>
                        ) : (
                          'Done'
                        )}
                      </td>
                      <td>
                        <Link to={`/executions/${exec.execution_id}`} className="btn btn-ghost btn-sm">
                          <ExternalLink size={14} /> View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: JSON Definition */}
      {activeTab === 'json' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.95rem' }}>Workflow Cloud State Definition (JSON)</h4>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(workflow, null, 2));
                alert('Workflow JSON copied to clipboard!');
              }}
              className="btn btn-secondary btn-sm"
            >
              Copy JSON
            </button>
          </div>
          <div className="code-box">
            {JSON.stringify(workflow, null, 2)}
          </div>
        </div>
      )}

      {/* Interactive Execution Modal */}
      {isExecModalOpen && (
        <ExecutionModal
          isOpen={isExecModalOpen}
          workflow={workflow}
          onClose={() => setIsExecModalOpen(false)}
          onExecutionComplete={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Cpu,
  Database,
  Bell,
  Code2,
  Split
} from 'lucide-react';
import { workflowApi } from '../services/api';

export const CreateWorkflowPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState('MANUAL');
  const [scheduleCron, setScheduleCron] = useState('cron(0 12 * * ? *)');
  const [status, setStatus] = useState('ACTIVE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Workflow steps builder state
  const [steps, setSteps] = useState([
    {
      id: 'step-1',
      name: 'Validate Input Payload',
      type: 'VALIDATION',
      description: 'Check required parameters and data formats.',
      config: { requireEmail: true, minLength: 5 }
    },
    {
      id: 'step-2',
      name: 'Bedrock AI Task Classifier',
      type: 'AI_DECISION',
      description: 'Analyze content with Claude/Titan to categorize urgency and intent.',
      config: { model: 'amazon.bedrock.claude-v2', confidenceThreshold: 0.85, fallbackRule: 'GENERAL' }
    },
    {
      id: 'step-3',
      name: 'Persist Execution State',
      type: 'DATABASE_WRITE',
      description: 'Write task output and audit trail to Amazon DynamoDB.',
      config: { table: 'WorkflowAuditLog' }
    }
  ]);

  const handleAddStep = () => {
    const newId = `step-${steps.length + 1}`;
    setSteps([
      ...steps,
      {
        id: newId,
        name: `Custom Task Step ${steps.length + 1}`,
        type: 'NOTIFICATION',
        description: 'Send completion alert.',
        config: { channel: 'SNS_EMAIL', template: 'default_alert' }
      }
    ]);
  };

  const handleRemoveStep = (index) => {
    if (steps.length <= 1) {
      alert('A workflow must contain at least one step.');
      return;
    }
    const updated = steps.filter((_, i) => i !== index);
    setSteps(updated);
  };

  const handleMoveStep = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    const updated = [...steps];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setSteps(updated);
  };

  const handleStepChange = (index, field, value) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const handleStepConfigChange = (index, key, value) => {
    const updated = [...steps];
    updated[index] = {
      ...updated[index],
      config: {
        ...(updated[index].config || {}),
        [key]: value
      }
    };
    setSteps(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide a workflow name.');
      return;
    }

    if (steps.length === 0) {
      setError('At least one task step is required in the workflow pipeline.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        description,
        trigger_type: triggerType,
        schedule_cron: triggerType === 'SCHEDULED' ? scheduleCron : '',
        status,
        steps
      };

      const created = await workflowApi.create(payload);
      navigate(`/workflows/${created.workflow_id}`);
    } catch (err) {
      setError(err.message || 'Failed to create workflow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Top Navigation */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/workflows" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0, gap: '0.4rem' }}>
          <ArrowLeft size={16} /> Back to Workflows
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem' }}>Workflow Orchestrator Builder</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Define serverless execution steps, conditional branching, and Amazon Bedrock AI actions.
          </p>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-danger-bg)',
            border: '1px solid var(--color-danger-border)',
            color: '#f87171',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Basic Workflow Properties */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-500)', color: '#fff', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
            Workflow Identity & Triggers
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Workflow Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Intelligent Customer Support Classifier"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                placeholder="Describe what automated tasks and AI reasoning this workflow performs..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Trigger Mechanism</label>
              <select
                className="form-select"
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value)}
              >
                <option value="MANUAL">Manual Trigger (API / Dashboard Run)</option>
                <option value="SCHEDULED">Scheduled Trigger (Amazon EventBridge Cron)</option>
                <option value="EVENT">Event-Driven (S3 Upload / Webhook / SNS)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="ACTIVE">Active (Ready for execution)</option>
                <option value="INACTIVE">Inactive (Paused)</option>
              </select>
            </div>

            {triggerType === 'SCHEDULED' && (
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">EventBridge Cron / Rate Expression</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)' }}
                  placeholder="cron(0 12 * * ? *) or rate(1 hour)"
                  value={scheduleCron}
                  onChange={(e) => setScheduleCron(e.target.value)}
                />
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  AWS EventBridge syntax for automated scheduling.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Step Functions Pipeline Steps */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-500)', color: '#fff', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
              Step Functions Task Sequence
            </h3>
            <button
              type="button"
              onClick={handleAddStep}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.4rem' }}
            >
              <Plus size={15} /> Add Task Step
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {steps.map((step, idx) => (
              <div
                key={step.id || idx}
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface-hover)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#818cf8'
                      }}
                    >
                      Step #{idx + 1}
                    </span>
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: '260px', padding: '0.4rem 0.65rem', fontWeight: 600 }}
                      value={step.name}
                      onChange={(e) => handleStepChange(idx, 'name', e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button
                      type="button"
                      onClick={() => handleMoveStep(idx, -1)}
                      disabled={idx === 0}
                      className="btn btn-ghost btn-sm"
                      title="Move Up"
                      style={{ padding: '0.35rem' }}
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveStep(idx, 1)}
                      disabled={idx === steps.length - 1}
                      className="btn btn-ghost btn-sm"
                      title="Move Down"
                      style={{ padding: '0.35rem' }}
                    >
                      <ArrowDown size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="btn btn-ghost btn-sm"
                      title="Remove Step"
                      style={{ padding: '0.35rem', color: '#f87171' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Task Type</label>
                    <select
                      className="form-select"
                      value={step.type}
                      onChange={(e) => handleStepChange(idx, 'type', e.target.value)}
                    >
                      <option value="VALIDATION">Input Validation (Schema & Format)</option>
                      <option value="AI_DECISION">Amazon Bedrock AI Classifier</option>
                      <option value="BRANCHING">Conditional Branching & Choice</option>
                      <option value="DATABASE_WRITE">DynamoDB Persistence</option>
                      <option value="NOTIFICATION">Amazon SNS / In-App Notification</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Step Description</label>
                    <input
                      type="text"
                      className="form-input"
                      value={step.description || ''}
                      onChange={(e) => handleStepChange(idx, 'description', e.target.value)}
                      placeholder="e.g., Evaluates fraud risk score"
                    />
                  </div>

                  {/* Dynamic Configurations based on step type */}
                  {step.type === 'AI_DECISION' && (
                    <div style={{ gridColumn: 'span 2', background: 'rgba(99, 102, 241, 0.08)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', color: '#818cf8', fontSize: '0.825rem', fontWeight: 600 }}>
                        <Sparkles size={15} /> Bedrock AI Configuration
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>AI Model</label>
                          <select
                            className="form-select"
                            style={{ fontSize: '0.8rem', padding: '0.45rem' }}
                            value={step.config?.model || 'amazon.bedrock.claude-v2'}
                            onChange={(e) => handleStepConfigChange(idx, 'model', e.target.value)}
                          >
                            <option value="amazon.bedrock.claude-v2">Anthropic Claude v2</option>
                            <option value="bedrock-titan-text-express">Amazon Titan Text</option>
                            <option value="meta-llama-3">Meta Llama 3 70B</option>
                          </select>
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>Confidence Threshold</label>
                          <input
                            type="number"
                            step="0.05"
                            min="0.5"
                            max="1.0"
                            className="form-input"
                            style={{ fontSize: '0.8rem', padding: '0.45rem' }}
                            value={step.config?.confidenceThreshold || 0.85}
                            onChange={(e) => handleStepConfigChange(idx, 'confidenceThreshold', parseFloat(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>Rule Fallback</label>
                          <input
                            type="text"
                            className="form-input"
                            style={{ fontSize: '0.8rem', padding: '0.45rem' }}
                            value={step.config?.fallbackRule || 'GENERAL'}
                            onChange={(e) => handleStepConfigChange(idx, 'fallbackRule', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {step.type === 'DATABASE_WRITE' && (
                    <div style={{ gridColumn: 'span 2', background: 'rgba(16, 185, 129, 0.08)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: '#34d399', fontSize: '0.825rem', fontWeight: 600 }}>
                        <Database size={15} /> DynamoDB Target Table
                      </div>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., ServerlessWorkflowStateStore"
                        value={step.config?.table || 'WorkflowAuditStore'}
                        onChange={(e) => handleStepConfigChange(idx, 'table', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Link to="/workflows" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
            {loading ? 'Validating and Saving...' : 'Save & Publish Workflow'}
          </button>
        </div>
      </form>
    </div>
  );
};

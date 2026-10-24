import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Database,
  CheckCircle2
} from 'lucide-react';
import { workflowApi } from '../services/api';

export const EditWorkflowPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workflow, setWorkflow] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState('MANUAL');
  const [scheduleCron, setScheduleCron] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        setLoading(true);
        const data = await workflowApi.getById(id);
        setWorkflow(data);
        setName(data.name);
        setDescription(data.description || '');
        setTriggerType(data.trigger_type || 'MANUAL');
        setScheduleCron(data.schedule_cron || '');
        setStatus(data.status || 'ACTIVE');
        setSteps(data.steps || []);
      } catch (err) {
        setError(err.message || 'Workflow not found');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkflow();
  }, [id]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload = {
        name,
        description,
        trigger_type: triggerType,
        schedule_cron: triggerType === 'SCHEDULED' ? scheduleCron : '',
        status,
        steps
      };

      await workflowApi.update(id, payload);
      navigate(`/workflows/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update workflow');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
        Loading workflow definition...
      </div>
    );
  }

  if (error && !workflow) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <AlertTriangle size={32} color="#f87171" style={{ margin: '0 auto 1rem' }} />
        <h3>Error loading workflow</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
        <Link to="/workflows" className="btn btn-secondary">
          Return to Workflows
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to={`/workflows/${id}`} className="btn btn-ghost btn-sm" style={{ paddingLeft: 0, gap: '0.4rem' }}>
          <ArrowLeft size={16} /> Back to Workflow Details
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)' }}>{id}</span>
          </div>
          <h1 style={{ fontSize: '1.875rem' }}>Edit Workflow: {workflow?.name}</h1>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', color: '#f87171', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Workflow Configuration</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Workflow Name *</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
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
                <option value="MANUAL">Manual Trigger</option>
                <option value="SCHEDULED">Scheduled (EventBridge Cron)</option>
                <option value="EVENT">Event-Driven (S3 / Webhook)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {triggerType === 'SCHEDULED' && (
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">EventBridge Cron Expression</label>
                <input
                  type="text"
                  className="form-input"
                  value={scheduleCron}
                  onChange={(e) => setScheduleCron(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Steps */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem' }}>Step Functions Task Pipeline</h3>
            <button type="button" onClick={handleAddStep} className="btn btn-secondary btn-sm">
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
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-hover)', fontSize: '0.75rem', fontWeight: 700, color: '#818cf8' }}>
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
                    <button type="button" onClick={() => handleMoveStep(idx, -1)} disabled={idx === 0} className="btn btn-ghost btn-sm" title="Move Up">
                      <ArrowUp size={15} />
                    </button>
                    <button type="button" onClick={() => handleMoveStep(idx, 1)} disabled={idx === steps.length - 1} className="btn btn-ghost btn-sm" title="Move Down">
                      <ArrowDown size={15} />
                    </button>
                    <button type="button" onClick={() => handleRemoveStep(idx)} className="btn btn-ghost btn-sm" title="Remove Step" style={{ color: '#f87171' }}>
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
                      <option value="VALIDATION">Input Validation</option>
                      <option value="AI_DECISION">Amazon Bedrock AI Classifier</option>
                      <option value="BRANCHING">Conditional Branching</option>
                      <option value="DATABASE_WRITE">DynamoDB Persistence</option>
                      <option value="NOTIFICATION">Notification Dispatch</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      className="form-input"
                      value={step.description || ''}
                      onChange={(e) => handleStepChange(idx, 'description', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Link to={`/workflows/${id}`} className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
            {saving ? 'Saving Changes...' : 'Update Workflow'}
          </button>
        </div>
      </form>
    </div>
  );
};

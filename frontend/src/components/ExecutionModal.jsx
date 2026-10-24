import React, { useState } from 'react';
import { Play, X, CheckCircle, AlertTriangle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { workflowApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const ExecutionModal = ({ isOpen, onClose, workflow, onExecutionComplete }) => {
  const navigate = useNavigate();

  const presets = {
    billing: JSON.stringify(
      {
        ticket_id: 'TCK-' + Math.floor(1000 + Math.random() * 9000),
        customer_email: 'finance.lead@enterprise.com',
        message: 'Hello, our credit card was charged twice ($1,299) for the annual enterprise tier renewal. Please issue an immediate refund.'
      },
      null,
      2
    ),
    tech: JSON.stringify(
      {
        ticket_id: 'TCK-' + Math.floor(1000 + Math.random() * 9000),
        customer_email: 'dev@saasapp.io',
        message: 'Getting 504 Gateway Timeout when executing Step Functions state machine through the AWS REST API Gateway endpoint.'
      },
      null,
      2
    ),
    general: JSON.stringify(
      {
        ticket_id: 'TCK-' + Math.floor(1000 + Math.random() * 9000),
        customer_email: 'inquiry@prospect.co',
        message: 'Could you please send over your SOC2 compliance whitepaper and pricing tiers for serverless pipelines?'
      },
      null,
      2
    )
  };

  const [inputJson, setInputJson] = useState(presets.billing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  if (!isOpen || !workflow) return null;

  const handleLaunch = async () => {
    setError(null);
    setResult(null);

    let parsedPayload = {};
    try {
      parsedPayload = JSON.parse(inputJson);
    } catch (e) {
      setError('Invalid JSON payload. Please verify syntax.');
      return;
    }

    setLoading(true);

    // Simulate progressive Step Functions pipeline transitions
    const steps = workflow.steps || [];
    for (let i = 0; i < steps.length; i++) {
      setCurrentStepIndex(i);
      await new Promise((res) => setTimeout(res, 450));
    }

    try {
      const executionResult = await workflowApi.execute(workflow.workflow_id, parsedPayload);
      setResult(executionResult);
      if (onExecutionComplete) onExecutionComplete(executionResult);
    } catch (err) {
      setError(err.message || 'Execution failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setCurrentStepIndex(-1);
    setError(null);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.5rem'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#0f172a',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          padding: '2rem'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-purple">AWS Step Functions</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {workflow.workflow_id}</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', marginTop: '0.35rem' }}>Execute: {workflow.name}</h2>
          </div>
          <button onClick={handleReset} className="btn btn-ghost" style={{ padding: '0.4rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Step Visualizer */}
        <div style={{ marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.65rem', textTransform: 'uppercase' }}>
            Execution State Machine Pipeline ({workflow.steps?.length || 0} Steps)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {workflow.steps?.map((step, idx) => {
              const isCurrent = loading && currentStepIndex === idx;
              const isDone = (loading && currentStepIndex > idx) || result;

              return (
                <div key={step.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <div
                    style={{
                      padding: '0.45rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: isDone
                        ? 'var(--color-success-bg)'
                        : isCurrent
                        ? 'rgba(99, 102, 241, 0.2)'
                        : 'rgba(255, 255, 255, 0.04)',
                      color: isDone
                        ? '#34d399'
                        : isCurrent
                        ? '#818cf8'
                        : 'var(--text-muted)',
                      border: `1px solid ${isDone ? 'var(--color-success-border)' : isCurrent ? 'var(--primary-500)' : 'transparent'}`
                    }}
                  >
                    {isCurrent ? <Loader2 size={12} className="animate-spin" /> : isDone ? <CheckCircle size={12} /> : null}
                    <span>{idx + 1}. {step.name}</span>
                  </div>
                  {idx < (workflow.steps?.length || 0) - 1 && <ArrowRight size={12} color="var(--text-muted)" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Preset Selector */}
        {!result && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label">
                <Sparkles size={14} color="#818cf8" /> Load Sample Test Payload:
              </label>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button type="button" onClick={() => setInputJson(presets.billing)} className="btn btn-ghost btn-sm">
                  Billing
                </button>
                <button type="button" onClick={() => setInputJson(presets.tech)} className="btn btn-ghost btn-sm">
                  Technical
                </button>
                <button type="button" onClick={() => setInputJson(presets.general)} className="btn btn-ghost btn-sm">
                  General
                </button>
              </div>
            </div>

            <textarea
              className="form-textarea"
              style={{ fontFamily: 'var(--font-mono)', minHeight: '140px', fontSize: '0.825rem' }}
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              disabled={loading}
            />
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', color: '#f87171', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Execution Result Box */}
        {result && (
          <div style={{ marginBottom: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid var(--color-success-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 600 }}>
                <CheckCircle size={18} />
                <span>Execution Succeeded</span>
              </div>
              <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)' }}>
                {result.execution_id}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AI Intent Class</div>
                <div style={{ fontWeight: 600, color: '#38bdf8' }}>{result.output_data?.ai_decision?.category || 'General'}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Confidence Score</div>
                <div style={{ fontWeight: 600, color: '#34d399' }}>{Math.round((result.output_data?.ai_decision?.confidence || 0.95) * 100)}%</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>State Store (DynamoDB)</div>
                <div style={{ fontWeight: 600, color: '#a855f7' }}>CONFIRMED</div>
              </div>
            </div>

            <div className="code-box" style={{ maxHeight: '160px' }}>
              {JSON.stringify(result.output_data, null, 2)}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" onClick={handleReset} className="btn btn-secondary">
            {result ? 'Close' : 'Cancel'}
          </button>

          {!result ? (
            <button
              type="button"
              onClick={handleLaunch}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Orchestrating Workflow...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Run Workflow
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/executions/${result.execution_id}`);
              }}
              className="btn btn-primary"
            >
              View Full Execution Details <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Play,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap
} from 'lucide-react';
import { workflowApi } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { TriggerBadge } from '../components/TriggerBadge';
import { ExecutionModal } from '../components/ExecutionModal';

export const WorkflowListPage = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [triggerFilter, setTriggerFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Execution modal state
  const [selectedWorkflowForExec, setSelectedWorkflowForExec] = useState(null);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const list = await workflowApi.getAll();
      setWorkflows(list);
    } catch (err) {
      console.error('Failed to load workflows', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const handleToggleStatus = async (workflow) => {
    try {
      const newStatus = workflow.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await workflowApi.update(workflow.workflow_id, { status: newStatus });
      loadWorkflows();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleDelete = async (workflowId) => {
    if (window.confirm(`Are you sure you want to delete workflow ${workflowId}?`)) {
      try {
        await workflowApi.delete(workflowId);
        loadWorkflows();
      } catch (err) {
        alert('Error deleting workflow: ' + err.message);
      }
    }
  };

  // Filter workflows
  const filteredWorkflows = workflows.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.workflow_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTrigger = triggerFilter === 'ALL' || w.trigger_type === triggerFilter;
    const matchesStatus = statusFilter === 'ALL' || w.status === statusFilter;
    return matchesSearch && matchesTrigger && matchesStatus;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem' }}>Automated Workflows</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Configure serverless pipelines, Step Functions branching, and Bedrock AI decisions.
          </p>
        </div>
        <Link to="/workflows/create" className="btn btn-primary">
          <Plus size={16} />
          <span>Create Workflow</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search by workflow name, ID, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Trigger Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Trigger:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.5rem 0.85rem' }}
            value={triggerFilter}
            onChange={(e) => setTriggerFilter(e.target.value)}
          >
            <option value="ALL">All Triggers</option>
            <option value="MANUAL">Manual</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="EVENT">EventBridge</option>
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Status:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.5rem 0.85rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Workflows Grid / Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          Loading workflows...
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Layers size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Workflows Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            {searchQuery
              ? 'Try adjusting your search query or filters to find what you are looking for.'
              : 'Get started by creating your first serverless automated workflow with AI classification.'}
          </p>
          <Link to="/workflows/create" className="btn btn-primary">
            <Plus size={16} /> Create Workflow
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {filteredWorkflows.map((workflow) => (
            <div
              key={workflow.workflow_id}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, border-color 0.2s ease'
              }}
            >
              <div>
                {/* Card Top: Badges & ID */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <TriggerBadge trigger={workflow.trigger_type} />
                    <StatusBadge status={workflow.status} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {workflow.workflow_id}
                  </span>
                </div>

                {/* Workflow Title */}
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>
                  <Link
                    to={`/workflows/${workflow.workflow_id}`}
                    style={{ color: 'var(--text-primary)', textDecoration: 'none' }}
                  >
                    {workflow.name}
                  </Link>
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontSize: '0.825rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5',
                    marginBottom: '1.25rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {workflow.description}
                </p>

                {/* Step Pipeline Peek */}
                <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    Step Functions Chain ({workflow.steps?.length || 0} Steps)
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {workflow.steps?.map((step, idx) => (
                      <span
                        key={step.id || idx}
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.15rem 0.45rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '4px',
                          color: step.type === 'AI_DECISION' ? '#c084fc' : '#94a3b8'
                        }}
                      >
                        {step.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-subtle)'
                }}
              >
                <button
                  onClick={() => setSelectedWorkflowForExec(workflow)}
                  className="btn btn-primary btn-sm"
                  style={{ gap: '0.4rem' }}
                >
                  <Play size={13} fill="currentColor" />
                  <span>Execute</span>
                </button>

                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <Link
                    to={`/workflows/${workflow.workflow_id}`}
                    className="btn btn-ghost btn-sm"
                    title="View Details"
                    style={{ padding: '0.4rem' }}
                  >
                    <Eye size={16} />
                  </Link>

                  <Link
                    to={`/workflows/edit/${workflow.workflow_id}`}
                    className="btn btn-ghost btn-sm"
                    title="Edit Workflow"
                    style={{ padding: '0.4rem' }}
                  >
                    <Edit2 size={16} />
                  </Link>

                  <button
                    onClick={() => handleToggleStatus(workflow)}
                    className="btn btn-ghost btn-sm"
                    title={workflow.status === 'ACTIVE' ? 'Pause Workflow' : 'Activate Workflow'}
                    style={{ padding: '0.4rem', color: workflow.status === 'ACTIVE' ? '#fbbf24' : '#34d399' }}
                  >
                    <Clock size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(workflow.workflow_id)}
                    className="btn btn-ghost btn-sm"
                    title="Delete Workflow"
                    style={{ padding: '0.4rem', color: '#f87171' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Execution Modal */}
      {selectedWorkflowForExec && (
        <ExecutionModal
          isOpen={!!selectedWorkflowForExec}
          workflow={selectedWorkflowForExec}
          onClose={() => setSelectedWorkflowForExec(null)}
          onExecutionComplete={() => {
            loadWorkflows();
          }}
        />
      )}
    </div>
  );
};

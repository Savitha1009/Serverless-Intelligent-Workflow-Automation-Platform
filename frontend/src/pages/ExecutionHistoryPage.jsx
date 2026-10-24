import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Search,
  Filter,
  RotateCcw,
  Download,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { executionApi, workflowApi } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

export const ExecutionHistoryPage = () => {
  const [executions, setExecutions] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [workflowFilter, setWorkflowFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [retryingId, setRetryingId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [execs, wfs] = await Promise.all([
        executionApi.getAll(),
        workflowApi.getAll()
      ]);
      setExecutions(execs);
      setWorkflows(wfs);
    } catch (err) {
      console.error('Failed to load executions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRetry = async (executionId) => {
    try {
      setRetryingId(executionId);
      const retried = await executionApi.retry(executionId);
      alert(`Retry executed successfully! New execution ID: ${retried.execution_id}`);
      loadData();
    } catch (err) {
      alert('Retry error: ' + err.message);
    } finally {
      setRetryingId(null);
    }
  };

  const handleExportCSV = () => {
    if (filteredExecutions.length === 0) {
      alert('No execution records to export.');
      return;
    }

    const headers = ['Execution ID', 'Workflow Name', 'Status', 'Started At', 'Completed At', 'Duration (ms)', 'AI Category', 'Error Message'];
    const rows = filteredExecutions.map((e) => [
      e.execution_id,
      `"${e.workflow_name || ''}"`,
      e.execution_status,
      e.started_at,
      e.completed_at || '',
      e.duration_ms || '',
      e.output_data?.ai_decision?.category || '',
      `"${(e.error_message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `executions_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter executions
  const filteredExecutions = executions.filter((e) => {
    const matchesSearch =
      e.execution_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.workflow_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(e.input_data || {}).toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || e.execution_status === statusFilter;
    const matchesWorkflow = workflowFilter === 'ALL' || e.workflow_id === workflowFilter;

    return matchesSearch && matchesStatus && matchesWorkflow;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem' }}>Execution Monitoring</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Comprehensive audit logs for AWS Step Functions orchestrations and AI decisions.
          </p>
        </div>

        <button onClick={handleExportCSV} className="btn btn-secondary">
          <Download size={16} /> Export to CSV
        </button>
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
            placeholder="Search by Execution ID, workflow, or payload content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
            <option value="SUCCEEDED">Succeeded</option>
            <option value="FAILED">Failed</option>
            <option value="RUNNING">Running</option>
          </select>
        </div>

        {/* Workflow Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Workflow:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.5rem 0.85rem' }}
            value={workflowFilter}
            onChange={(e) => setWorkflowFilter(e.target.value)}
          >
            <option value="ALL">All Workflows</option>
            {workflows.map((wf) => (
              <option key={wf.workflow_id} value={wf.workflow_id}>
                {wf.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Execution Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Execution ID</th>
                <th>Workflow Name</th>
                <th>Status</th>
                <th>Started At</th>
                <th>Duration</th>
                <th>AI Decision / Result</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                    Loading execution history...
                  </td>
                </tr>
              ) : filteredExecutions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                    No matching executions found.
                  </td>
                </tr>
              ) : (
                filteredExecutions.map((exec) => (
                  <tr key={exec.execution_id}>
                    <td>
                      <Link
                        to={`/executions/${exec.execution_id}`}
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#818cf8', textDecoration: 'none', fontWeight: 500 }}
                      >
                        {exec.execution_id}
                      </Link>
                    </td>

                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      {exec.workflow_name || exec.workflow_id}
                    </td>

                    <td>
                      <StatusBadge status={exec.execution_status} />
                    </td>

                    <td style={{ fontSize: '0.8rem' }}>
                      {new Date(exec.started_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                    </td>

                    <td style={{ fontSize: '0.8rem' }}>
                      {exec.duration_ms ? `${(exec.duration_ms / 1000).toFixed(2)}s` : '—'}
                    </td>

                    <td style={{ fontSize: '0.8rem' }}>
                      {exec.output_data?.ai_decision ? (
                        <span className="badge badge-purple" style={{ fontSize: '0.725rem' }}>
                          <Sparkles size={11} /> {exec.output_data.ai_decision.category} ({Math.round(exec.output_data.ai_decision.confidence * 100)}%)
                        </span>
                      ) : exec.error_message ? (
                        <span style={{ color: '#f87171', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <AlertCircle size={12} /> {exec.error_message.slice(0, 32)}...
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Link
                          to={`/executions/${exec.execution_id}`}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '0.3rem 0.5rem' }}
                          title="View Execution Details"
                        >
                          <ExternalLink size={14} />
                        </Link>

                        {exec.execution_status === 'FAILED' && (
                          <button
                            onClick={() => handleRetry(exec.execution_id)}
                            disabled={retryingId === exec.execution_id}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            title="Retry failed execution"
                          >
                            <RotateCcw size={13} className={retryingId === exec.execution_id ? 'animate-spin' : ''} />
                            Retry
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

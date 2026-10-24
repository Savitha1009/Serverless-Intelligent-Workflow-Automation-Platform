import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  TrendingUp,
  Cpu,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { executionApi, workflowApi } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { TriggerBadge } from '../components/TriggerBadge';
import { ExecutionModal } from '../components/ExecutionModal';

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [recentExecutions, setRecentExecutions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Execution modal state
  const [activeWorkflowForExec, setActiveWorkflowForExec] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, workflowsData, executionsData] = await Promise.all([
        executionApi.getDashboardStats(),
        workflowApi.getAll(),
        executionApi.getAll()
      ]);

      setStats(statsData);
      setWorkflows(workflowsData);
      setRecentExecutions(executionsData.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Pie chart data
  const pieData = [
    { name: 'Succeeded', value: stats?.succeededExecutions || 0, color: '#10b981' },
    { name: 'Failed', value: stats?.failedExecutions || 0, color: '#ef4444' },
    { name: 'Running', value: stats?.runningExecutions || 0, color: '#06b6d4' }
  ].filter((item) => item.value > 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Activity size={32} className="animate-spin" color="var(--primary-500)" />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading Serverless Platform Metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Top Welcome & Actions Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem' }}>Cloud Orchestrator Overview</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Real-time telemetry for AWS Step Functions state machines and Bedrock AI decisions.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/workflows/create" className="btn btn-primary">
            <Layers size={16} />
            <span>Create Workflow</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        <MetricCard
          title="Total Workflows"
          value={stats?.totalWorkflows || 0}
          icon={Layers}
          changeText={`${stats?.activeWorkflows || 0} active, ${stats?.inactiveWorkflows || 0} paused`}
          color="indigo"
        />
        <MetricCard
          title="Total Executions"
          value={stats?.totalExecutions || 0}
          icon={Activity}
          changeText="Past 24 hours execution volume"
          color="cyan"
        />
        <MetricCard
          title="Success Rate"
          value={`${stats?.successRate || 0}%`}
          icon={CheckCircle2}
          changeText={`${stats?.succeededExecutions || 0} successful executions`}
          changeType="positive"
          color="emerald"
        />
        <MetricCard
          title="Failed Executions"
          value={stats?.failedExecutions || 0}
          icon={AlertTriangle}
          changeText={stats?.failedExecutions > 0 ? "Inspect failure logs" : "Zero errors reported"}
          changeType={stats?.failedExecutions > 0 ? "negative" : "positive"}
          color={stats?.failedExecutions > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* Visualization Charts Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        {/* Weekly Execution Volume Area Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Execution Throughput</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily volume and orchestration stability</p>
            </div>
            <span className="badge badge-neutral">Last 7 Days</span>
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.trendData || []}>
                <defs>
                  <linearGradient id="colorExec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorSucc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: 'var(--border-medium)',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="executions" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorExec)" name="Total Requests" />
                <Area type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSucc)" name="Successful" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Execution Status Distribution Pie Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Outcome Distribution</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Step Functions status breakdown</p>
            </div>
            <span className="badge badge-neutral">All Runs</span>
          </div>

          <div style={{ height: '260px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: 'var(--border-medium)',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Interactive Execution Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
          border: '1px solid var(--border-active)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              padding: '0.6rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              color: '#818cf8'
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Interactive Demo Orchestrator</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Test AI classification, branching rules, and state machine transitions right now.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          {workflows.slice(0, 2).map((wf) => (
            <button
              key={wf.workflow_id}
              onClick={() => setActiveWorkflowForExec(wf)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Play size={13} color="#34d399" />
              <span>Run {wf.name.split(' ')[0]} Flow</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Executions Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem' }}>Recent Workflow Executions</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Latest state machine runs triggered in the platform</p>
          </div>
          <Link to="/executions" className="btn btn-ghost btn-sm">
            View All Executions <ArrowRight size={14} />
          </Link>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Execution ID</th>
                <th>Workflow</th>
                <th>Status</th>
                <th>Started At</th>
                <th>Duration</th>
                <th>Result / AI Decision</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentExecutions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                    No executions recorded yet.
                  </td>
                </tr>
              ) : (
                recentExecutions.map((exec) => (
                  <tr key={exec.execution_id}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#818cf8', fontWeight: 500 }}>
                        {exec.execution_id}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      {exec.workflow_name}
                    </td>
                    <td>
                      <StatusBadge status={exec.execution_status} />
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {new Date(exec.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {exec.duration_ms ? `${(exec.duration_ms / 1000).toFixed(2)}s` : '—'}
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {exec.output_data?.ai_decision ? (
                        <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                          AI: {exec.output_data.ai_decision.category} ({Math.round(exec.output_data.ai_decision.confidence * 100)}%)
                        </span>
                      ) : exec.error_message ? (
                        <span style={{ color: '#f87171', fontSize: '0.75rem' }}>
                          {exec.error_message.slice(0, 32)}...
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <Link
                        to={`/executions/${exec.execution_id}`}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0.3rem 0.5rem' }}
                        title="View Execution Details"
                      >
                        <ExternalLink size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Execution Modal */}
      {activeWorkflowForExec && (
        <ExecutionModal
          isOpen={!!activeWorkflowForExec}
          workflow={activeWorkflowForExec}
          onClose={() => setActiveWorkflowForExec(null)}
          onExecutionComplete={() => {
            loadDashboardData();
          }}
        />
      )}
    </div>
  );
};

/**
 * FlowSphere - Central API Service Layer
 * Supports seamless switching between Local Mock Mode (Phase 1)
 * and Live AWS API Gateway/Lambda Backend (Phase 2+).
 */
import axios from 'axios';
import {
  INITIAL_WORKFLOWS,
  INITIAL_EXECUTIONS,
  INITIAL_NOTIFICATIONS
} from './mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create Axios Client
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Storage Keys
const STORAGE_KEYS = {
  WORKFLOWS: 'flowsphere_workflows',
  EXECUTIONS: 'flowsphere_executions',
  NOTIFICATIONS: 'flowsphere_notifications',
  USE_MOCK: 'flowsphere_use_mock'
};

// Check if Mock Mode is active
export const isMockMode = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.USE_MOCK);
  if (stored !== null) return stored === 'true';
  return import.meta.env.VITE_USE_MOCK_API !== 'false';
};

export const setMockMode = (enabled) => {
  localStorage.setItem(STORAGE_KEYS.USE_MOCK, enabled ? 'true' : 'false');
};

// Helper: Seed or read from localStorage
const getLocalData = (key, initial) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error(`Failed parsing storage key ${key}`, e);
    return initial;
  }
};

const setLocalData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// ==========================================
// MOCK SIMULATION ENGINE (STEP FUNCTIONS + BEDROCK AI)
// ==========================================
const simulateServerlessExecution = async (workflow, inputData) => {
  const executionId = `exec-${Math.floor(1000 + Math.random() * 9000)}`;
  const startTime = new Date().toISOString();

  // Determine classification and sentiment for demo
  const messageText = (inputData?.message || JSON.stringify(inputData)).toLowerCase();
  let category = 'General';
  let routedTo = 'Customer Care Triage';
  let confidence = 0.92;

  if (messageText.includes('error') || messageText.includes('bug') || messageText.includes('gateway') || messageText.includes('crash')) {
    category = 'Technical';
    routedTo = 'Engineering Support Level 2';
    confidence = 0.96;
  } else if (messageText.includes('bill') || messageText.includes('refund') || messageText.includes('charged') || messageText.includes('payment') || messageText.includes('$')) {
    category = 'Billing';
    routedTo = 'Finance Dispute Desk';
    confidence = 0.98;
  }

  // Artificial task execution steps
  const executedTasks = (workflow.steps || []).map((step, idx) => {
    let taskOutput = { status: 'COMPLETED' };
    if (step.type === 'VALIDATION') {
      taskOutput = { valid: true, timestamp: new Date().toISOString() };
    } else if (step.type === 'AI_DECISION') {
      taskOutput = {
        modelUsed: step.config?.model || 'amazon.bedrock.claude-v2',
        predictedCategory: category,
        confidence: confidence,
        ruleFallbackUsed: false
      };
    } else if (step.type === 'BRANCHING') {
      taskOutput = { evaluatedRoute: routedTo, branchCriteriaMet: true };
    } else if (step.type === 'DATABASE_WRITE') {
      taskOutput = { dynamoTable: 'WorkflowStateStore', itemKey: executionId, writeConfirmed: true };
    } else if (step.type === 'NOTIFICATION') {
      taskOutput = { channel: 'SNS_EMAIL', messageDispatched: true };
    }

    return {
      task_id: `task-${idx + 1}-${Date.now().toString().slice(-4)}`,
      task_name: step.name,
      task_type: step.type,
      task_status: 'SUCCEEDED',
      duration_ms: Math.floor(200 + Math.random() * 800),
      output: taskOutput
    };
  });

  const totalDuration = executedTasks.reduce((acc, t) => acc + t.duration_ms, 300);
  const endTime = new Date(Date.now() + totalDuration).toISOString();

  const newExecution = {
    execution_id: executionId,
    workflow_id: workflow.workflow_id,
    workflow_name: workflow.name,
    user_id: workflow.user_id || 'usr-admin-01',
    execution_status: 'SUCCEEDED',
    started_at: startTime,
    completed_at: endTime,
    duration_ms: totalDuration,
    input_data: inputData || {},
    output_data: {
      result: 'Workflow execution processed successfully through AWS Step Functions.',
      ai_decision: { category, confidence, routed_to: routedTo },
      steps_completed: executedTasks.length
    },
    error_message: null,
    tasks: executedTasks
  };

  return newExecution;
};

// ==========================================
// WORKFLOW API METHODS
// ==========================================
export const workflowApi = {
  // GET /api/workflows
  getAll: async () => {
    if (isMockMode()) {
      return getLocalData(STORAGE_KEYS.WORKFLOWS, INITIAL_WORKFLOWS);
    }
    const response = await apiClient.get('/workflows');
    return response.data;
  },

  // GET /api/workflows/{workflow_id}
  getById: async (workflowId) => {
    if (isMockMode()) {
      const list = getLocalData(STORAGE_KEYS.WORKFLOWS, INITIAL_WORKFLOWS);
      const found = list.find((w) => w.workflow_id === workflowId);
      if (!found) throw new Error(`Workflow with ID ${workflowId} not found.`);
      return found;
    }
    const response = await apiClient.get(`/workflows/${workflowId}`);
    return response.data;
  },

  // POST /api/workflows
  create: async (workflowData) => {
    if (isMockMode()) {
      const list = getLocalData(STORAGE_KEYS.WORKFLOWS, INITIAL_WORKFLOWS);
      const newWorkflow = {
        workflow_id: `wf-${Math.floor(100 + Math.random() * 900)}`,
        user_id: 'usr-admin-01',
        name: workflowData.name,
        description: workflowData.description,
        trigger_type: workflowData.trigger_type || 'MANUAL',
        schedule_cron: workflowData.schedule_cron || '',
        status: workflowData.status || 'ACTIVE',
        steps: workflowData.steps || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const updated = [newWorkflow, ...list];
      setLocalData(STORAGE_KEYS.WORKFLOWS, updated);
      return newWorkflow;
    }
    const response = await apiClient.post('/workflows', workflowData);
    return response.data;
  },

  // PUT /api/workflows/{workflow_id}
  update: async (workflowId, workflowData) => {
    if (isMockMode()) {
      const list = getLocalData(STORAGE_KEYS.WORKFLOWS, INITIAL_WORKFLOWS);
      const index = list.findIndex((w) => w.workflow_id === workflowId);
      if (index === -1) throw new Error(`Workflow with ID ${workflowId} not found.`);
      const updatedWorkflow = {
        ...list[index],
        ...workflowData,
        updated_at: new Date().toISOString()
      };
      list[index] = updatedWorkflow;
      setLocalData(STORAGE_KEYS.WORKFLOWS, list);
      return updatedWorkflow;
    }
    const response = await apiClient.put(`/workflows/${workflowId}`, workflowData);
    return response.data;
  },

  // DELETE /api/workflows/{workflow_id}
  delete: async (workflowId) => {
    if (isMockMode()) {
      const list = getLocalData(STORAGE_KEYS.WORKFLOWS, INITIAL_WORKFLOWS);
      const filtered = list.filter((w) => w.workflow_id !== workflowId);
      setLocalData(STORAGE_KEYS.WORKFLOWS, filtered);
      return { success: true, message: `Workflow ${workflowId} deleted.` };
    }
    const response = await apiClient.delete(`/workflows/${workflowId}`);
    return response.data;
  },

  // POST /api/workflows/{workflow_id}/execute
  execute: async (workflowId, inputData = {}) => {
    if (isMockMode()) {
      const workflows = getLocalData(STORAGE_KEYS.WORKFLOWS, INITIAL_WORKFLOWS);
      const workflow = workflows.find((w) => w.workflow_id === workflowId);
      if (!workflow) throw new Error(`Workflow not found.`);

      // Simulate step functions execution
      const execution = await simulateServerlessExecution(workflow, inputData);

      // Save execution in localStorage
      const executions = getLocalData(STORAGE_KEYS.EXECUTIONS, INITIAL_EXECUTIONS);
      setLocalData(STORAGE_KEYS.EXECUTIONS, [execution, ...executions]);

      // Add in-app notification
      const notifications = getLocalData(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
      const newNotif = {
        notification_id: `notif-${Date.now()}`,
        user_id: 'usr-admin-01',
        execution_id: execution.execution_id,
        title: 'Workflow Executed',
        message: `Workflow "${workflow.name}" completed successfully.`,
        notification_type: 'SUCCESS',
        is_read: false,
        created_at: new Date().toISOString()
      };
      setLocalData(STORAGE_KEYS.NOTIFICATIONS, [newNotif, ...notifications]);

      return execution;
    }
    const response = await apiClient.post(`/workflows/${workflowId}/execute`, { input_data: inputData });
    return response.data;
  }
};

// ==========================================
// EXECUTION API METHODS
// ==========================================
export const executionApi = {
  // GET /api/executions
  getAll: async (filter = {}) => {
    if (isMockMode()) {
      let list = getLocalData(STORAGE_KEYS.EXECUTIONS, INITIAL_EXECUTIONS);
      if (filter.status && filter.status !== 'ALL') {
        list = list.filter((e) => e.execution_status === filter.status);
      }
      if (filter.workflow_id && filter.workflow_id !== 'ALL') {
        list = list.filter((e) => e.workflow_id === filter.workflow_id);
      }
      return list;
    }
    const response = await apiClient.get('/executions', { params: filter });
    return response.data;
  },

  // GET /api/executions/{execution_id}
  getById: async (executionId) => {
    if (isMockMode()) {
      const list = getLocalData(STORAGE_KEYS.EXECUTIONS, INITIAL_EXECUTIONS);
      const found = list.find((e) => e.execution_id === executionId);
      if (!found) throw new Error(`Execution with ID ${executionId} not found.`);
      return found;
    }
    const response = await apiClient.get(`/executions/${executionId}`);
    return response.data;
  },

  // POST /api/executions/{execution_id}/retry
  retry: async (executionId) => {
    if (isMockMode()) {
      const list = getLocalData(STORAGE_KEYS.EXECUTIONS, INITIAL_EXECUTIONS);
      const existing = list.find((e) => e.execution_id === executionId);
      if (!existing) throw new Error(`Execution not found.`);

      const workflows = getLocalData(STORAGE_KEYS.WORKFLOWS, INITIAL_WORKFLOWS);
      const workflow = workflows.find((w) => w.workflow_id === existing.workflow_id) || {
        workflow_id: existing.workflow_id,
        name: existing.workflow_name,
        steps: []
      };

      const retried = await simulateServerlessExecution(workflow, existing.input_data);
      retried.execution_id = `${executionId}-retry`;
      setLocalData(STORAGE_KEYS.EXECUTIONS, [retried, ...list]);
      return retried;
    }
    const response = await apiClient.post(`/executions/${executionId}/retry`);
    return response.data;
  },

  // GET /api/dashboard/stats
  getDashboardStats: async () => {
    if (isMockMode()) {
      const workflows = getLocalData(STORAGE_KEYS.WORKFLOWS, INITIAL_WORKFLOWS);
      const executions = getLocalData(STORAGE_KEYS.EXECUTIONS, INITIAL_EXECUTIONS);

      const totalWorkflows = workflows.length;
      const activeWorkflows = workflows.filter((w) => w.status === 'ACTIVE').length;
      const inactiveWorkflows = totalWorkflows - activeWorkflows;

      const totalExecutions = executions.length;
      const succeededExecutions = executions.filter((e) => e.execution_status === 'SUCCEEDED').length;
      const failedExecutions = executions.filter((e) => e.execution_status === 'FAILED').length;
      const runningExecutions = executions.filter((e) => e.execution_status === 'RUNNING').length;

      const successRate = totalExecutions > 0 ? Math.round((succeededExecutions / totalExecutions) * 100) : 100;

      // Mock 7-day trend
      const trendData = [
        { day: 'Mon', executions: 12, success: 11, failed: 1 },
        { day: 'Tue', executions: 18, success: 17, failed: 1 },
        { day: 'Wed', executions: 15, success: 14, failed: 1 },
        { day: 'Thu', executions: 22, success: 20, failed: 2 },
        { day: 'Fri', executions: 28, success: 27, failed: 1 },
        { day: 'Sat', executions: 10, success: 10, failed: 0 },
        { day: 'Sun', executions: 14, success: 13, failed: 1 }
      ];

      return {
        totalWorkflows,
        activeWorkflows,
        inactiveWorkflows,
        totalExecutions,
        succeededExecutions,
        failedExecutions,
        runningExecutions,
        successRate,
        trendData
      };
    }
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  }
};

// ==========================================
// NOTIFICATIONS & HEALTH API
// ==========================================
export const notificationApi = {
  // GET /api/notifications
  getAll: async () => {
    if (isMockMode()) {
      return getLocalData(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    }
    const response = await apiClient.get('/notifications');
    return response.data;
  },

  // PATCH /api/notifications/{notification_id}
  markAsRead: async (notificationId) => {
    if (isMockMode()) {
      const list = getLocalData(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
      const updated = list.map((n) =>
        n.notification_id === notificationId ? { ...n, is_read: true } : n
      );
      setLocalData(STORAGE_KEYS.NOTIFICATIONS, updated);
      return { success: true };
    }
    const response = await apiClient.patch(`/notifications/${notificationId}`, { is_read: true });
    return response.data;
  },

  // Mark all notifications as read
  markAllRead: async () => {
    if (isMockMode()) {
      const list = getLocalData(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
      const updated = list.map((n) => ({ ...n, is_read: true }));
      setLocalData(STORAGE_KEYS.NOTIFICATIONS, updated);
      return { success: true };
    }
    const response = await apiClient.patch('/notifications/mark-all-read');
    return response.data;
  }
};

export const healthApi = {
  // GET /api/health
  check: async () => {
    if (isMockMode()) {
      return {
        status: 'HEALTHY',
        mode: 'MOCK_LOCAL_STORAGE',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        cloudServices: {
          stepFunctions: 'Simulated',
          lambda: 'Simulated',
          dynamoDb: 'Simulated (LocalStorage)',
          bedrockAi: 'Rule-Based Fallback + Claude-v2 Mock Engine'
        }
      };
    }
    const response = await apiClient.get('/health');
    return response.data;
  }
};

/**
 * FlowSphere - Initial Mock Data & LocalStorage Management
 * Used for Phase 1 local execution, testing, and academic project demonstration.
 */

export const INITIAL_WORKFLOWS = [
  {
    workflow_id: 'wf-101',
    user_id: 'usr-admin-01',
    name: 'Customer Support Ticket Classifier',
    description: 'Validates customer incoming tickets, uses Amazon Bedrock AI to classify intent (Technical, Billing, General), executes conditional branching, saves state to DynamoDB, and dispatches automated responses.',
    trigger_type: 'EVENT', // MANUAL, SCHEDULED, EVENT
    schedule_cron: 'rate(15 minutes)',
    status: 'ACTIVE',
    created_at: '2026-10-20T09:30:00Z',
    updated_at: '2026-10-23T14:15:00Z',
    steps: [
      {
        id: 'step-1',
        name: 'Validate Ticket Payload',
        type: 'VALIDATION',
        description: 'Verify customer ID, contact email, and message body completeness.',
        config: { requireEmail: true, minLength: 10 }
      },
      {
        id: 'step-2',
        name: 'Bedrock AI Intent Classification',
        type: 'AI_DECISION',
        description: 'Leverages AI to categorize ticket into Technical, Billing, or General Inquiry with sentiment scoring.',
        config: { model: 'amazon.bedrock.claude-v2', confidenceThreshold: 0.85, fallbackRule: 'GENERAL' }
      },
      {
        id: 'step-3',
        name: 'Conditional Branch & Routing',
        type: 'BRANCHING',
        description: 'Branch workflow depending on AI predicted category.',
        config: {
          branches: [
            { category: 'Technical', targetTier: 'Engineering Support Level 2' },
            { category: 'Billing', targetTier: 'Finance Dispute Desk' },
            { category: 'General', targetTier: 'Customer Care Triage' }
          ]
        }
      },
      {
        id: 'step-4',
        name: 'Persist Ticket in DynamoDB',
        type: 'DATABASE_WRITE',
        description: 'Store enriched ticket and AI decision audit trail in DynamoDB table.',
        config: { table: 'SupportTickets', auditLog: true }
      },
      {
        id: 'step-5',
        name: 'Dispatch In-App / Email Notification',
        type: 'NOTIFICATION',
        description: 'Send acknowledgment notification to customer and routing alert to the department queue.',
        config: { channel: 'SNS_EMAIL', template: 'ticket_confirmation' }
      }
    ]
  },
  {
    workflow_id: 'wf-102',
    user_id: 'usr-admin-01',
    name: 'Automated Invoice Anomaly Detection',
    description: 'Scheduled batch trigger checking incoming invoices, analyzing vendor discrepancies with AI, and flagging suspicious transactions.',
    trigger_type: 'SCHEDULED',
    schedule_cron: 'cron(0 0 * * ? *)', // Daily midnight
    status: 'ACTIVE',
    created_at: '2026-10-21T11:00:00Z',
    updated_at: '2026-10-22T16:00:00Z',
    steps: [
      {
        id: 'step-1',
        name: 'Ingest Invoice Records',
        type: 'VALIDATION',
        description: 'Validate invoice tax ID, amounts, and currency conformity.',
        config: { maxAllowedAmount: 50000 }
      },
      {
        id: 'step-2',
        name: 'AI Anomaly & Fraud Scoring',
        type: 'AI_DECISION',
        description: 'Evaluate vendor pricing drift against historical baselines using AI pattern matching.',
        config: { model: 'bedrock-titan-text-express', thresholdScore: 75 }
      },
      {
        id: 'step-3',
        name: 'Flag High-Risk Transactions',
        type: 'DATABASE_WRITE',
        description: 'Tag invoice record in DynamoDB with risk score and audit notes.',
        config: { table: 'Invoices', statusField: 'AUDIT_PENDING' }
      }
    ]
  },
  {
    workflow_id: 'wf-103',
    user_id: 'usr-admin-01',
    name: 'User KYC & Document Verification',
    description: 'Manual or event-driven workflow to verify national IDs, extract metadata using OCR/AI, and grant tiered access.',
    trigger_type: 'MANUAL',
    schedule_cron: '',
    status: 'INACTIVE',
    created_at: '2026-10-22T08:00:00Z',
    updated_at: '2026-10-22T08:00:00Z',
    steps: [
      {
        id: 'step-1',
        name: 'Inspect File Upload in S3',
        type: 'VALIDATION',
        description: 'Confirm file format (PDF, PNG) and scan for virus signatures.',
        config: { allowedFormats: ['pdf', 'png', 'jpg'] }
      },
      {
        id: 'step-2',
        name: 'Extract Credentials with AI Vision',
        type: 'AI_DECISION',
        description: 'Extract identity details and match selfie against photo ID.',
        config: { model: 'bedrock-multimodal', matchThreshold: 0.9 }
      },
      {
        id: 'step-3',
        name: 'Update Account Tier in DynamoDB',
        type: 'DATABASE_WRITE',
        description: 'Mark user profile verificationStatus=VERIFIED.',
        config: { table: 'UserProfiles' }
      }
    ]
  }
];

export const INITIAL_EXECUTIONS = [
  {
    execution_id: 'exec-8910',
    workflow_id: 'wf-101',
    workflow_name: 'Customer Support Ticket Classifier',
    user_id: 'usr-admin-01',
    execution_status: 'SUCCEEDED',
    started_at: '2026-10-24T06:10:00Z',
    completed_at: '2026-10-24T06:10:04Z',
    duration_ms: 4120,
    input_data: {
      ticket_id: 'TCK-4819',
      customer_email: 'sarah.connor@example.com',
      message: 'Hello, my account was billed twice for the enterprise cloud license renew. Please refund $490 immediately.'
    },
    output_data: {
      category: 'Billing',
      ai_confidence: 0.97,
      sentiment: 'Frustrated',
      routed_to: 'Finance Dispute Desk',
      ticket_saved: true,
      notification_sent: true
    },
    error_message: null,
    tasks: [
      { task_id: 't-1', task_name: 'Validate Ticket Payload', task_status: 'SUCCEEDED', duration_ms: 320, output: { valid: true } },
      { task_id: 't-2', task_name: 'Bedrock AI Intent Classification', task_status: 'SUCCEEDED', duration_ms: 1850, output: { predictedCategory: 'Billing', confidence: 0.97, sentiment: 'Frustrated' } },
      { task_id: 't-3', task_name: 'Conditional Branch & Routing', task_status: 'SUCCEEDED', duration_ms: 210, output: { route: 'Finance Dispute Desk' } },
      { task_id: 't-4', task_name: 'Persist Ticket in DynamoDB', task_status: 'SUCCEEDED', duration_ms: 840, output: { dynamoPartitionKey: 'TCK-4819', status: 'RECORD_SAVED' } },
      { task_id: 't-5', task_name: 'Dispatch In-App / Email Notification', task_status: 'SUCCEEDED', duration_ms: 900, output: { messageId: 'sns-msg-992384' } }
    ]
  },
  {
    execution_id: 'exec-8911',
    workflow_id: 'wf-101',
    workflow_name: 'Customer Support Ticket Classifier',
    user_id: 'usr-admin-01',
    execution_status: 'SUCCEEDED',
    started_at: '2026-10-24T05:22:00Z',
    completed_at: '2026-10-24T05:22:03Z',
    duration_ms: 3410,
    input_data: {
      ticket_id: 'TCK-4818',
      customer_email: 'alex.dev@corp.net',
      message: 'Encountering 502 Bad Gateway error when invoking the Step Functions execution API via AWS SDK.'
    },
    output_data: {
      category: 'Technical',
      ai_confidence: 0.94,
      sentiment: 'Neutral',
      routed_to: 'Engineering Support Level 2',
      ticket_saved: true,
      notification_sent: true
    },
    error_message: null,
    tasks: [
      { task_id: 't-1', task_name: 'Validate Ticket Payload', task_status: 'SUCCEEDED', duration_ms: 280, output: { valid: true } },
      { task_id: 't-2', task_name: 'Bedrock AI Intent Classification', task_status: 'SUCCEEDED', duration_ms: 1620, output: { predictedCategory: 'Technical', confidence: 0.94 } },
      { task_id: 't-3', task_name: 'Conditional Branch & Routing', task_status: 'SUCCEEDED', duration_ms: 190, output: { route: 'Engineering Support Level 2' } },
      { task_id: 't-4', task_name: 'Persist Ticket in DynamoDB', task_status: 'SUCCEEDED', duration_ms: 720, output: { dynamoPartitionKey: 'TCK-4818', status: 'RECORD_SAVED' } },
      { task_id: 't-5', task_name: 'Dispatch In-App / Email Notification', task_status: 'SUCCEEDED', duration_ms: 600, output: { messageId: 'sns-msg-992385' } }
    ]
  },
  {
    execution_id: 'exec-8912',
    workflow_id: 'wf-102',
    workflow_name: 'Automated Invoice Anomaly Detection',
    user_id: 'usr-admin-01',
    execution_status: 'FAILED',
    started_at: '2026-10-24T04:00:00Z',
    completed_at: '2026-10-24T04:00:05Z',
    duration_ms: 5120,
    input_data: {
      invoice_id: 'INV-4091',
      vendor: 'Quantum Cloud Ltd',
      amount: 94000.00
    },
    output_data: null,
    error_message: 'ValidationException: Invoice amount $94,000 exceeds maximum allowable single-transaction limit of $50,000.',
    tasks: [
      { task_id: 't-1', task_name: 'Ingest Invoice Records', task_status: 'FAILED', duration_ms: 450, output: { error: 'Amount exceeds limit' } }
    ]
  },
  {
    execution_id: 'exec-8913',
    workflow_id: 'wf-101',
    workflow_name: 'Customer Support Ticket Classifier',
    user_id: 'usr-admin-01',
    execution_status: 'SUCCEEDED',
    started_at: '2026-10-23T18:40:00Z',
    completed_at: '2026-10-23T18:40:03Z',
    duration_ms: 3290,
    input_data: {
      ticket_id: 'TCK-4817',
      customer_email: 'rachel@startup.io',
      message: 'Can you provide the sales brochure and enterprise compliance certification documentation?'
    },
    output_data: {
      category: 'General',
      ai_confidence: 0.91,
      sentiment: 'Curious',
      routed_to: 'Customer Care Triage',
      ticket_saved: true,
      notification_sent: true
    },
    error_message: null,
    tasks: [
      { task_id: 't-1', task_name: 'Validate Ticket Payload', task_status: 'SUCCEEDED', duration_ms: 260, output: { valid: true } },
      { task_id: 't-2', task_name: 'Bedrock AI Intent Classification', task_status: 'SUCCEEDED', duration_ms: 1450, output: { predictedCategory: 'General', confidence: 0.91 } },
      { task_id: 't-3', task_name: 'Conditional Branch & Routing', task_status: 'SUCCEEDED', duration_ms: 220, output: { route: 'Customer Care Triage' } },
      { task_id: 't-4', task_name: 'Persist Ticket in DynamoDB', task_status: 'SUCCEEDED', duration_ms: 710, output: { status: 'RECORD_SAVED' } },
      { task_id: 't-5', task_name: 'Dispatch In-App / Email Notification', task_status: 'SUCCEEDED', duration_ms: 650, output: { messageId: 'sns-msg-992386' } }
    ]
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    notification_id: 'notif-1',
    user_id: 'usr-admin-01',
    execution_id: 'exec-8910',
    title: 'Execution Completed',
    message: 'Workflow "Customer Support Ticket Classifier" finished successfully in 4.1s.',
    notification_type: 'SUCCESS', // SUCCESS, WARNING, ERROR, INFO
    is_read: false,
    created_at: '2026-10-24T06:10:05Z'
  },
  {
    notification_id: 'notif-2',
    user_id: 'usr-admin-01',
    execution_id: 'exec-8912',
    title: 'Execution Failed',
    message: 'Workflow "Automated Invoice Anomaly Detection" failed: Invoice amount exceeded limit.',
    notification_type: 'ERROR',
    is_read: false,
    created_at: '2026-10-24T04:00:06Z'
  },
  {
    notification_id: 'notif-3',
    user_id: 'usr-admin-01',
    execution_id: null,
    title: 'Scheduled Trigger Event',
    message: 'EventBridge cron triggered automated daily batch check.',
    notification_type: 'INFO',
    is_read: true,
    created_at: '2026-10-24T00:00:00Z'
  }
];

export const INITIAL_USER = {
  id: 'usr-admin-01',
  name: 'Alex Mercer',
  email: 'admin@flowsphere.cloud',
  role: 'Cloud Architect / Admin',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
};

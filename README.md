# Serverless Intelligent Workflow Automation Platform

[![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-61dafb?style=flat-square&logo=react)](https://reactjs.org/)
[![AWS](https://img.shields.io/badge/Cloud-AWS%20Serverless-ff9900?style=flat-square&logo=amazon-aws)](https://aws.amazon.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

An enterprise-grade, serverless cloud platform for designing, executing, and monitoring automated business workflows orchestrated via AWS Step Functions and powered by Amazon Bedrock AI decision engines.

---

## 🌟 Key Features

- **Dynamic Workflow Builder**: Form-based pipeline configuration for validation, Bedrock AI classification, conditional branching, DynamoDB persistence, and notifications.
- **Interactive Step Functions Pipeline**: Real-time visualization of state transitions, task outcomes, and execution latency.
- **AI-Powered Intent Decision Engine**: Categorizes inputs with Amazon Bedrock (Claude-v2 / Titan) and deterministic fallback rules.
- **Operational Dashboard & Telemetry**: KPI metric cards, execution volume area charts, outcome distribution donut charts, and failure tracking.
- **Auditing & Reporting**: Granular execution monitoring, status filtering, failure retry mechanism, and CSV export.
- **Dual-Mode Engine**: Seamless toggle between local client simulation mode (Phase 1) and live AWS API Gateway backend (Phase 2+).

---

## 🏛️ System Architecture

```text
[ React Frontend UI ]
        │
        ▼
[ Amazon API Gateway / Cognito ]
        │
        ▼
[ AWS Step Functions (State Machine) ]
   ├── Task 1: Payload Validation Lambda
   ├── Task 2: Amazon Bedrock AI Decision Engine (with Rule Fallback)
   ├── Task 3: Conditional Branching Router
   ├── Task 4: Amazon DynamoDB Persistence
   └── Task 5: Amazon SNS / Notification Dispatcher
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation & Local Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Savitha1009/Serverless-Intelligent-Workflow-Automation-Platform.git
   cd Serverless-Intelligent-Workflow-Automation-Platform
   ```

2. **Run using the PowerShell launcher (Windows)**:
   ```powershell
   .\run.ps1
   ```
   *Or double-click `run.bat` in Windows Explorer.*

3. **Or run manually**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the Web Console**:
   Open [http://localhost:5174/](http://localhost:5174/) or [http://localhost:5173/](http://localhost:5173/) in your web browser.

---

## 📂 Project Structure

```text
serverless-workflow-platform/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/       # MetricCard, ExecutionModal, StatusBadge, etc.
│   │   ├── pages/            # Dashboard, Workflows, Execution Monitoring, Settings
│   │   ├── layouts/          # MainLayout with Sidebar and Topbar
│   │   ├── services/         # Unified API Service and Mock Simulation Engine
│   │   ├── context/          # Auth and User Context
│   │   ├── App.jsx           # Routing configuration
│   │   └── index.css         # Design system & dark-mode styling
│   ├── package.json
│   └── .env.example
├── run.bat                   # 1-click Windows Explorer launcher
├── run.ps1                   # PowerShell quick launch script
├── package.json              # Root npm workspace commands
└── README.md
```

---

## 🛡️ License
Distributed under the MIT License.

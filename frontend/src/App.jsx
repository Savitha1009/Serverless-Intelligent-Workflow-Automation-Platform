import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkflowListPage } from './pages/WorkflowListPage';
import { CreateWorkflowPage } from './pages/CreateWorkflowPage';
import { EditWorkflowPage } from './pages/EditWorkflowPage';
import { WorkflowDetailsPage } from './pages/WorkflowDetailsPage';
import { ExecutionHistoryPage } from './pages/ExecutionHistoryPage';
import { ExecutionDetailsPage } from './pages/ExecutionDetailsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Main Layout routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="workflows" element={<WorkflowListPage />} />
            <Route path="workflows/create" element={<CreateWorkflowPage />} />
            <Route path="workflows/edit/:id" element={<EditWorkflowPage />} />
            <Route path="workflows/:id" element={<WorkflowDetailsPage />} />
            <Route path="executions" element={<ExecutionHistoryPage />} />
            <Route path="executions/:id" element={<ExecutionDetailsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

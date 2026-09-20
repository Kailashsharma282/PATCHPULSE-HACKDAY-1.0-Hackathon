import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppShell } from './layout/AppShell';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReportSubmitPage } from './pages/ReportSubmitPage';
import { ReportsListPage } from './pages/ReportsListPage';
import { IssuesListPage } from './pages/IssuesListPage';
import { IssueDetailPage } from './pages/IssueDetailPage';
import { WorkOrdersPage } from './pages/WorkOrdersPage';
import { WorkOrderDetailPage } from './pages/WorkOrderDetailPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { MapExplorerPage } from './pages/MapExplorerPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminConfigPage } from './pages/AdminConfigPage';
import { DemoSimulationPage } from './pages/DemoSimulationPage';
import { HealthPage } from './pages/HealthPage';
import { NotFoundPage } from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Marketing Landing */}
              <Route path="/" element={<AppShell />}>
                <Route index element={<LandingPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="report" element={<ReportSubmitPage />} />
                <Route path="reports" element={<ReportsListPage />} />
                <Route path="issues" element={<IssuesListPage />} />
                <Route path="issues/:id" element={<IssueDetailPage />} />
                <Route path="work-orders" element={<WorkOrdersPage />} />
                <Route path="work-orders/:id" element={<WorkOrderDetailPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="map" element={<MapExplorerPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="admin" element={<AdminDashboardPage />} />
                <Route path="admin/users" element={<AdminUsersPage />} />
                <Route path="admin/configuration" element={<AdminConfigPage />} />
                <Route path="demo" element={<DemoSimulationPage />} />
                <Route path="health" element={<HealthPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

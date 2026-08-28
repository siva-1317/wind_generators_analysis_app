import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AppShell } from '../components/layouts/AppShell';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { GeneratorsPage } from '../pages/GeneratorsPage';
import { GeneratorDetailPage } from '../pages/GeneratorDetailPage';
import { TelemetryPage } from '../pages/TelemetryPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { AlertsPage } from '../pages/AlertsPage';
import { AIInsightsPage } from '../pages/AIInsightsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { ProfilePage } from '../pages/ProfilePage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#0b0f17] flex items-center justify-center text-slate-400 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Authenticating WindSense Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="generators" element={<GeneratorsPage />} />
        <Route path="generators/:id" element={<GeneratorDetailPage />} />
        <Route path="esp32-setup" element={<Navigate to="/settings" replace />} />
        <Route path="telemetry" element={<TelemetryPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="ai-insights" element={<AIInsightsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

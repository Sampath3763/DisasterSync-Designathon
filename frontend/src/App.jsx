import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AlertSubmission from './pages/AlertSubmission';
import ResourceManagement from './pages/ResourceManagement';
import EquipmentUsage from './pages/EquipmentUsage';
import TrainingModule from './pages/TrainingModule';
import TeamCommunication from './pages/TeamCommunication';
import UserManagement from './pages/UserManagement';
import { useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="alerts" element={<AlertSubmission />} />
        <Route path="resources" element={<ResourceManagement />} />
        <Route path="equipment" element={<EquipmentUsage />} />
        <Route path="training" element={<TrainingModule />} />
        <Route path="communication" element={<TeamCommunication />} />
        <Route path="users" element={<ProtectedRoute adminOnly><UserManagement /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CitizenDashboard from './pages/CitizenDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ReportIssuePage from './pages/ReportIssuePage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import MapExplorerPage from './pages/MapExplorerPage';
import NotificationsPage from './pages/NotificationsPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

function DashboardRouter() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'worker':
      return <WorkerDashboard />;
    case 'officer':
      return <OfficerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <CitizenDashboard />;
  }
}

function MainLayout() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-cyber-bg text-cyber-text">
      {user && <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/report" element={<ReportIssuePage />} />
            <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
            <Route path="/map" element={<MapExplorerPage />} />
            <Route path="/analytics" element={<AdminDashboard />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <MainLayout />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

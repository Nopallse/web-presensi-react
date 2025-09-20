import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import AppShell from '../components/layout/AppShell';

// Auth pages
import LoginPage from '../features/auth/pages/LoginPage';

// Dashboard
import DashboardPage from '../features/dashboard/pages/DashboardPage';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <AppShell>{children}</AppShell>;
};

// Public route component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        
        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        
        {/* Pegawai routes */}
        <Route
          path="/pegawai"
          element={
            <ProtectedRoute>
              <div>Pegawai List Page (Coming Soon)</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pegawai/:id"
          element={
            <ProtectedRoute>
              <div>Pegawai Detail Page (Coming Soon)</div>
            </ProtectedRoute>
          }
        />
        
        {/* SKPD routes */}
        <Route
          path="/skpd"
          element={
            <ProtectedRoute>
              <div>SKPD List Page (Coming Soon)</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/skpd/:id"
          element={
            <ProtectedRoute>
              <div>SKPD Detail Page (Coming Soon)</div>
            </ProtectedRoute>
          }
        />
        
        {/* Lokasi routes */}
        <Route
          path="/lokasi"
          element={
            <ProtectedRoute>
              <div>Lokasi List Page (Coming Soon)</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/lokasi/create"
          element={
            <ProtectedRoute>
              <div>Lokasi Create Page (Coming Soon)</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/lokasi/:id"
          element={
            <ProtectedRoute>
              <div>Lokasi Detail Page (Coming Soon)</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/lokasi/:id/edit"
          element={
            <ProtectedRoute>
              <div>Lokasi Edit Page (Coming Soon)</div>
            </ProtectedRoute>
          }
        />
        
        {/* Kegiatan routes */}
        <Route
          path="/kegiatan"
          element={
            <ProtectedRoute>
              <div>Kegiatan List Page (Coming Soon)</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/kegiatan/create"
          element={
            <ProtectedRoute>
              <div>Kegiatan Create Page (Coming Soon)</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/kegiatan/:id"
          element={
            <ProtectedRoute>
              <div>Kegiatan Detail Page (Coming Soon)</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/kegiatan/:id/edit"
          element={
            <ProtectedRoute>
              <div>Kegiatan Edit Page (Coming Soon)</div>
            </ProtectedRoute>
          }
        />
        
        {/* Presensi routes */}
        <Route
          path="/presensi"
          element={
            <ProtectedRoute>
              <div>Presensi List Page (Coming Soon)</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/presensi/:id"
          element={
            <ProtectedRoute>
              <div>Presensi Detail Page (Coming Soon)</div>
            </ProtectedRoute>
          }
        />
        
        {/* Jam Dinas routes */}
        <Route
          path="/jam-dinas/kelola"
          element={
            <ProtectedRoute>
              <div>Kelola Jam Dinas Page (Coming Soon)</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/jam-dinas/organisasi"
          element={
            <ProtectedRoute>
              <div>Jam Dinas per Organisasi Page (Coming Soon)</div>
            </ProtectedRoute>
          }
        />
        
        {/* Pengaturan routes */}
        <Route
          path="/pengaturan/general"
          element={
            <ProtectedRoute>
              <div>General Setting Page (Coming Soon)</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pengaturan/account"
          element={
            <ProtectedRoute>
              <div>Account Setting Page (Coming Soon)</div>
            </ProtectedRoute>
          }
        />
        
        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
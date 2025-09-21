import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import AppShell from '../components/layout/AppShell';

// Auth pages
import LoginPage from '../features/auth/pages/LoginPage';

// Dashboard
import DashboardPage from '../features/dashboard/pages/DashboardPage';

// Pegawai
import { PegawaiPage } from '../features/pegawai';

// SKPD  
import { SKPDPage } from '../features/skpd';

// Lokasi
import LokasiPage from '../features/lokasi/pages/LokasiPage';
import LokasiDetail from '../features/lokasi/pages/LokasiDetail';
import LokasiCreate from '../features/lokasi/pages/LokasiCreate';
import LokasiEdit from '../features/lokasi/pages/LokasiEdit';

import { KegiatanPage, KegiatanDetail, KegiatanCreate, KegiatanEdit } from '../features/kegiatan';
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
              <PegawaiPage />
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
              <SKPDPage />
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
              <LokasiPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lokasi/create"
          element={
            <ProtectedRoute>
              <LokasiCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lokasi/:id"
          element={
            <ProtectedRoute>
              <LokasiDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lokasi/:id/edit"
          element={
            <ProtectedRoute>
              <LokasiEdit />
            </ProtectedRoute>
          }
        />
        
        {/* Kegiatan routes */}
        <Route
          path="/kegiatan"
          element={
            <ProtectedRoute>
              <KegiatanPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kegiatan/create"
          element={
            <ProtectedRoute>
              <KegiatanCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kegiatan/:id"
          element={
            <ProtectedRoute>
              <KegiatanDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kegiatan/:id/edit"
          element={
            <ProtectedRoute>
              <KegiatanEdit />
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
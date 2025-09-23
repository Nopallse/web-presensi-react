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

// Lokasi
import LokasiPage from '../features/lokasi/pages/LokasiPage';
import LokasiDetail from '../features/lokasi/pages/LokasiDetail';
import LokasiCreate from '../features/lokasi/pages/LokasiCreate';
import LokasiEdit from '../features/lokasi/pages/LokasiEdit';

// Kegiatan
import { KegiatanPage, KegiatanDetail, KegiatanCreate, KegiatanEdit } from '../features/kegiatan';

// Unit Kerja
import { UnitKerjaPage } from '../features/unit-kerja';

// Pengaturan
import PengaturanPage from '../features/pengaturan/pages/PengaturanPage';

// Jam Dinas
import { JamDinasPage, JamDinasForm, JamDinasOrganisasiPage } from '../features/jam-dinas';
const JamDinasDetail = React.lazy(() => import('../features/jam-dinas/pages/JamDinasDetail'));

// Presensi
import { PresensiPage, PresensiDetail, MonthlyPresensiPage } from '../features/presensi';

// Device Reset
import DeviceResetPage from '../features/device-reset/pages/DeviceResetPage';

// Admin Logs
import { AdminLogsPage, AdminLogsStatsPage } from '../features/admin-logs';

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

        <Route
          path="/skpd/:id"
          element={
            <ProtectedRoute>
              <div>SKPD Detail Page (Coming Soon)</div>
            </ProtectedRoute>
          }
        />
        
        {/* Unit Kerja routes */}
        <Route
          path="/unit-kerja"
          element={
            <ProtectedRoute>
              <UnitKerjaPage />
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
              <PresensiPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/presensi/monthly"
          element={
            <ProtectedRoute>
              <MonthlyPresensiPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/presensi/:id"
          element={
            <ProtectedRoute>
              <PresensiDetail />
            </ProtectedRoute>
          }
        />
        
        {/* Device Reset routes */}
        <Route
          path="/device-reset"
          element={
            <ProtectedRoute>
              <DeviceResetPage />
            </ProtectedRoute>
          }
        />
        
        {/* Jam Dinas routes */}
        <Route
          path="/jam-dinas"
          element={
            <ProtectedRoute>
              <JamDinasPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jam-dinas/create"
          element={
            <ProtectedRoute>
              <JamDinasForm mode="create" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jam-dinas/:id"
          element={
            <ProtectedRoute>
              <React.Suspense fallback={<div>Loading...</div>}>
                <JamDinasDetail />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/jam-dinas/:id/edit"
          element={
            <ProtectedRoute>
              <JamDinasForm mode="edit" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jam-dinas/kelola"
          element={
            <ProtectedRoute>
              <JamDinasPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jam-dinas/organisasi"
          element={
            <ProtectedRoute>
              <JamDinasOrganisasiPage />
            </ProtectedRoute>
          }
        />
        
        {/* Admin Logs routes */}
        <Route
          path="/admin-logs"
          element={
            <ProtectedRoute>
              <AdminLogsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-logs/stats"
          element={
            <ProtectedRoute>
              <AdminLogsStatsPage />
            </ProtectedRoute>
          }
        />
        
        {/* Pengaturan routes */}
        <Route
          path="/pengaturan"
          element={
            <ProtectedRoute>
              <PengaturanPage />
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
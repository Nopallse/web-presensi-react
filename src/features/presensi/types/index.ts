// User interface for Kehadiran
export interface User {
  id: string;
  username: string;
  email: string;
  level: string;
  id_opd?: string;
  id_upt?: string;
  status: string;
}

// Lokasi interface for Kehadiran (updated for new response structure)
export interface Lokasi {
  lokasi_id: number;
  lat: number;
  lng: number;
  ket: string;
  range?: number;
  status?: boolean;
}

// SKPD interface for Pegawai
export interface SKPD {
  kdskpd: string;
  nmskpd: string;
  status_skpd: string;
}

// Pegawai interface for Kehadiran (updated for new response structure)
export interface Pegawai {
  nip: string;
  nama: string;
  jenis_pegawai?: string;
  status_aktif?: string;
  email?: string;
  skpd?: SKPD;
}

// Satker interface
export interface Satker {
  kdsatker: string;
  nmsatker: string;
}

// Bidang interface
export interface Bidang {
  bidangf: string;
  nmbidang: string;
}

// Sub Bidang interface
export interface SubBidang {
  subf: string;
  nmsub: string;
}

// Main Kehadiran entity based on backend model (updated for new response structure)
export interface Kehadiran {
  pegawai: {
    nip: string;
    nama: string;
    kdsatker: string;
    bidangf: string;
    subf: string;
    nm_unit_kerja: string;
  };
  absen_checkin: string;
  absen_checkout: string;
  absen_apel: string;
  absen_sore: string;
  absen_tgl: string;
}

// API response interfaces
export interface KehadiranApiResponse {
  success: boolean;
  data: Kehadiran[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface KehadiranDetailApiResponse {
  success: boolean;
  data: Kehadiran;
}

// Filter parameters for getAllKehadiran
export interface KehadiranFilters {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  lokasi_id?: string;
  satker?: string;
  bidang?: string;
  status?: 'HAP' | 'TAP' | 'HAS' | 'CP'; // Status untuk filter absen_apel atau absen_sore
}

// Monthly attendance interfaces
export interface MonthlyAttendanceFilters {
  year?: number;
  month?: number;
  satker?: string;
  bidang?: string;
  user_id?: string;
  page?: number;
  limit?: number;
}

export interface AttendanceStats {
  total: number;
  HADIR: number;
  HAP: number; // Hadir Apel Pagi
  TAP: number; // Telat Apel Pagi
  HAS: number; // Hadir Apel Sore
  CP: number;  // Cepat Pulang
}

export interface DailyAttendanceBreakdown {
  date: string;
  HADIR: number;
  HAP: number;
  TAP: number;
  HAS: number;
  CP: number;
  total: number;
}

export interface MonthlyAttendanceData {
  month: number;
  year: number;
  period: string;
  summary: AttendanceStats;
  dailyBreakdown: DailyAttendanceBreakdown[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface MonthlyAttendanceApiResponse {
  success: boolean;
  data: MonthlyAttendanceData;
}

// Export interfaces
export interface ExportFilters {
  // For daily export (harian)
  tanggal?: string;
  lokasi_id?: string;
  satker?: string;
  bidang?: string;
  search?: string;
  status?: 'HAP' | 'TAP' | 'HAS' | 'CP';
  
  // For monthly export (bulanan)
  month?: number;
  year?: number;
  user_id?: string;
}

// Status options for dropdowns and filters
export const ABSEN_APEL_OPTIONS = [
  { value: 'HAP', label: 'Hadir Apel Pagi' },
  { value: 'TAP', label: 'Telat Apel Pagi' }
] as const;

export const ABSEN_SORE_OPTIONS = [
  { value: 'HAS', label: 'Hadir Apel Sore' },
  { value: 'CP', label: 'Cepat Pulang' }
] as const;

export const ALL_STATUS_OPTIONS = [
  ...ABSEN_APEL_OPTIONS,
  ...ABSEN_SORE_OPTIONS
] as const;

// Table column configurations
export interface TableColumn {
  title: string;
  dataIndex: string;
  key: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

// Component props interfaces
export interface PresensiPageProps {
  title?: string;
}


export interface MonthlyViewProps {
  initialYear?: number;
  initialMonth?: number;
}

// Form interfaces (for future edit capabilities if needed)
export interface KehadiranFormData {
  absen_nip: string;
  lokasi_id: string;
  absen_tgl: string;
  absen_checkin?: string;
  absen_checkout?: string;
  absen_kat: string;
  absen_apel?: 'HAP' | 'TAP';
  absen_sore?: 'HAS' | 'CP';
}

// Search and filter state
export interface FilterState {
  search: string;
  selectedDate: string | null; // Changed from dateRange to single date
  lokasi_id: string;
  satker: string;
  bidang: string;
  status: string;
  pagination: {
    current: number;
    pageSize: number;
  };
}

// API error interface
export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}
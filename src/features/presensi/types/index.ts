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

// Lokasi interface for Kehadiran
export interface Lokasi {
  lokasi_id: string;
  lat: string;
  lng: string;
  range?: number;
  ket: string;
  status?: string;
}

// Main Kehadiran entity based on backend model
export interface Kehadiran {
  absen_id: string;
  absen_nip: string;
  lokasi_id: string;
  absen_tgl: string; // Date string in YYYY-MM-DD format
  absen_tgljam: string; // DateTime string
  absen_checkin?: string; // Time string for check-in
  absen_checkout?: string; // Time string for check-out
  absen_kat: string; // Kategori kehadiran (HADIR, etc.)
  absen_apel?: 'HAP' | 'TAP' | null; // Hadir Apel Pagi | Telat Apel Pagi
  absen_sore?: 'HAS' | 'CP' | null; // Hadir Apel Sore | Cepat Pulang
  User?: User;
  Lokasi?: Lokasi;
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
  status?: 'HAP' | 'TAP' | 'HAS' | 'CP'; // Status untuk filter absen_apel atau absen_sore
}

// Monthly attendance interfaces
export interface MonthlyAttendanceFilters {
  year?: number;
  month?: number;
  lokasi_id?: string;
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

export interface PresensiDetailProps {
  id: string;
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
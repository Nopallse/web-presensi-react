// Base types
export type StatusJamDinas = 0 | 1;
export type TipeJadwal = 'normal' | 'ramadhan';
export type HariKerja = 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu' | 'minggu';

// Jam Dinas Detail interface
export interface JamDinasDetail {
  id: number;
  id_jamdinas: number;
  hari: HariKerja;
  tipe: TipeJadwal;
  jam_masuk_mulai: string; // HH:mm:ss format
  jam_masuk_selesai: string; // HH:mm:ss format
  jam_pulang_mulai: string; // HH:mm:ss format
  jam_pulang_selesai: string; // HH:mm:ss format
  createdAt: string;
  updatedAt: string;
}

// Jam Dinas Assignment interface
export interface JamDinasAssignment {
  dinset_id: number;
  dinset_nama: string;
  id_skpd?: string;
  id_satker?: string;
  id_bidang?: string;
  id_jamdinas: number;
  status: StatusJamDinas;
  createdAt: string;
  updatedAt: string;
  jamDinas?: JamDinas;
}

// Organization Assignment types
export interface OrganizationAssignment {
  dinset_id: number;
  dinset_nama: string;
  id_skpd?: string;
  id_satker?: string;
  id_bidang?: string;
  id_jamdinas: number;
  status: StatusJamDinas;
  createdAt: string;
  updatedAt: string;
  jamDinas: {
    id: number;
    nama: string;
    hari_kerja: number;
    menit: number;
    status: StatusJamDinas;
    details: JamDinasDetail[];
  };
}

export interface OrganizationAssignmentFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: StatusJamDinas;
  id_skpd?: string;
  id_satker?: string;
  id_bidang?: string;
}

export interface CreateOrganizationAssignmentRequest {
  dinset_nama: string;
  id_skpd?: string;
  id_satker?: string;
  id_bidang?: string;
  id_jamdinas: number;
  status?: StatusJamDinas;
}

export interface UpdateOrganizationAssignmentRequest extends Partial<CreateOrganizationAssignmentRequest> {}

export interface OrganizationAssignmentListResponse {
  success: boolean;
  data: OrganizationAssignment[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface OrganizationAssignmentDetailResponse {
  success: boolean;
  data: OrganizationAssignment;
}

// Main Jam Dinas interface
export interface JamDinas {
  id: number;
  nama: string;
  hari_kerja: number;
  menit: number; // total menit kerja
  status: StatusJamDinas;
  createdAt: string;
  updatedAt: string;
  details: JamDinasDetail[];
  assignments?: JamDinasAssignment[];
}

// API Response types
export interface JamDinasListResponse {
  success: boolean;
  data: JamDinas[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

export interface JamDinasDetailResponse {
  success: boolean;
  data: JamDinas;
}

// Request types
export interface JamDinasFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: StatusJamDinas;
}

export interface CreateJamDinasRequest {
  nama: string;
  hari_kerja: number;
  menit: number;
  status: StatusJamDinas;
  details: CreateJamDinasDetailRequest[];
}

export interface CreateJamDinasDetailRequest {
  hari: HariKerja;
  tipe: TipeJadwal;
  jam_masuk_mulai: string;
  jam_masuk_selesai: string;
  jam_pulang_mulai: string;
  jam_pulang_selesai: string;
}

export interface UpdateJamDinasRequest extends Partial<CreateJamDinasRequest> {
  id: number;
}

// API Generic response
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// Form types untuk UI
export interface JamDinasFormData {
  nama: string;
  hari_kerja: number;
  menit: number;
  status: StatusJamDinas;
  details: JamDinasDetailFormData[];
}

export interface JamDinasDetailFormData {
  hari: HariKerja;
  tipe: TipeJadwal;
  jam_masuk_mulai: string;
  jam_masuk_selesai: string;
  jam_pulang_mulai: string;
  jam_pulang_selesai: string;
}

// Constants
export const HARI_KERJA_OPTIONS: Array<{ label: string; value: HariKerja }> = [
  { label: 'Senin', value: 'senin' },
  { label: 'Selasa', value: 'selasa' },
  { label: 'Rabu', value: 'rabu' },
  { label: 'Kamis', value: 'kamis' },
  { label: 'Jumat', value: 'jumat' },
  { label: 'Sabtu', value: 'sabtu' },
  { label: 'Minggu', value: 'minggu' },
];

export const TIPE_JADWAL_OPTIONS: Array<{ label: string; value: TipeJadwal }> = [
  { label: 'Normal', value: 'normal' },
  { label: 'Ramadhan', value: 'ramadhan' },
];

export const STATUS_OPTIONS: Array<{ label: string; value: StatusJamDinas }> = [
  { label: 'Tidak Aktif', value: 0 },
  { label: 'Aktif', value: 1 },
];

export interface TipeJadwalSetting {
  tipe: 'normal' | 'ramadhan';
}

export type TipeJadwalOption = 'normal' | 'ramadhan';

export interface UpdateTipeJadwalRequest {
  tipe: TipeJadwalOption;
}

export interface SystemSettingsResponse {
  success: boolean;
  data: SystemSetting[];
}

export interface TipeJadwalResponse {
  success: boolean;
  data: TipeJadwalSetting;
}

export interface UpdateTipeJadwalResponse {
  success: boolean;
  message: string;
  data: SystemSetting;
}

export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}


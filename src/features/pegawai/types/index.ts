export interface Pegawai {
  id: number;
  username: string;
  email?: string;
  password_reset_token?: string;
  level: string;
  id_opd?: string;
  id_upt?: string;
  status: string;
  device_id?: string;
  fcm_token?: string;
  refresh_token?: string;
  createdAt?: string;
  updatedAt?: string;
  nama?: string;
  nip: string;
  kdskpd?: string;
  kdsatker?: string;
  bidangf?: string;
  nm_unit_kerja?: string;
  kdpangkat?: string;
  jenis_jabatan?: string;
  kdjenkel?: number;
  tempatlhr?: string;
  tgllhr?: string;
  agama?: number;
  alamat?: string;
  notelp?: string;
  noktp?: string;
  foto?: string;
  jenis_pegawai?: string;
  status_aktif?: string;
  AdmOpd?: any;
  AdmUpt?: any;
  skpd?: {
    kdskpd: string;
    nmskpd: string;
    status_skpd: string;
  };
  satker?: {
    kdsatker: string;
    nmsatker: string;
  };
  bidang?: {
    bidangf: string;
    nmbidang: string;
  };
  kd_unit_kerja?: string;
  lokasi?: {
    lokasi_id: number;
    lat: number;
    lng: number;
    range: number;
    id_skpd?: string;
    id_satker?: string;
    id_bidang?: string;
    ket: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
  };
  lokasi_level?: string;
}

export interface PegawaiListResponse {
  data: Pegawai[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
  filter?: {
    id_skpd?: string;
  };
}

export interface PegawaiFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  id_satker?: string;
  bidangf?: string;
}

export interface SKPD {
  id: string;
  kode: string;
  nama: string;
}

// Types untuk kehadiran pegawai
export interface Kehadiran {
  absen_id: number;
  absen_nip: string;
  lokasi_id: number;
  absen_tgl: string;
  absen_tgljam: string;
  absen_checkin: string;
  absen_checkout: string;
  absen_kat: string;
  absen_apel: string;
  absen_sore: string;
  Lokasi: {
    lat: number;
    lng: number;
    ket: string;
  };
}

export interface KehadiranListResponse {
  success: boolean;
  data: Kehadiran[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface KehadiranFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  sort?: 'asc' | 'desc';
}

export interface PegawaiDetailResponse {
  success?: boolean;
  data?: Pegawai;
}
export interface JadwalKegiatan {
  id_kegiatan: number;
  tanggal_kegiatan: string;
  jenis_kegiatan: string;
  keterangan: string;
  jam_mulai?: string;
  jam_selesai?: string;
  include_absen?: string;
  createdAt?: string;
  updatedAt?: string;
  lokasi_list?: LokasiWithSatker[];
  Lokasis?: LokasiKegiatan[];
}

export interface LokasiKegiatan {
  lokasi_id: number;
  lat: number;
  lng: number;
  ket: string;
  status: boolean;
  range: number;
}

export interface LokasiWithSatker extends LokasiKegiatan {
  satker_list: string[]; // Satker yang ditambahkan per-OPD (nip null)
  nip_list?: string[]; // NIP individu yang ditambahkan (opsional)
}

export interface JadwalKegiatanListResponse {
  success: boolean;
  data: JadwalKegiatan[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface JadwalKegiatanDetailResponse {
  success: boolean;
  data: JadwalKegiatan;
}

export interface JadwalKegiatanFilters {
  page?: number;
  limit?: number;
  search?: string;
  tanggal_kegiatan?: string;
  jenis_kegiatan?: string;
}

export interface CreateJadwalKegiatanRequest {
  tanggal_kegiatan: string;
  jenis_kegiatan: string;
  keterangan: string;
  jam_mulai?: string;
  jam_selesai?: string;
  include_absen?: string;
}

export interface UpdateJadwalKegiatanRequest extends Partial<CreateJadwalKegiatanRequest> {
  id_kegiatan: number;
}

export interface JadwalKegiatanFormData {
  tanggal_kegiatan: string;
  jenis_kegiatan: string;
  keterangan: string;
  jam_mulai?: string;
  jam_selesai?: string;
  include_absen?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Jenis Kegiatan constants
export const JENIS_KEGIATAN = {
  DINAS_LUAR: 'dinas_luar',
  RAPAT: 'rapat',
  PELATIHAN: 'pelatihan',
  WORKSHOP: 'workshop',
  SEMINAR: 'seminar',
  UPACARA: 'upacara',
  LAINNYA: 'lainnya'
} as const;

export type JenisKegiatan = typeof JENIS_KEGIATAN[keyof typeof JENIS_KEGIATAN];

export const JENIS_KEGIATAN_OPTIONS = [
  { value: JENIS_KEGIATAN.DINAS_LUAR, label: 'Dinas Luar' },
  { value: JENIS_KEGIATAN.RAPAT, label: 'Rapat' },
  { value: JENIS_KEGIATAN.PELATIHAN, label: 'Pelatihan' },
  { value: JENIS_KEGIATAN.WORKSHOP, label: 'Workshop' },
  { value: JENIS_KEGIATAN.SEMINAR, label: 'Seminar' },
  { value: JENIS_KEGIATAN.UPACARA, label: 'Upacara' },
  { value: JENIS_KEGIATAN.LAINNYA, label: 'Lainnya' }
];

// Attendance inclusion constants
export const INCLUDE_ABSEN = {
  NONE: 'none',
  PAGI: 'pagi',
  SORE: 'sore',
  KEDUANYA: 'keduanya'
} as const;

export type IncludeAbsen = typeof INCLUDE_ABSEN[keyof typeof INCLUDE_ABSEN];

export const INCLUDE_ABSEN_OPTIONS = [
  { value: INCLUDE_ABSEN.NONE, label: 'Hanya kehadiran kegiatan' },
  { value: INCLUDE_ABSEN.PAGI, label: 'Menggantikan absen pagi' },
  { value: INCLUDE_ABSEN.SORE, label: 'Menggantikan absen sore' },
  { value: INCLUDE_ABSEN.KEDUANYA, label: 'Menggantikan absen pagi dan sore' },
];

// Grup Peserta Kegiatan Types
export interface GrupPesertaKegiatan {
  id_grup_peserta: number;
  id_kegiatan: number;
  lokasi_id: number;
  nama_grup: string;
  jenis_grup: 'opd' | 'khusus';
  id_satker?: string;
  keterangan?: string;
  created_at: string;
  updated_at: string;
  total_peserta?: number;
  Lokasi?: LokasiKegiatan;
  MasterJadwalKegiatan?: JadwalKegiatan;
}

export interface PesertaGrupKegiatan {
  id: number;
  id_grup_peserta: number;
  nip: string;
  created_at: string;
  NM_UNIT_KERJA?: string | null;
  KDSATKER?: string | null;
  BIDANGF?: string | null;
  SUBF?: string | null;
  nama_jabatan?: string | null;
  pegawai?: {
    nip: string;
    nama: string;
    nama_lengkap: string;
    kdsatker: string;
  };
}

export interface GrupPesertaListResponse {
  success: boolean;
  data: GrupPesertaKegiatan[];
  total: number;
}

export interface GrupPesertaDetailResponse {
  success: boolean;
  data: GrupPesertaKegiatan;
}

export interface PesertaGrupResponse {
  success: boolean;
  data: {
    grup: {
      id_grup_peserta: number;
      nama_grup: string;
      jenis_grup: string;
    };
    peserta: PesertaGrupKegiatan[];
    total: number;
  };
}

export interface CreateGrupPesertaRequest {
  nama_grup: string;
  jenis_grup: 'opd' | 'khusus';
  id_satker?: string;
  keterangan?: string;
}

export interface UpdateGrupPesertaRequest {
  nama_grup?: string;
  keterangan?: string;
}

export interface AddPesertaToGrupRequest {
  nip_list?: string[];
  bulk_from_satker?: boolean;
}

export interface RemovePesertaFromGrupRequest {
  nip_list: string[];
}

// Jenis Grup constants
export const JENIS_GRUP = {
  OPD: 'opd',
  KHUSUS: 'khusus'
} as const;

export type JenisGrup = typeof JENIS_GRUP[keyof typeof JENIS_GRUP];

export const JENIS_GRUP_OPTIONS = [
  { value: JENIS_GRUP.OPD, label: 'Grup OPD' },
  { value: JENIS_GRUP.KHUSUS, label: 'Grup Khusus' }
];
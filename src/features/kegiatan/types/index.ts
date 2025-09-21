export interface JadwalKegiatan {
  id_kegiatan: number;
  tanggal_kegiatan: string;
  jenis_kegiatan: string;
  keterangan: string;
  createdAt?: string;
  updatedAt?: string;
  lokasi_list?: LokasiWithSkpd[];
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

export interface LokasiWithSkpd extends LokasiKegiatan {
  skpd_list: string[];
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
}

export interface UpdateJadwalKegiatanRequest extends Partial<CreateJadwalKegiatanRequest> {
  id_kegiatan: number;
}

export interface JadwalKegiatanFormData {
  tanggal_kegiatan: string;
  jenis_kegiatan: string;
  keterangan: string;
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
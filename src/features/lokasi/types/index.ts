export interface Lokasi {
  lokasi_id: number;
  lat: number;
  lng: number;
  range: number;
  id_satker?: string | null;
  id_bidang?: string | null;
  ket: string;
  status: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;

  satker_data?: {
    KDSATKER: string;
    NMSATKER: string;
    NAMA_JABATAN?: string | null;
    STATUS_SATKER: string;
    TANGGAL_DIBUAT: string;
    KETERANGAN_SATKER?: string | null;
    KDESELON: string;
    BUP: number;
    JENIS_JABATAN: string;
    NO_URUT: number;
    KODE_SIASN?: string | null;
  } | null;
  bidang_data?: {
    BIDANGF: string;
    NMBIDANG: string;
    NAMA_JABATAN: string;
    KDSATKER: string;
    STATUS_BIDANG: string;
    TANGGAL_DIBUAT: string;
    KETERANGAN?: string | null;
    KDESELON: string;
    BUP?: number | null;
    JENIS_JABATAN: string;
    KODE_SIASN?: string | null;
  } | null;
}

export interface LokasiListResponse {
  data: Lokasi[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
  searchQuery?: string | null;
  filters?: {
    id_satker?: string | null;
    id_bidang?: string | null;
    search?: string | null;
  };
}

export interface LokasiFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string | boolean;
  id_satker?: string;
  id_bidang?: string;
}

export interface CreateLokasiRequest {
  lat: number;
  lng: number;
  range: number;
  id_satker?: string;
  id_bidang?: string;
  ket: string;
  status: boolean;
}

export interface UpdateLokasiRequest extends Partial<CreateLokasiRequest> {
  lokasi_id: number;
}

export interface LokasiFormData {
  ket: string;
  lat: number | null;
  lng: number | null;
  range: number;
  id_satker?: string | { label: string; value: string } | null;
  id_bidang?: string | { label: string; value: string } | null;
  status: boolean;
}

export interface LokasiSearchResponse {
  data: Lokasi[];
  searchQuery: string;
  totalResults: number;
}

export interface LokasiDetailResponse {
  data: Lokasi;
}

// Types untuk Lokasi Kegiatan
export interface LokasiKegiatan {
  lokasi_id: number;
  lat: number;
  lng: number;
  range: number;
  ket: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LokasiKegiatanFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface LokasiKegiatanResponse {
  data: LokasiKegiatan[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
  searchQuery?: string | null;
}

export interface CreateLokasiKegiatanRequest {
  lat: number;
  lng: number;
  range: number;
  ket: string;
  status?: boolean;
}

export interface UpdateLokasiKegiatanRequest {
  lat?: number;
  lng?: number;
  range?: number;
  ket?: string;
  status?: boolean;
}

export interface LokasiKegiatanFormData {
  tanggal_kegiatan: string;
  jenis_kegiatan: string;
  keterangan: string;
  lokasiData: Array<{
    lat: number | null;
    lng: number | null;
    range: number;
    ket: string;
    status: boolean;
    id_satker: string;
    kdskpd?: string;
  }>;
}
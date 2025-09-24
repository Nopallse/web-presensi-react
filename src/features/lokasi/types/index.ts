export interface Lokasi {
  lokasi_id: number;
  lat: number;
  lng: number;
  range: number;
  id_skpd?: string | null;
  id_satker?: string | null;
  id_bidang?: string | null;
  ket: string;
  status: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  skpd_data?: {
    KDSKPD: string;
    NMSKPD: string;
    StatusSKPD: string;
  } | null;
  satker_data?: {
    KDSATKER: string;
    KDSKPD: string;
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
    id_skpd?: string | null;
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
  id_skpd?: string;
  id_satker?: string;
  id_bidang?: string;
}

export interface CreateLokasiRequest {
  lat: number;
  lng: number;
  range: number;
  id_skpd?: string;
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
  id_skpd: string | { label: string; value: string } | null;
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
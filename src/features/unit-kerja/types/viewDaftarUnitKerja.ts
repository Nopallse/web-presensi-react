export interface ViewDaftarUnitKerja {
  id_unit_kerja: string;
  kd_unit_kerja: string;
  nm_unit_kerja: string;
  jenis: 'satker_tbl' | 'bidang_tbl' | 'bidang_sub';
  status: string;
  kd_unit_atasan?: string;
  relasi_data?: RelasiData;
}

export interface RelasiData {
  kd_satker?: string;
  nm_satker?: string;
  nama_jabatan?: string;
  jenis_jabatan?: string;
  kdskpd?: string;
  bidangf?: string;
  nm_bidang?: string;
  subf?: string;
  nm_sub?: string;
  sub_bidang_count?: number;
}

export interface ViewDaftarUnitKerjaFilters {
  page?: number;
  limit?: number;
  search?: string;
  jenis?: 'satker_tbl' | 'bidang_tbl' | 'bidang_sub';
}

export interface ViewDaftarUnitKerjaListResponse {
  data: ViewDaftarUnitKerja[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
  filter?: {
    jenis?: string;
  };
  searchQuery?: string | null;
}

export interface ViewDaftarUnitKerjaStats {
  total: number;
  by_jenis: Array<{
    jenis: string;
    count: number;
  }>;
}
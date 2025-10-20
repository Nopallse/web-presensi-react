// Legacy types untuk kompatibilitas
export interface SKPD {
  KDSKPD: string;
  NMSKPD: string;
  StatusSKPD: string;
  employee_count: number;
  satker_count: number;
  bidang_count: number;
  lokasi_count: number;
  lokasi_list: Array<{
    lokasi_id: number;
    lat: number;
    lng: number;
    ket: string;
    id_satker: string | null;
    id_bidang: string | null;
  }>;
  admin_count: number;
  admins: Array<{
    id: number;
    username: string;
    email: string;
    level: string;
    status: string;
    kategori: number;
  }>;
}

// Unit Kerja interface untuk detail page
export interface UnitKerja {
  id_unit_kerja: string;
  kd_unit_kerja: string;
  nm_unit_kerja: string;
  jenis: 'satker_tbl' | 'bidang_tbl' | 'bidang_sub';
  status: string;
  kd_unit_atasan?: string;
  relasi_data?: {
    // Level 1 - Satker
    kd_satker?: string;
    nm_satker?: string;
    nama_jabatan?: string;
    jenis_jabatan?: string;
    
    // Level 2 - Bidang
    bidangf?: string;
    nm_bidang?: string;
    sub_bidang_count?: number;
    
    // Level 3 - Sub Bidang
    subf?: string;
    nm_sub?: string;
  };
}

export interface SatkerData {
  KDSATKER: string;
  KDSKPD: string;
  NMSATKER: string;
  NAMA_JABATAN: string;
  StatusSatker: number;
  TANGGAL_DIBUAT: string;
  KETERANGAN_SATKER?: string;
  KDESELON: string;
  BUP: number;
  JENIS_JABATAN: string;
  employee_count: number;
  admin_count: number;
  bidang_count: number;
  admins: any[];
  SkpdTbl?: {
    KDSKPD: string;
    NMSKPD: string;
    StatusSKPD: string;
  };
}

export interface BidangData {
  BIDANGF: string;
  NMBIDANG: string;
  NAMA_JABATAN: string;
  JENIS_JABATAN: string;
  KDSATKER: string;
  KDESELON: string;
  StatusBidang: number;
  TANGGAL_DIBUAT: string;
  KETERANGAN?: string;
  employee_count: number;
  admin_count: number;
  admins: any[];
  SatkerTbl?: {
    KDSATKER: string;
    NMSATKER: string;
    KDSKPD: string;
    SkpdTbl?: {
      KDSKPD: string;
      NMSKPD: string;
      StatusSKPD: string;
    };
  };
}

export interface OrganizationHierarchy {
  skpd: SKPD;
  satker?: SatkerData;
  bidang?: BidangData;
}

export interface UnitKerjaFilters {
  page?: number;
  limit?: number;
  search?: string;
  kdSkpd?: string;
  kdSatker?: string;
  status?: string | number;
}

export interface UnitKerjaListResponse<T> {
  data: T[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
  hierarchy?: OrganizationHierarchy;
  filter?: any;
  searchQuery?: string | null;
  statusFilter?: string;
}

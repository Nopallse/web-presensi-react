export interface SKPD {
  KDSKPD: string;
  NMSKPD: string;
  StatusSKPD: string;
  employee_count: number;
  admin_count: number;
}

export interface SatkerData {
  KDSATKER: string;
  KDSKPD: string;
  NMSATKER: string;
  NAMA_JABATAN: string;
  STATUS_SATKER: string;
  TANGGAL_DIBUAT: string;
  KETERANGAN_SATKER?: string;
  KDESELON: string;
  BUP: number;
  JENIS_JABATAN: string;
  employee_count: number;
  bidang_count: number;
}

export interface BidangData {
  BIDANGF: string;
  NMBIDANG: string;
  NAMA_JABATAN: string;
  JENIS_JABATAN: string;
  KDSATKER: string;
  KDESELON: string;
  STATUS_BIDANG: string;
  TANGGAL_DIBUAT: string;
  KETERANGAN?: string;
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
  searchQuery?: string | null;
}
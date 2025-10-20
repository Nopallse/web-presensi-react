import { apiClient } from '../../../services/apiService';



export interface SatkerData {
  KDSATKER: string;
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

export const organizationApi = {
  searchSatker: async (query: string = '', page: number = 1, limit: number = 10) => {
    const response = await apiClient.get(`/superadmin/skpd`, {
      params: { query, page, limit }
    });
    return {
      data: response.data.data as SatkerData[],
      searchQuery: response.data.searchQuery
    };
  },




  // Get all satker (untuk kegiatan)
  getAllSatker: async (query: string = '', page: number = 1, limit: number = 100) => {
    const response = await apiClient.get(`/unit-kerja`, {
      params: { search: query, page, limit }
    });
    return {
      data: response.data.data as SatkerData[],
      searchQuery: response.data.searchQuery
    };
  }
};
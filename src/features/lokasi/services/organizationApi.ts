import { apiClient } from '../../../services/apiService';

export interface SkpdData {
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

export const organizationApi = {
  searchSkpd: async (query: string = '', page: number = 1, limit: number = 10) => {
    const response = await apiClient.get(`/superadmin/skpd`, {
      params: { query, page, limit }
    });
    return {
      data: response.data.data as SkpdData[],
      searchQuery: response.data.searchQuery
    };
  },

  searchSatker: async (kdSkpd: string, query: string = '', page: number = 1, limit: number = 10) => {
    const response = await apiClient.get(`/superadmin/skpd/${kdSkpd}/satker`, {
      params: { query, page, limit }
    });
    return {
      data: response.data.data as SatkerData[],
      hierarchy: response.data.hierarchy,
      searchQuery: response.data.searchQuery
    };
  },

  searchBidang: async (kdSkpd: string, kdSatker: string, query: string = '', page: number = 1, limit: number = 10) => {
    const response = await apiClient.get(`/superadmin/skpd/${kdSkpd}/satker/${kdSatker}/bidang`, {
      params: { query, page, limit }
    });
    return {
      data: response.data.data as BidangData[],
      hierarchy: response.data.hierarchy,
      searchQuery: response.data.searchQuery
    };
  }
};
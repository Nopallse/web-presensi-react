import { apiClient } from '../../../services/apiService';

export interface Lokasi {
  lokasi_id: number;
  id_unit_kerja: string;
  kd_unit_kerja: string;
  level_unit_kerja: number;
  parent_lokasi_id?: number;
  lat: number;
  lng: number;
  range: number;
  nama_lokasi?: string;
  alamat?: string;
  ket?: string;
  is_inherited: boolean;
  status: boolean;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  unitKerja?: {
    nm_unit_kerja: string;
    jenis: string;
  };
}

export interface LokasiFilters {
  page?: number;
  limit?: number;
  search?: string;
  level?: number;
  kd_unit_kerja?: string;
}

export interface LokasiResponse {
  data: Lokasi[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

export const lokasiApi = {
  // Mendapatkan semua lokasi dengan pagination
  getAll: async (filters: LokasiFilters = {}): Promise<LokasiResponse> => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.level) params.append('level', filters.level.toString());
    if (filters.kd_unit_kerja) params.append('kd_unit_kerja', filters.kd_unit_kerja);

    const response = await apiClient.get(`/lokasi?${params.toString()}`);
    return response.data;
  },

  // Mendapatkan lokasi berdasarkan ID
  getById: async (id: number): Promise<Lokasi> => {
    const response = await apiClient.get(`/lokasi/${id}`);
    return response.data;
  },

  // Mendapatkan lokasi efektif untuk unit kerja
  getEffectiveLocation: async (kd_unit_kerja: string): Promise<Lokasi> => {
    const response = await apiClient.get(`/lokasi/effective/${kd_unit_kerja}`);
    return response.data;
  },

  // Mendapatkan hierarki lokasi untuk unit kerja
  getLocationHierarchy: async (kd_unit_kerja: string): Promise<{ data: Lokasi[], total: number }> => {
    const response = await apiClient.get(`/lokasi/hierarchy/${kd_unit_kerja}`);
    return response.data;
  },

  // Mendapatkan lokasi berdasarkan level
  getByLevel: async (level: number, kd_unit_kerja?: string): Promise<{ data: Lokasi[], total: number, level: number }> => {
    const params = new URLSearchParams();
    if (kd_unit_kerja) params.append('kd_unit_kerja', kd_unit_kerja);
    
    const response = await apiClient.get(`/lokasi/level/${level}?${params.toString()}`);
    return response.data;
  },

  // Membuat lokasi baru
  create: async (lokasiData: Partial<Lokasi>): Promise<{ message: string, data: Lokasi }> => {
    const response = await apiClient.post('/lokasi', lokasiData);
    return response.data;
  },

  // Mengupdate lokasi
  update: async (id: number, lokasiData: Partial<Lokasi>): Promise<{ message: string, data: Lokasi }> => {
    const response = await apiClient.put(`/lokasi/${id}`, lokasiData);
    return response.data;
  },

  // Menghapus lokasi
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/lokasi/${id}`);
    return response.data;
  }
};
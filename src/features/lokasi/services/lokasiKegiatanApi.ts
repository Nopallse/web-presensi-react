import { apiClient } from '../../../services/apiService';

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

export const lokasiKegiatanApi = {
  // Mendapatkan semua lokasi kegiatan dengan pagination
  getAll: async (filters: LokasiKegiatanFilters = {}): Promise<LokasiKegiatanResponse> => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);

    const response = await apiClient.get(`/lokasi-kegiatan?${params.toString()}`);
    return response.data;
  },

  // Mendapatkan lokasi kegiatan berdasarkan ID
  getById: async (id: number): Promise<{ data: LokasiKegiatan }> => {
    const response = await apiClient.get(`/lokasi-kegiatan/${id}`);
    return response.data;
  },

  // Membuat lokasi kegiatan baru
  create: async (lokasiData: CreateLokasiKegiatanRequest): Promise<{ message: string, data: LokasiKegiatan }> => {
    const response = await apiClient.post('/lokasi-kegiatan', lokasiData);
    return response.data;
  },

  // Mengupdate lokasi kegiatan
  update: async (id: number, lokasiData: UpdateLokasiKegiatanRequest): Promise<{ message: string, data: LokasiKegiatan }> => {
    const response = await apiClient.put(`/lokasi-kegiatan/${id}`, lokasiData);
    return response.data;
  },

  // Menghapus lokasi kegiatan
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/lokasi-kegiatan/${id}`);
    return response.data;
  },

  // Mengupdate status lokasi kegiatan
  updateStatus: async (id: number, status: boolean): Promise<{ message: string, data: { id: number, status: boolean } }> => {
    const response = await apiClient.put(`/lokasi-kegiatan/${id}/status`, { status });
    return response.data;
  }
};

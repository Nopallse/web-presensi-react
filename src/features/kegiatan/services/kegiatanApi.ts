import { apiClient } from '../../../services/apiService';
import type {
  JadwalKegiatan,
  JadwalKegiatanListResponse,
  JadwalKegiatanDetailResponse,
  JadwalKegiatanFilters,
  CreateJadwalKegiatanRequest,
  ApiResponse
} from '../types';

export const kegiatanApi = {
  // Get all jadwal kegiatan with pagination and filters
  getAll: async (filters: JadwalKegiatanFilters = {}): Promise<JadwalKegiatanListResponse> => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.tanggal_kegiatan) params.append('tanggal_kegiatan', filters.tanggal_kegiatan);
    if (filters.jenis_kegiatan) params.append('jenis_kegiatan', filters.jenis_kegiatan);

    const response = await apiClient.get(`/superadmin/kegiatan?${params.toString()}`);
    return response.data;
  },

  // Get jadwal kegiatan by ID
  getById: async (id: number): Promise<JadwalKegiatanDetailResponse> => {
    const response = await apiClient.get(`/superadmin/kegiatan/${id}`);
    return response.data;
  },

  // Create new jadwal kegiatan
  create: async (data: CreateJadwalKegiatanRequest): Promise<ApiResponse<JadwalKegiatan>> => {
    const response = await apiClient.post('/superadmin/kegiatan', data);
    return response.data;
  },

  // Update existing jadwal kegiatan
  update: async (id: number, data: Partial<CreateJadwalKegiatanRequest>): Promise<ApiResponse<JadwalKegiatan>> => {
    const response = await apiClient.put(`/superadmin/kegiatan/${id}`, data);
    return response.data;
  },

  // Delete jadwal kegiatan
  delete: async (id: number): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/superadmin/kegiatan/${id}`);
    return response.data;
  },

  // Search jadwal kegiatan
  search: async (query: string, page: number = 1, limit: number = 10): Promise<JadwalKegiatanListResponse> => {
    const response = await apiClient.get(`/superadmin/kegiatan`, {
      params: { search: query, page, limit }
    });
    return response.data;
  },

  // Location management for kegiatan
  getKegiatanLokasi: async (id: number): Promise<ApiResponse> => {
    const response = await apiClient.get(`/superadmin/jadwal-kegiatan-lokasi-satker/${id}/lokasi`);
    return response.data;
  },

  addLokasiToKegiatan: async (id: number, data: { lokasi_id: number; kdsatker_list: string[] }): Promise<ApiResponse> => {
    const response = await apiClient.post(`/superadmin/jadwal-kegiatan/${id}/lokasi`, data);
    return response.data;
  },

  removeLokasiFromKegiatan: async (id: number, lokasi_id: number): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/superadmin/jadwal-kegiatan/${id}/lokasi/${lokasi_id}`);
    return response.data;
  },

  // Edit/Update lokasi on kegiatan
  editLokasiKegiatan: async (kegiatanId: number, oldLokasiId: number, newLokasiId: number): Promise<ApiResponse> => {
    const response = await apiClient.put(`/superadmin/jadwal-kegiatan/${kegiatanId}/lokasi/${oldLokasiId}/edit`, {
      new_lokasi_id: newLokasiId
    });
    return response.data;
  },

  // Edit/Update Satker list for kegiatan-lokasi
  editSatkerKegiatanLokasi: async (kegiatanId: number, lokasiId: number, kdsatkerList: string[]): Promise<ApiResponse> => {
    const response = await apiClient.put(`/superadmin/jadwal-kegiatan/${kegiatanId}/lokasi/${lokasiId}/satker`, {
      kdsatker_list: kdsatkerList
    });
    return response.data;
  },

  // Get all satker for a kegiatan
  getAllSatkerKegiatan: async (kegiatanId: number): Promise<ApiResponse> => {
    const response = await apiClient.get(`/superadmin/jadwal-kegiatan/${kegiatanId}/satker`);
    return response.data;
  },

  // Get detail satker for a kegiatan
  getDetailSatkerKegiatan: async (kegiatanId: number, satkerId: string): Promise<ApiResponse> => {
    const response = await apiClient.get(`/superadmin/jadwal-kegiatan/${kegiatanId}/satker/${satkerId}`);
    return response.data;
  },

  // Download Excel for all satker in kegiatan (bulk download)
  downloadBulkExcel: async (kegiatanId: number): Promise<Blob> => {
    const response = await apiClient.get(`/superadmin/jadwal-kegiatan/${kegiatanId}/download-excel`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Download Excel for specific satker in kegiatan
  downloadSatkerExcel: async (kegiatanId: number, satkerId: string): Promise<Blob> => {
    const response = await apiClient.get(`/superadmin/jadwal-kegiatan/${kegiatanId}/satker/${satkerId}/download-excel`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
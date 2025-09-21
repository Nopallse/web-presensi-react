import { apiClient } from '../../../services/apiService';
import type { 
  LokasiListResponse, 
  LokasiDetailResponse,
  LokasiFilters, 
  Lokasi, 
  CreateLokasiRequest, 
  LokasiSearchResponse 
} from '../types';

export const lokasiApi = {
  // Get all lokasi (super admin only)
  getAll: async (filters: LokasiFilters = {}): Promise<LokasiListResponse> => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status !== undefined) params.append('status', filters.status.toString());

    const endpoint = '/superadmin/lokasi';
    const queryString = params.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    const response = await apiClient.get<LokasiListResponse>(url);
    return response.data;
  },

  // Get lokasi by ID (super admin only)
  getById: async (id: number): Promise<LokasiDetailResponse> => {
    const response = await apiClient.get<LokasiDetailResponse>(`/superadmin/lokasi/${id}`);
    return response.data;
  },

  // Create new lokasi
  create: async (data: CreateLokasiRequest): Promise<Lokasi> => {
    const response = await apiClient.post<Lokasi>('/superadmin/lokasi', data);
    return response.data;
  },

  // Update lokasi
  update: async (lokasi_id: number, data: Partial<CreateLokasiRequest>): Promise<Lokasi> => {
    const response = await apiClient.patch<Lokasi>(`/superadmin/lokasi/${lokasi_id}`, data);
    return response.data;
  },

  // Delete lokasi
  delete: async (lokasi_id: number): Promise<void> => {
    await apiClient.delete(`/superadmin/lokasi/${lokasi_id}`);
  },

  // Search lokasi
  search: async (query: string): Promise<LokasiSearchResponse> => {
    const params = new URLSearchParams();
    params.append('q', query);
    
    const response = await apiClient.get<LokasiSearchResponse>(`/superadmin/lokasi/search?${params.toString()}`);
    return response.data;
  }
};
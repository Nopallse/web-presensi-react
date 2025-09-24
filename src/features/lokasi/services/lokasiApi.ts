import { apiClient } from '../../../services/apiService';
import { useAuthStore } from '../../../store/authStore';
import type { 
  LokasiListResponse, 
  LokasiDetailResponse,
  LokasiFilters, 
  Lokasi, 
  CreateLokasiRequest, 
  LokasiSearchResponse 
} from '../types';

/**
 * Get base path based on user role
 */
const getBasePath = (): string => {
  const user = useAuthStore.getState().user;
  const role = user?.role;
  
  switch (role) {
    case 'super_admin':
      return '/superadmin/lokasi';
    case 'admin':
    case 'admin-opd':
    case 'admin-upt':
      return '/admin/lokasi';
    default:
      // Default to admin for safety
      return '/admin/lokasi';
  }
};

export const lokasiApi = {
  // Get all lokasi
  getAll: async (filters: LokasiFilters = {}): Promise<LokasiListResponse> => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status !== undefined) params.append('status', filters.status.toString());
    if (filters.id_skpd) params.append('id_skpd', filters.id_skpd);
    if (filters.id_satker) params.append('id_satker', filters.id_satker);
    if (filters.id_bidang) params.append('id_bidang', filters.id_bidang);

    const endpoint = getBasePath();
    const queryString = params.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    const response = await apiClient.get<LokasiListResponse>(url);
    return response.data;
  },

  // Get lokasi by ID
  getById: async (id: number): Promise<LokasiDetailResponse> => {
    const response = await apiClient.get<LokasiDetailResponse>(`${getBasePath()}/${id}`);
    return response.data;
  },

  // Create new lokasi
  create: async (data: CreateLokasiRequest): Promise<Lokasi> => {
    const response = await apiClient.post<Lokasi>(getBasePath(), data);
    return response.data;
  },

  // Update lokasi (PATCH - only send changed fields)
  update: async (lokasi_id: number, data: Partial<CreateLokasiRequest>): Promise<Lokasi> => {
    const response = await apiClient.patch<Lokasi>(`${getBasePath()}/${lokasi_id}`, data);
    return response.data;
  },

  // Delete lokasi
  delete: async (lokasi_id: number): Promise<void> => {
    await apiClient.delete(`${getBasePath()}/${lokasi_id}`);
  },

  // Search lokasi
  search: async (query: string): Promise<LokasiSearchResponse> => {
    const params = new URLSearchParams();
    params.append('q', query);
    
    const response = await apiClient.get<LokasiSearchResponse>(`${getBasePath()}/search?${params.toString()}`);
    return response.data;
  }
};
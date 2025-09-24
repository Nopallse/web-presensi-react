import { apiClient } from '../../../services/apiService';
import { useAuthStore } from '../../../store/authStore';
import type { PegawaiListResponse, PegawaiFilters, Pegawai } from '../types';

export const pegawaiApi = {
  // Get all pegawai (role-based endpoint)
  getAll: async (filters: PegawaiFilters = {}): Promise<PegawaiListResponse> => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.kdskpd) params.append('id_skpd', filters.kdskpd);
    if (filters.search) params.append('search', filters.search);
    if (filters.status !== undefined) params.append('status', filters.status);

    // Get user role to determine endpoint
    const { user } = useAuthStore.getState();
    const isSuperAdmin = user?.role === 'super_admin';
    
    // Use superadmin endpoint for super admin, admin endpoint for regular admin
    const endpoint = isSuperAdmin ? '/superadmin/users' : '/admin/users';
    const queryString = params.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    console.log('Pegawai API URL:', url); // Log untuk debugging
    
    const response = await apiClient.get<PegawaiListResponse>(url);
    return response.data;
  },

  // Get pegawai by ID
  getById: async (id: string): Promise<Pegawai> => {
    const { user } = useAuthStore.getState();
    const isSuperAdmin = user?.role === 'super_admin';
    const endpoint = isSuperAdmin ? `/superadmin/users/${id}` : `/admin/users/${id}`;
    
    const response = await apiClient.get<Pegawai>(endpoint);
    return response.data;
  },

  // Get SKPD list for dropdown
  getSKPDList: async (page: number = 1, limit: number = 100): Promise<{ data: any[], pagination: any }> => {
    const { user } = useAuthStore.getState();
    const isSuperAdmin = user?.role === 'super_admin';
    
    if (!isSuperAdmin) {
      // For admin, return empty array since they shouldn't see SKPD filter
      return { data: [], pagination: { totalItems: 0, totalPages: 0, currentPage: 1, itemsPerPage: 0 } };
    }
    
    const response = await apiClient.get<{ data: any[], pagination: any }>(`/skpd?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Fetch SKPD for DebounceSelect
  fetchSKPDList: async (search: string): Promise<Array<{ label: string; value: string; }>> => {
    const { user } = useAuthStore.getState();
    const isSuperAdmin = user?.role === 'super_admin';
    
    if (!isSuperAdmin) {
      return [];
    }
    
    try {
      let response;
      if (search.trim()) {
        // Search with query if search term provided
        const searchResult = await apiClient.get<{ data: any[], searchQuery: string }>(`/skpd?query=${search}`);
        response = { data: searchResult.data.data };
      } else {
        // Get all SKPD if no search term
        const allResult = await apiClient.get<{ data: any[], pagination: any }>(`/skpd?page=1&limit=100`);
        response = { data: allResult.data.data };
      }
      
      return response.data.map((skpd: any) => ({
        label: `${skpd.KDSKPD} - ${skpd.NMSKPD}`,
        value: skpd.KDSKPD,
      }));
    } catch (error) {
      console.error('Error fetching SKPD:', error);
      return [];
    }
  }
};
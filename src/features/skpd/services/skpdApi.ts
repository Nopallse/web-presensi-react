import { apiClient } from '../../../services/apiService';
import type { SKPDListResponse, SKPDFilters, SKPD } from '../types';

export const skpdApi = {
  // Get all SKPD (super admin only)
  getAll: async (filters: SKPDFilters = {}): Promise<SKPDListResponse> => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    
    const endpoint = '/superadmin/skpd';
    const queryString = params.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    const response = await apiClient.get<SKPDListResponse>(url);
    return response.data;
  },

  // Get SKPD by ID/Code
  getByCode: async (kdskpd: string): Promise<SKPD> => {
    const response = await apiClient.get<SKPD>(`/superadmin/skpd/${kdskpd}`);
    return response.data;
  }
};
import { apiClient } from '../../../services/apiService';
import type { 
  SKPD, 
  SatkerData, 
  BidangData, 
  UnitKerjaFilters,
  UnitKerjaListResponse 
} from '../types';

export const unitKerjaApi = {
  // SKPD Management
  getAllSkpd: async (filters: UnitKerjaFilters = {}): Promise<UnitKerjaListResponse<SKPD>> => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('query', filters.search);
    
    const endpoint = '/superadmin/skpd';
    const queryString = params.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    const response = await apiClient.get(url);
    return {
      data: response.data.data,
      pagination: response.data.pagination,
      searchQuery: response.data.searchQuery
    };
  },

  getSkpdByCode: async (kdSkpd: string): Promise<SKPD> => {
    const response = await apiClient.get(`/superadmin/skpd/${kdSkpd}`);
    return response.data.data;
  },

  // Satuan Kerja Management
  getAllSatker: async (kdSkpd: string, filters: UnitKerjaFilters = {}): Promise<UnitKerjaListResponse<SatkerData>> => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('query', filters.search);
    
    const endpoint = `/superadmin/skpd/${kdSkpd}/satker`;
    const queryString = params.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    const response = await apiClient.get(url);
    return {
      data: response.data.data,
      pagination: response.data.pagination || {
        totalItems: response.data.data?.length || 0,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: response.data.data?.length || 0
      },
      hierarchy: response.data.hierarchy,
      searchQuery: response.data.searchQuery
    };
  },

  getSatkerByCode: async (kdSkpd: string, kdSatker: string): Promise<SatkerData> => {
    const response = await apiClient.get(`/superadmin/skpd/${kdSkpd}/satker/${kdSatker}`);
    return response.data.data;
  },

  // Bidang Management
  getAllBidang: async (kdSkpd: string, kdSatker: string, filters: UnitKerjaFilters = {}): Promise<UnitKerjaListResponse<BidangData>> => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('query', filters.search);
    
    const endpoint = `/superadmin/skpd/${kdSkpd}/satker/${kdSatker}/bidang`;
    const queryString = params.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    const response = await apiClient.get(url);
    return {
      data: response.data.data,
      pagination: response.data.pagination || {
        totalItems: response.data.data?.length || 0,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: response.data.data?.length || 0
      },
      hierarchy: response.data.hierarchy,
      searchQuery: response.data.searchQuery
    };
  },

  getBidangByCode: async (kdSkpd: string, kdSatker: string, bidangF: string): Promise<BidangData> => {
    const response = await apiClient.get(`/superadmin/skpd/${kdSkpd}/satker/${kdSatker}/bidang/${bidangF}`);
    return response.data.data;
  }
};
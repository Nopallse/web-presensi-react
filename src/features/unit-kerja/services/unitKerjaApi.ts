import { apiClient } from '../../../services/apiService';
import type { 
  ViewDaftarUnitKerja,
  ViewDaftarUnitKerjaFilters,
  ViewDaftarUnitKerjaListResponse,
  ViewDaftarUnitKerjaStats
} from '../types/viewDaftarUnitKerja';
import type { 
  SKPD, 
  SatkerData, 
  BidangData, 
  UnitKerjaFilters,
  UnitKerjaListResponse 
} from '../types';

export const unitKerjaApi = {
  // ViewDaftarUnitKerja Management - API Baru
  getAllViewDaftarUnitKerja: async (filters: ViewDaftarUnitKerjaFilters = {}): Promise<ViewDaftarUnitKerjaListResponse> => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.jenis) params.append('jenis', filters.jenis);
    
    const endpoint = '/view-daftar-unit-kerja';
    const queryString = params.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    const response = await apiClient.get(url);
    return {
      data: response.data.data,
      pagination: response.data.pagination,
      filter: response.data.filter,
      searchQuery: response.data.searchQuery
    };
  },

  getViewDaftarUnitKerjaById: async (kdUnitKerja: string): Promise<ViewDaftarUnitKerja> => {
    const response = await apiClient.get(`/view-daftar-unit-kerja/${kdUnitKerja}`);
    return response.data;
  },

  // Alias untuk getById (untuk kompatibilitas)
  getById: async (kdUnitKerja: string): Promise<ViewDaftarUnitKerja> => {
    const response = await apiClient.get(`/view-daftar-unit-kerja/${kdUnitKerja}`);
    return response.data;
  },

  getViewDaftarUnitKerjaStats: async (): Promise<ViewDaftarUnitKerjaStats> => {
    const response = await apiClient.get('/view-daftar-unit-kerja/stats');
    return response.data;
  },

  // Mendapatkan semua data view_daftar_unit_kerja tanpa pagination
  getAllViewDaftarUnitKerjaAll: async (filters?: ViewDaftarUnitKerjaFilters): Promise<{data: ViewDaftarUnitKerja[], total: number}> => {
    const params = new URLSearchParams();
    
    if (filters?.search) {
      params.append('search', filters.search);
    }
    
    const response = await apiClient.get(`/view-daftar-unit-kerja/all?${params.toString()}`);
    return response.data;
  },

  // Mendapatkan data Level 1 (Satuan Kerja)
  getLevel1Data: async (filters?: ViewDaftarUnitKerjaFilters): Promise<ViewDaftarUnitKerjaListResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    
    const endpoint = '/view-daftar-unit-kerja/level1';
    const queryString = params.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    const response = await apiClient.get(url);
    return {
      data: response.data.data,
      pagination: response.data.pagination,
      filter: response.data.filter,
      searchQuery: response.data.searchQuery
    };
  },

  // Mendapatkan data Level 2 (Bidang) - menggunakan endpoint level2
  getLevel2Data: async (filters?: ViewDaftarUnitKerjaFilters & {satker?: string}): Promise<ViewDaftarUnitKerjaListResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.satker) params.append('satker', filters.satker);
    
    const endpoint = '/view-daftar-unit-kerja/level2';
    const queryString = params.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    const response = await apiClient.get(url);
    return {
      data: response.data.data,
      pagination: response.data.pagination,
      filter: response.data.filter,
      searchQuery: response.data.searchQuery
    };
  },

  // Mendapatkan data Level 3 (Sub Bidang) - menggunakan endpoint level3
  getLevel3Data: async (filters?: ViewDaftarUnitKerjaFilters & {satker?: string, bidang?: string}): Promise<ViewDaftarUnitKerjaListResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.satker) params.append('satker', filters.satker);
    if (filters?.bidang) params.append('bidang', filters.bidang);
    
    const endpoint = '/view-daftar-unit-kerja/level3';
    const queryString = params.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    const response = await apiClient.get(url);
    return {
      data: response.data.data,
      pagination: response.data.pagination,
      filter: response.data.filter,
      searchQuery: response.data.searchQuery
    };
  },

  // Filter Options untuk dropdown
  getFilterOptionsHierarchy: async (kdKerjaLevel1?: string, kdKerjaLevel2?: string, search?: string, limit?: number): Promise<{data: {kd_unit_kerja: string, nm_unit_kerja: string}[], total: number, level: number, parent_kd?: string, grandparent_kd?: string, searchQuery: string | null}> => {
    let endpoint = '/view-daftar-unit-kerja/filter-options-hierarchy';
    
    if (kdKerjaLevel1) {
      endpoint += `/${kdKerjaLevel1}`;
    }
    if (kdKerjaLevel2) {
      endpoint += `/${kdKerjaLevel2}`;
    }
    
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (limit) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    const response = await apiClient.get(url);
    return {
      data: response.data.data,
      total: response.data.total,
      level: response.data.level,
      parent_kd: response.data.parent_kd,
      grandparent_kd: response.data.grandparent_kd,
      searchQuery: response.data.searchQuery
    };
  },

  // Legacy API - SKPD Management
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
  getAllSatker: async (kdSkpdOrFilters?: string | UnitKerjaFilters, filters?: UnitKerjaFilters): Promise<UnitKerjaListResponse<SatkerData>> => {
    const params = new URLSearchParams();
    
    // Check if first parameter is a string (kdSkpd) or filters object
    const isKdSkpdProvided = typeof kdSkpdOrFilters === 'string';
    const actualFilters = isKdSkpdProvided ? filters || {} : (kdSkpdOrFilters as UnitKerjaFilters) || {};
    
    if (actualFilters.page) params.append('page', actualFilters.page.toString());
    if (actualFilters.limit) params.append('limit', actualFilters.limit.toString());
    if (actualFilters.search) params.append('search', actualFilters.search);
    if (actualFilters.status && actualFilters.status !== 'all') {
      params.append('status', actualFilters.status.toString());
    }
    if (actualFilters.kdSkpd) params.append('kdskpd', actualFilters.kdSkpd);
    
    const endpoint = isKdSkpdProvided 
      ? `/superadmin/skpd/${kdSkpdOrFilters}/satker`
      : '/superadmin/satker';
    const queryString = params.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    console.log('API Request URL:', url);
    console.log('Status filter value:', actualFilters.status);
    console.log('KD SKPD filter value:', actualFilters.kdSkpd);
    console.log('All filters:', actualFilters);
    console.log('Query string:', queryString);
    
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
      filter: response.data.filter,
      searchQuery: response.data.searchQuery
    };
  },

  getSatkerByCode: async (kdSkpd: string, kdSatker: string): Promise<SatkerData> => {
    const response = await apiClient.get(`/superadmin/skpd/${kdSkpd}/satker/${kdSatker}`);
    return response.data.data;
  },

  // Bidang Management
  getAllBidang: async (kdSkpdOrFilters?: string | UnitKerjaFilters, kdSatkerOrFilters?: string | UnitKerjaFilters, filters?: UnitKerjaFilters): Promise<UnitKerjaListResponse<BidangData>> => {
    const params = new URLSearchParams();
    
    // Check if first parameter is a string (kdSkpd) or filters object
    const isKdSkpdProvided = typeof kdSkpdOrFilters === 'string';
    const isKdSatkerProvided = typeof kdSatkerOrFilters === 'string';
    
    let actualFilters: UnitKerjaFilters;
    if (isKdSkpdProvided && isKdSatkerProvided) {
      actualFilters = filters || {};
    } else if (isKdSkpdProvided) {
      actualFilters = (kdSatkerOrFilters as UnitKerjaFilters) || {};
    } else {
      actualFilters = (kdSkpdOrFilters as UnitKerjaFilters) || {};
    }
    
    if (actualFilters.page) params.append('page', actualFilters.page.toString());
    if (actualFilters.limit) params.append('limit', actualFilters.limit.toString());
    if (actualFilters.search) {
      params.append('search', actualFilters.search);
    }
    if (actualFilters.status && actualFilters.status !== 'all') {
      params.append('status', actualFilters.status.toString());
    }
    if (actualFilters.kdSatker) params.append('kdsatker', actualFilters.kdSatker);
    if (actualFilters.kdSkpd) params.append('kdskpd', actualFilters.kdSkpd);
    
    let endpoint: string;
    if (isKdSkpdProvided && isKdSatkerProvided) {
      endpoint = `/superadmin/skpd/${kdSkpdOrFilters}/satker/${kdSatkerOrFilters}/bidang`;
    } else {
      endpoint = '/superadmin/bidang';
    }
    
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
      filter: response.data.filter,
      searchQuery: response.data.searchQuery
    };
  },

  getBidangByCode: async (kdSkpd: string, kdSatker: string, bidangF: string): Promise<BidangData> => {
    const response = await apiClient.get(`/superadmin/skpd/${kdSkpd}/satker/${kdSatker}/bidang/${bidangF}`);
    return response.data.data;
  },




  // Get all SKPD (with enhanced details)
  getAllSKPD: async (filters: UnitKerjaFilters = {}): Promise<UnitKerjaListResponse<SKPD>> => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('query', filters.search);
    if (filters.status) params.append('status', filters.status.toString());
    
    const endpoint = '/superadmin/skpd';
    const queryString = params.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    console.log('API Request URL:', url);
    console.log('Status filter value:', filters.status);
    
    const response = await apiClient.get(url);
    return {
      data: response.data.data,
      pagination: response.data.pagination || {
        totalItems: response.data.data?.length || 0,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: response.data.data?.length || 0
      },
      searchQuery: response.data.searchQuery,
      statusFilter: response.data.statusFilter
    };
  }
};
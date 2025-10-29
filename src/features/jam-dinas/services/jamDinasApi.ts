import { apiClient } from '../../../services/apiService';
import type {
  JamDinas,
  JamDinasListResponse,
  JamDinasDetailResponse,
  JamDinasFilters,
  CreateJamDinasRequest,
  ApiResponse,
  OrganizationAssignmentListResponse,
  OrganizationAssignmentDetailResponse,
  OrganizationAssignmentFilters,
  CreateOrganizationAssignmentRequest,
  UpdateOrganizationAssignmentRequest,
  SystemSettingsResponse,
  TipeJadwalResponse,
  UpdateTipeJadwalRequest,
  UpdateTipeJadwalResponse
} from '../types';

export const jamDinasApi = {
  // Get all jam dinas with pagination and filters
  getAll: async (filters: JamDinasFilters = {}): Promise<JamDinasListResponse> => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status !== undefined) params.append('status', filters.status.toString());

    const endpoint = '/superadmin/jam-dinas';
    const queryString = params.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    const response = await apiClient.get<JamDinasListResponse>(url);
    return response.data;
  },

  // Get jam dinas by ID with details and assignments
  getById: async (id: number): Promise<JamDinasDetailResponse> => {
    const response = await apiClient.get<JamDinasDetailResponse>(`/superadmin/jam-dinas/${id}`);
    return response.data;
  },

  // Create new jam dinas
  create: async (data: CreateJamDinasRequest): Promise<ApiResponse<JamDinas>> => {
    const response = await apiClient.post<ApiResponse<JamDinas>>('/superadmin/jam-dinas', data);
    return response.data;
  },

  // Update existing jam dinas
  update: async (id: number, data: Partial<CreateJamDinasRequest>): Promise<ApiResponse<JamDinas>> => {
    const response = await apiClient.put<ApiResponse<JamDinas>>(`/superadmin/jam-dinas/${id}`, data);
    return response.data;
  },

  // Delete jam dinas
  delete: async (id: number): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/superadmin/jam-dinas/${id}`);
    return response.data;
  },

  // Toggle status jam dinas
  toggleStatus: async (id: number): Promise<ApiResponse<JamDinas>> => {
    const response = await apiClient.patch<ApiResponse<JamDinas>>(`/superadmin/jam-dinas/${id}/toggle-status`);
    return response.data;
  },

  // Search jam dinas
  search: async (query: string, page: number = 1, limit: number = 10): Promise<JamDinasListResponse> => {
    const response = await apiClient.get<JamDinasListResponse>('/superadmin/jam-dinas', {
      params: { search: query, page, limit }
    });
    return response.data;
  },

  // Assignment management
  getAssignments: async (id: number): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>(`/superadmin/jam-dinas/${id}/assignments`);
    return response.data;
  },

  addAssignment: async (id: number, data: { dinset_id: number; status: number }): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(`/superadmin/jam-dinas/${id}/assignments`, data);
    return response.data;
  },

  removeAssignment: async (id: number, dinsetId: number): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/superadmin/jam-dinas/${id}/assignments/${dinsetId}`);
    return response.data;
  },

  updateAssignment: async (id: number, dinsetId: number, data: { status: number }): Promise<ApiResponse> => {
    const response = await apiClient.put<ApiResponse>(`/superadmin/jam-dinas/${id}/assignments/${dinsetId}`, data);
    return response.data;
  },

  // Detail management
  createDetail: async (jamDinasId: number, data: {
    hari: string;
    tipe: string;
    jam_masuk_mulai: string;
    jam_masuk_selesai: string;
    jam_pulang_mulai: string;
    jam_pulang_selesai: string;
  }): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(`/superadmin/jam-dinas/${jamDinasId}/details`, data);
    return response.data;
  },

  updateDetail: async (jamDinasId: number, detailId: number, data: {
    hari: string;
    tipe: string;
    jam_masuk_mulai: string;
    jam_masuk_selesai: string;
    jam_pulang_mulai: string;
    jam_pulang_selesai: string;
  }): Promise<ApiResponse> => {
    const response = await apiClient.put<ApiResponse>(`/superadmin/jam-dinas/${jamDinasId}/details/${detailId}`, data);
    return response.data;
  },

  deleteDetail: async (jamDinasId: number, detailId: number): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/superadmin/jam-dinas/${jamDinasId}/details/${detailId}`);
    return response.data;
  }
};

// Organization Assignment API
export const organizationAssignmentApi = {
  // Get organization assignments
  getAll: async (filters: OrganizationAssignmentFilters = {}): Promise<OrganizationAssignmentListResponse> => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status !== undefined) params.append('status', filters.status.toString());
    if (filters.id_skpd) params.append('id_skpd', filters.id_skpd);
    if (filters.id_satker) params.append('id_satker', filters.id_satker);
    if (filters.id_bidang) params.append('id_bidang', filters.id_bidang);

    const endpoint = '/superadmin/jam-dinas/organization';
    const queryString = params.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    const response = await apiClient.get<OrganizationAssignmentListResponse>(url);
    return response.data;
  },

  // Get organization assignment by ID
  getById: async (id: number): Promise<OrganizationAssignmentDetailResponse> => {
    const response = await apiClient.get<OrganizationAssignmentDetailResponse>(`/superadmin/jam-dinas/organization/${id}`);
    return response.data;
  },

  // Create organization assignment
  create: async (data: CreateOrganizationAssignmentRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/superadmin/jam-dinas/organization', data);
    return response.data;
  },

  // Update organization assignment
  update: async (id: number, data: UpdateOrganizationAssignmentRequest): Promise<ApiResponse> => {
    const response = await apiClient.put<ApiResponse>(`/superadmin/jam-dinas/organization/${id}`, data);
    return response.data;
  },

  // Delete organization assignment
  delete: async (id: number): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/superadmin/jam-dinas/organization/${id}`);
    return response.data;
  },

  getAllSettings: async (): Promise<SystemSettingsResponse> => {
    const response = await apiClient.get<SystemSettingsResponse>('/system-settings');
    return response.data;
  },

  // Get current tipe jadwal
  getCurrentTipeJadwal: async (): Promise<TipeJadwalResponse> => {
    const response = await apiClient.get<TipeJadwalResponse>('/superadmin/system-settings/tipe-jadwal');
    return response.data;
  },

  // Update tipe jadwal global
  updateTipeJadwal: async (data: UpdateTipeJadwalRequest): Promise<UpdateTipeJadwalResponse> => {
    const response = await apiClient.put<UpdateTipeJadwalResponse>('/superadmin/system-settings/tipe-jadwal', data);
    return response.data;
  }
};
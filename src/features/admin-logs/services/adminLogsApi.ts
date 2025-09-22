import { apiClient } from '../../../services/apiService';
import type {
  AdminLogListResponse,
  AdminLogDetailResponse,
  AdminLogStatsResponse,
  CleanupLogsResponse,
  AdminLogFilters,
  CleanupLogsRequest
} from '../types';

export const adminLogsApi = {
  // Get all admin logs with filters
  getAll: async (filters: AdminLogFilters = {}): Promise<AdminLogListResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value) !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get(`/superadmin/admin-logs?${params.toString()}`);
    return response.data;
  },

  // Get admin log by ID
  getById: async (id: number): Promise<AdminLogDetailResponse> => {
    const response = await apiClient.get(`/superadmin/admin-logs/${id}`);
    return response.data;
  },

  // Get admin logs by admin ID
  getByAdminId: async (adminId: number, filters: { page?: number; limit?: number } = {}): Promise<AdminLogListResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value) !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get(`/superadmin/admin-logs/admin/${adminId}?${params.toString()}`);
    return response.data;
  },

  // Get admin logs statistics
  getStats: async (filters: {
    start_date?: string;
    end_date?: string;
    admin_id?: number;
  } = {}): Promise<AdminLogStatsResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value) !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get(`/superadmin/admin-logs/stats?${params.toString()}`);
    return response.data;
  },

  // Delete old admin logs (cleanup)
  cleanup: async (request: CleanupLogsRequest = {}): Promise<CleanupLogsResponse> => {
    const response = await apiClient.delete('/superadmin/admin-logs/cleanup', {
      data: request
    });
    return response.data;
  }
};
import { apiClient } from '../../../services/apiService';
import type { 
  SystemSettingsResponse, 
  TipeJadwalResponse, 
  UpdateTipeJadwalRequest, 
  UpdateTipeJadwalResponse 
} from '../types';

export const pengaturanApi = {
  // Get all system settings
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
import { apiClient } from './apiService';

interface AdminOpd {
  admopd_id: string;
  id_skpd: string;
  id_satker: string;
  id_bidang: string;
  kategori: string;
}

interface AdminUpt {
  admupt_id: string;
  id_skpd: string;
  id_satker: string;
  id_bidang: string;
  kategori: string;
  umum: string;
}

interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    email: string;
    level: string;
    status: string;
    device_id?: string | null;
  };
  admin_opd?: AdminOpd | null;
  admin_upt?: AdminUpt | null;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/admin/login', {
      username,
      password
    });
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh-token', {
      refreshToken
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  }
};
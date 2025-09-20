import { apiClient } from './apiService';

interface AdminOpd {
  id: string;
  username: string;
  email: string;
  nama: string;
  skpd: string;
}

interface AdminUpt {
  id: string;
  username: string;
  email: string;
  nama: string;
  upt: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  adminOpd?: AdminOpd;
  adminUpt?: AdminUpt;
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
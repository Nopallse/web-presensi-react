import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { isTokenExpired } from '../utils/tokenUtils';
import { isInvalidRefreshTokenError } from '../utils/authUtils';

// Create axios instance
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.pariamankota.my.id',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to automatically include auth token
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry refresh token requests to prevent infinite loops
      if (originalRequest.url?.includes('/auth/refresh-token')) {
        console.log('Refresh token request failed in apiService, logging out user');
        useAuthStore.getState().logout();
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const { accessToken, refreshToken } = useAuthStore.getState();
        
        if (!refreshToken) {
          // No refresh token available, logout user
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }

        // Check if access token is expired before trying to refresh
        if (accessToken && !isTokenExpired(accessToken)) {
          // Token is not expired yet, there might be another issue
          console.warn('Received 401 but token appears valid');
          return Promise.reject(error);
        }

        // Try to refresh the access token
        await useAuthStore.getState().refreshAccessToken();
        
        // Retry the original request with new token
        const newAccessToken = useAuthStore.getState().accessToken;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        // Refresh failed, logout user
        console.error('Token refresh failed:', refreshError);
        
        if (isInvalidRefreshTokenError(refreshError)) {
          console.log('Invalid refresh token detected in apiService, logging out');
        }
        
        useAuthStore.getState().logout();
        
        // Redirect to login page
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Basic API service class
export class ApiService {
  private client = apiClient;

  async get<T>(url: string, config?: any): Promise<{ data: T }> {
    const response = await this.client.get<T>(url, config);
    return response;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<{ data: T }> {
    const response = await this.client.post<T>(url, data, config);
    return response;
  }

  async put<T>(url: string, data?: any, config?: any): Promise<{ data: T }> {
    const response = await this.client.put<T>(url, data, config);
    return response;
  }

  async delete<T>(url: string, config?: any): Promise<{ data: T }> {
    const response = await this.client.delete<T>(url, config);
    return response;
  }
}

export const apiService = new ApiService();
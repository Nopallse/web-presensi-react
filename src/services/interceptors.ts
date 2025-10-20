import axiosInstance from './axiosInstance';
import { useAuthStore } from '../store/authStore';
import { isInvalidRefreshTokenError, handleAuthError } from '../utils/authUtils';
import { notificationService } from '../utils/messageService';

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Function to reset interceptor state (called when logging out)
export const resetInterceptorState = () => {
  isRefreshing = false;
  failedQueue = [];
};

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Add request timestamp for debugging
    config.metadata = { requestStartedAt: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    // Calculate request duration for debugging
    const startTime = response.config.metadata?.requestStartedAt?.getTime();
    if (startTime) {
      const requestDuration = new Date().getTime() - startTime;
      console.log(`API Request to ${response.config.url} took ${requestDuration}ms`);
    }
    
    return response;
  },
  async (error) => {
    const { response, config } = error;
    const { logout, refreshAccessToken } = useAuthStore.getState();

    // Handle 401 errors with token refresh
    if (response?.status === 401 && !config._retry) {
      // Don't retry refresh token requests to prevent infinite loops
      if (config.url?.includes('/auth/refresh-token')) {
        console.log('Refresh token request failed, logging out user');
        isRefreshing = false; // Reset refresh state
        processQueue(error, null); // Clear the queue
        logout();
        notificationService.error('Sesi Anda telah berakhir. Silakan login kembali.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          config.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(config);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      config._retry = true;
      isRefreshing = true;

      try {
        // Check if we have a refresh token before attempting to refresh
        const { refreshToken } = useAuthStore.getState();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        await refreshAccessToken();
        const newAccessToken = useAuthStore.getState().accessToken;
        processQueue(null, newAccessToken);
        
        if (newAccessToken) {
          config.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(config);
        } else {
          throw new Error('Failed to get new access token');
        }
      } catch (refreshError: any) {
        console.error('Token refresh failed:', refreshError);
        
        processQueue(refreshError, null);
        
        if (isInvalidRefreshTokenError(refreshError)) {
          notificationService.error('Sesi Anda telah berakhir. Silakan login kembali.');
          logout();
          handleAuthError();
        } else {
          notificationService.error('Gagal memperbarui sesi. Silakan login kembali.');
          logout();
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other error status codes
    if (response) {
      switch (response.status) {
        case 403:
          // Forbidden - insufficient permissions
          notificationService.error('Anda tidak memiliki izin untuk mengakses resource ini.');
          break;

        case 404:
          // Not found
          notificationService.error('Resource yang diminta tidak ditemukan.');
          break;

        case 422:
          // Validation error
          const validationMessage = response.data?.message || 'Data yang diinput tidak valid.';
          notificationService.error(validationMessage);
          break;

        case 429:
          // Too many requests
          notificationService.warning('Terlalu banyak permintaan. Silakan coba lagi nanti.');
          break;

        case 500:
          // Internal server error
          notificationService.error('Terjadi kesalahan pada server. Silakan coba lagi nanti.');
          break;

        default:
          // Generic error
          const errorMessage = response.data?.message || response.data?.error || 'Terjadi kesalahan. Silakan coba lagi.';
          notificationService.error(errorMessage);
      }
    } else if (error.request) {
      // Network error
      notificationService.error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    } else {
      // Other error
      notificationService.error('Terjadi kesalahan yang tidak diketahui.');
    }

    return Promise.reject(error);
  }
);

// Add metadata type to axios config
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      requestStartedAt?: Date;
    };
    _retry?: boolean;
  }
}

export default axiosInstance;
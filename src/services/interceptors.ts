import axiosInstance from './axiosInstance';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

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
    const { showToast } = useUIStore.getState();
    const { logout, refreshAccessToken } = useAuthStore.getState();

    // Handle 401 errors with token refresh
    if (response?.status === 401 && !config._retry) {
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
        await refreshAccessToken();
        const newAccessToken = useAuthStore.getState().accessToken;
        processQueue(null, newAccessToken);
        
        if (newAccessToken) {
          config.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(config);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        showToast({
          message: 'Sesi Anda telah berakhir. Silakan login kembali.',
          type: 'error'
        });
        logout();
        window.location.href = '/login';
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
          showToast({
            message: 'Anda tidak memiliki izin untuk mengakses resource ini.',
            type: 'error'
          });
          break;

        case 404:
          // Not found
          showToast({
            message: 'Resource yang diminta tidak ditemukan.',
            type: 'error'
          });
          break;

        case 422:
          // Validation error
          const validationMessage = response.data?.message || 'Data yang diinput tidak valid.';
          showToast({
            message: validationMessage,
            type: 'error'
          });
          break;

        case 429:
          // Too many requests
          showToast({
            message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
            type: 'warning'
          });
          break;

        case 500:
          // Internal server error
          showToast({
            message: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
            type: 'error'
          });
          break;

        default:
          // Generic error
          const errorMessage = response.data?.message || response.data?.error || 'Terjadi kesalahan. Silakan coba lagi.';
          showToast({
            message: errorMessage,
            type: 'error'
          });
      }
    } else if (error.request) {
      // Network error
      showToast({
        message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
        type: 'error'
      });
    } else {
      // Other error
      showToast({
        message: 'Terjadi kesalahan yang tidak diketahui.',
        type: 'error'
      });
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
import axios from 'axios';
import type { ApiResponse } from '../types/global';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.pariamankota.my.id/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Response types for better type safety
export interface AxiosApiResponse<T = any> extends ApiResponse<T> {
  data: T;
}

// Error response type
export interface AxiosErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export default axiosInstance;
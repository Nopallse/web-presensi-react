import axiosInstance from '../../../services/axiosInstance';
import type { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest,
  RefreshTokenResponse,
  ChangePasswordRequest, 
  UpdateProfileRequest 
} from '../types/auth';

export const authApi = {
  // Admin login
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>('/auth/admin/login', data);
    return response.data;
  },

  // Refresh token
  refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const response = await axiosInstance.post<RefreshTokenResponse>('/auth/refresh-token', data);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },

  // Get current user profile
  getProfile: async (): Promise<any> => {
    const response = await axiosInstance.get('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileRequest): Promise<any> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    
    if (data.nip) {
      formData.append('nip', data.nip);
    }
    
    if (data.avatar) {
      formData.append('avatar', data.avatar);
    }

    const response = await axiosInstance.post('/auth/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await axiosInstance.post('/auth/change-password', data);
  },

  // Verify token
  verifyToken: async (): Promise<any> => {
    const response = await axiosInstance.get('/auth/verify');
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    await axiosInstance.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> => {
    await axiosInstance.post('/auth/reset-password', data);
  }
};
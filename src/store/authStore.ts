import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/global';
import { authApi } from '../services/authApi';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  refreshAccessToken: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.login(username, password);
          
          // Map the API response to our User type
          const user: User = {
            id: response.adminOpd?.id || response.adminUpt?.id || '',
            username: response.adminOpd?.username || response.adminUpt?.username || username,
            email: response.adminOpd?.email || response.adminUpt?.email || '',
            name: response.adminOpd?.nama || response.adminUpt?.nama || '',
            role: response.adminOpd ? 'admin-opd' : 'admin-upt',
            // Add other required User fields with defaults
            phone: '',
            nip: '',
            skpd: response.adminOpd?.skpd || response.adminUpt?.upt || '',
            jabatan: '',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          set({
            user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login gagal'
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null
        });
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      refreshAccessToken: async () => {
        const { refreshToken: currentRefreshToken } = get();
        
        if (!currentRefreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await authApi.refreshToken(currentRefreshToken);
          
          set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true
          });
        } catch (error) {
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },

      updateProfile: async (data: Partial<User>) => {
        const { user } = get();
        if (!user) return;

        set({ isLoading: true, error: null });

        try {
          // API call will be implemented later
          const response = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${get().accessToken}`
            },
            body: JSON.stringify(data)
          });

          if (!response.ok) {
            throw new Error('Profile update failed');
          }

          const updatedUser = await response.json();
          
          set({
            user: { ...user, ...updatedUser },
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Profile update failed'
          });
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true, error: null });

        try {
          // API call will be implemented later
          const response = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${get().accessToken}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
          });

          if (!response.ok) {
            throw new Error('Password change failed');
          }

          set({
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Password change failed'
          });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// Selectors for easier usage
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error } = useAuthStore();
  return { user, isAuthenticated, isLoading, error };
};

export const useAuthActions = () => {
  const { 
    login, 
    logout, 
    setUser, 
    setTokens, 
    setLoading, 
    setError, 
    clearError, 
    refreshAccessToken,
    updateProfile, 
    changePassword 
  } = useAuthStore();
  return { 
    login, 
    logout, 
    setUser, 
    setTokens, 
    setLoading, 
    setError, 
    clearError, 
    refreshAccessToken,
    updateProfile, 
    changePassword 
  };
};
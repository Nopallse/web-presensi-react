import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/global';
import { authApi } from '../services/authApi';
import { isInvalidRefreshTokenError } from '../utils/authUtils';
import { resetInterceptorState } from '../services/interceptors';
import { useEffect } from 'react';

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
  fetchUserProfile: () => Promise<void>;
  verifyAndRecoverUser: () => Promise<boolean>;
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
          
          // Validate level - only accept 1, 2, or 3
          const validLevels = ['1', '2', '3'];
          if (!validLevels.includes(response.user.level)) {
            set({
              isLoading: false,
              error: 'Level akses tidak valid. Akses ditolak.'
            });
            throw new Error('Level akses tidak valid');
          }
          
          // Map level to role based on the login response
          const mapLevelToRole = (level: string): 'super_admin' | 'admin' | 'admin-opd' | 'admin-upt' => {
            switch (level) {
              case '1':
                return 'super_admin';
              case '2':
              case '3':
                // If admin_opd exists, it's admin-opd, otherwise regular admin
                if (response.admin_opd) return 'admin-opd';
                return 'admin';
              default:
                throw new Error('Level tidak valid'); // This shouldn't happen due to validation above
            }
          };

          const role = mapLevelToRole(response.user.level);
          
          // Map the API response to our User type
          const user: User = {
            id: response.user.id.toString(),
            username: response.user.username,
            email: response.user.email || '',
            name: response.user.username, // Use username as name if no name provided
            role: role,
            phone: '',
            nip: response.user.username, // Assuming username is NIP
            skpd: response.admin_opd?.id_skpd || '',
            jabatan: response.admin_opd?.kategori || '',
            status: response.user.status === '0' ? 'active' : 'inactive',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            admin_opd: response.admin_opd ? {
              admopd_id: Number(response.admin_opd.admopd_id),
              id_skpd: response.admin_opd.id_skpd,
              id_satker: response.admin_opd.id_satker,
              id_bidang: response.admin_opd.id_bidang || undefined,
              kategori: Number(response.admin_opd.kategori)
            } : undefined
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
        // Reset interceptor state to prevent any ongoing refresh attempts
        resetInterceptorState();
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null
        });
        
        // Clear any remaining auth data from storage
        localStorage.removeItem('auth-storage');
        sessionStorage.clear();
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
    const { refreshToken: currentRefreshToken, user: currentUser } = get();
    
    if (!currentRefreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await authApi.refreshToken(currentRefreshToken);
      
      set({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        // Preserve existing user data if available
        user: currentUser
      });

      // If user data is missing, try to fetch it
      if (!currentUser && response.accessToken) {
        try {
          await get().fetchUserProfile();
        } catch (error) {
          // User profile fetch failed, but token refresh succeeded
        }
      }
    } catch (error: any) {
      console.error('Refresh token error:', error);
      
      // Check if it's specifically an invalid refresh token error
      if (isInvalidRefreshTokenError(error)) {
        // Clear tokens and logout user
        get().logout();
      } else {
        // For other errors, still logout but log differently
        console.log('Token refresh failed with other error, logging out');
        get().logout();
      }
      
      throw error;
    }
  },

  fetchUserProfile: async () => {
    const { accessToken } = get();
    
    if (!accessToken) {
      throw new Error('No access token available');
    }

    try {
      // Decode JWT to get user info
      const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
      
      // Create user object from token payload
      const user: User = {
        id: tokenPayload.userId?.toString() || '',
        username: tokenPayload.username || '',
        email: '',
        name: tokenPayload.username || '',
        role: tokenPayload.level === '1' ? 'super_admin' : 'admin',
        phone: '',
        nip: tokenPayload.username || '',
        skpd: '',
        jabatan: '',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      set({ user });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  },

  verifyAndRecoverUser: async () => {
    const { accessToken, refreshToken, user } = get();
    
    // If we have tokens but no user data, try to recover
    if ((accessToken || refreshToken) && !user) {
      try {
        if (accessToken) {
          // Try to extract user from current access token
          await get().fetchUserProfile();
          return true;
        } else if (refreshToken) {
          // Try to refresh token and get user data
          await get().refreshAccessToken();
          return true;
        }
      } catch (error) {
        console.error('Failed to recover user data:', error);
        // If recovery fails, logout to clean state
        get().logout();
        return false;
      }
    }
    
    return !!user; // Return true if user already exists
  },      updateProfile: async (data: Partial<User>) => {
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
      }),
      onRehydrateStorage: () => (state) => {
        // Auto-recovery user data from token when store rehydrates
        if (state && (state.accessToken || state.refreshToken) && !state.user) {
          console.log('Auto-recovering user data from tokens on rehydrate...');
          
          // Try to extract user from access token
          if (state.accessToken) {
            try {
              const tokenPayload = JSON.parse(atob(state.accessToken.split('.')[1]));
              
              const user: User = {
                id: tokenPayload.userId?.toString() || '',
                username: tokenPayload.username || '',
                email: '',
                name: tokenPayload.username || '',
                role: tokenPayload.level === '1' ? 'super_admin' : 'admin',
                phone: '',
                nip: tokenPayload.username || '',
                skpd: '',
                jabatan: '',
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };

              // Update the state with recovered user
              useAuthStore.setState({ user });
              console.log('✅ User data recovered from access token');
            } catch (error) {
              console.error('❌ Failed to recover user from access token:', error);
            }
          }
        }
      }
    }
  )
);

// Selectors for easier usage
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error, accessToken } = useAuthStore();
  
  // Auto-recovery jika ada token tapi tidak ada user
  useEffect(() => {
    if (isAuthenticated && accessToken && !user) {
      console.log('🔄 Auto-recovering user data...');
      useAuthStore.getState().fetchUserProfile().catch(console.error);
    }
  }, [isAuthenticated, accessToken, user]);
  
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
    fetchUserProfile,
    verifyAndRecoverUser,
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
    fetchUserProfile,
    verifyAndRecoverUser,
    updateProfile, 
    changePassword 
  };
};

// Helper function to initialize auth state on app start
export const initializeAuth = async () => {
  try {
    await useAuthStore.getState().verifyAndRecoverUser();
  } catch (error) {
    console.error('Failed to initialize auth:', error);
  }
};
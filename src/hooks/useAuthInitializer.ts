import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

/**
 * Hook untuk memulihkan data user saat aplikasi dimuat
 * Digunakan di App.tsx atau layout utama
 */
export const useAuthInitializer = () => {
  const { accessToken, refreshToken, user, verifyAndRecoverUser } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      // Jika ada token tapi tidak ada user data, coba pulihkan
      if ((accessToken || refreshToken) && !user) {
        console.log('Attempting to recover user data from tokens...');
        try {
          await verifyAndRecoverUser();
          console.log('User data recovered successfully');
        } catch (error) {
          console.error('Failed to recover user data:', error);
        }
      }
    };

    initializeAuth();
  }, [accessToken, refreshToken, user, verifyAndRecoverUser]);

  return {
    hasTokens: !!(accessToken || refreshToken),
    hasUser: !!user,
    isRecoveryNeeded: !!(accessToken || refreshToken) && !user
  };
};

/**
 * Hook untuk debugging auth state
 */
export const useAuthDebug = () => {
  const authState = useAuthStore();

  useEffect(() => {
    console.group('🔐 Auth Debug State');
    console.log('User:', authState.user);
    console.log('Access Token:', authState.accessToken ? '✅ Present' : '❌ Missing');
    console.log('Refresh Token:', authState.refreshToken ? '✅ Present' : '❌ Missing');
    console.log('Is Authenticated:', authState.isAuthenticated);
    console.log('Is Loading:', authState.isLoading);
    console.log('Error:', authState.error);
    console.groupEnd();
  }, [authState]);

  return authState;
};
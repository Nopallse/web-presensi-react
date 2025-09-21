import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

interface AuthInitializerProps {
  children: React.ReactNode;
}

export const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const { accessToken, user, isAuthenticated, fetchUserProfile, verifyAndRecoverUser } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🚀 AuthInitializer: Starting auth initialization...');
      console.log('🔍 Auth state:', { 
        hasToken: !!accessToken, 
        hasUser: !!user, 
        isAuthenticated 
      });

      // Jika ada token tapi tidak ada user data
      if (accessToken && !user) {
        console.log('⚠️ Token found but no user data, attempting recovery...');
        try {
          // Coba recover dari token dulu
          const recovered = await verifyAndRecoverUser();
          if (!recovered) {
            // Jika gagal, fetch dari API
            console.log('📡 Recovery failed, fetching from API...');
            await fetchUserProfile();
          }
        } catch (error) {
          console.error('❌ Auth recovery failed:', error);
        }
      }
      
      console.log('✅ Auth initialization completed');
    };

    initializeAuth();
  }, []); // Run once on mount

  return <>{children}</>;
};
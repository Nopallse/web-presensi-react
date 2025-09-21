import React from 'react';
import { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { useAuthStore } from '../store/authStore';
import { antdTheme } from '../config/antd-theme';
import { isTokenExpired } from '../utils/tokenUtils';
import { AuthInitializer } from '../components/AuthInitializer';
import idID from 'antd/locale/id_ID';

interface AppProvidersProps {
  children: React.ReactNode;
}

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  const { setLoading, logout, verifyAndRecoverUser, accessToken, refreshToken, user } = useAuthStore();

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🚀 App initialization starting...');
      console.log('🔍 Initial auth state:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken,
        hasUser: !!user 
      });
      
      // If no tokens, just set loading to false
      if (!accessToken || !refreshToken) {
        console.log('❌ No tokens found, skipping auth initialization');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Try to recover user data first
        const recovered = await verifyAndRecoverUser();
        console.log('🔄 User recovery result:', recovered);
        
        // Check if access token is expired
        if (isTokenExpired(accessToken)) {
          console.log('⏰ Access token expired, refreshing...');
          await useAuthStore.getState().refreshAccessToken();
        }
        
        console.log('✅ Auth initialization completed');
      } catch (error) {
        console.error('❌ Auth initialization failed:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []); // Empty dependency array to run only once

  return (
    <ConfigProvider 
      theme={antdTheme}
      locale={idID}
    >
      <AuthInitializer>
        {children}
      </AuthInitializer>
    </ConfigProvider>
  );
};

export default AppProviders;
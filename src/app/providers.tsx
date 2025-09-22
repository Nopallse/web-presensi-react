import React from 'react';
import { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { useAuthStore } from '../store/authStore';
import { antdTheme } from '../config/antd-theme';
import { isTokenExpired } from '../utils/tokenUtils';
import idID from 'antd/locale/id_ID';

interface AppProvidersProps {
  children: React.ReactNode;
}

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  const { setLoading, logout, verifyAndRecoverUser, accessToken, refreshToken } = useAuthStore();

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      // If no tokens, just set loading to false
      if (!accessToken || !refreshToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Try to recover user data first
        await verifyAndRecoverUser();
        
        // Check if access token is expired
        if (isTokenExpired(accessToken)) {
          await useAuthStore.getState().refreshAccessToken();
        }
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
      {children}
    </ConfigProvider>
  );
};

export default AppProviders;
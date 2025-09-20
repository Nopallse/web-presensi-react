import React from 'react';
import { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { useAuthStore } from '../store/authStore';
import { antdTheme } from '../config/antd-theme';
import idID from 'antd/locale/id_ID';

interface AppProvidersProps {
  children: React.ReactNode;
}

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  const { setLoading, logout } = useAuthStore();

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const { accessToken, refreshToken } = useAuthStore.getState();
      
      if (!accessToken || !refreshToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Try to refresh the token to verify it's still valid
        await useAuthStore.getState().refreshAccessToken();
        
        // If successful, the user is already set from persistence
      } catch (error) {
        console.error('Auth initialization failed:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [setLoading, logout]);

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
import React from 'react';
import { useEffect } from 'react';
import { ConfigProvider, App, message } from 'antd';
import { useAuthStore } from '../store/authStore';
import { antdTheme } from '../config/antd-theme';
import { isTokenExpired } from '../utils/tokenUtils';
import idID from 'antd/locale/id_ID';

interface AppProvidersProps {
  children: React.ReactNode;
}

// Store original message methods
const originalMessage = {
  success: message.success,
  error: message.error,
  warning: message.warning,
  info: message.info,
};

// Komponen untuk setup global notification
const GlobalNotificationSetup: React.FC = () => {
  const { notification } = App.useApp();

  useEffect(() => {
    // Override message methods dengan notification
    (message as any).success = (content: string) => {
      notification.success({
        message: 'Berhasil',
        description: content,
        placement: 'topRight',
        duration: 4,
      });
    };

    (message as any).error = (content: string) => {
      notification.error({
        message: 'Error',
        description: content,
        placement: 'topRight',
        duration: 5,
      });
    };

    (message as any).warning = (content: string) => {
      notification.warning({
        message: 'Peringatan',
        description: content,
        placement: 'topRight',
        duration: 4,
      });
    };

    (message as any).info = (content: string) => {
      notification.info({
        message: 'Info',
        description: content,
        placement: 'topRight',
        duration: 4,
      });
    };

    // Set global notification untuk service/utility
    (window as any).globalNotification = {
      success: (message as any).success,
      error: (message as any).error,
      warning: (message as any).warning,
      info: (message as any).info,
    };

    // Cleanup function
    return () => {
      Object.assign(message, originalMessage);
    };
  }, [notification]);

  return null;
};

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
      <App
        notification={{
          placement: 'topRight',
          top: 24,
          duration: 4,
          maxCount: 3,
        }}
      >
        <GlobalNotificationSetup />
        {children}
      </App>
    </ConfigProvider>
  );
};

export default AppProviders;
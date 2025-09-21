import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuthDebugger = () => {
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  const { user, accessToken, refreshToken, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    const updateDebugInfo = () => {
      const now = new Date().toISOString();
      const tokenInfo = accessToken ? {
        hasToken: true,
        tokenLength: accessToken.length,
        tokenPreview: `${accessToken.substring(0, 20)}...`,
        isExpired: false, // We can add token expiry check here if needed
      } : { hasToken: false };

      setDebugInfo({
        timestamp: now,
        user: user ? {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          skpd: user.skpd,
        } : null,
        tokens: {
          access: tokenInfo,
          refresh: refreshToken ? {
            hasRefreshToken: true,
            refreshTokenLength: refreshToken.length,
          } : { hasRefreshToken: false },
        },
        state: {
          isAuthenticated,
          isLoading,
        }
      });
    };

    updateDebugInfo();
    
    // Update debug info whenever auth state changes
    const interval = setInterval(updateDebugInfo, 1000);
    
    return () => clearInterval(interval);
  }, [user, accessToken, refreshToken, isAuthenticated, isLoading]);

  const logAuthState = () => {
    console.log('🔍 Auth Debug Info:', debugInfo);
  };

  const forceUserRecovery = async () => {
    console.log('🔄 Force user recovery triggered...');
    try {
      const result = await useAuthStore.getState().verifyAndRecoverUser();
      console.log('✅ Force recovery result:', result);
      return result;
    } catch (error) {
      console.error('❌ Force recovery failed:', error);
      return false;
    }
  };

  return {
    debugInfo,
    logAuthState,
    forceUserRecovery,
  };
};
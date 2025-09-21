/**
 * Authentication utility functions
 */

interface ApiError {
  response?: {
    data?: {
      code?: string;
      error?: string;
    };
    status?: number;
  };
}

/**
 * Check if an error is an invalid refresh token error
 */
export const isInvalidRefreshTokenError = (error: ApiError): boolean => {
  return !!(
    error.response?.data?.code === 'INVALID_REFRESH_TOKEN' ||
    error.response?.data?.error === 'Refresh token tidak valid' ||
    (error.response?.status === 401 && error.response?.data?.error?.includes('refresh'))
  );
};

/**
 * Check if an error is an authentication error (401)
 */
export const isAuthError = (error: ApiError): boolean => {
  return !!(error.response?.status === 401);
};

/**
 * Handle logout and redirect to login page
 */
export const handleAuthError = (message: string = 'Sesi Anda telah berakhir. Silakan login kembali.') => {
  // Clear any stored tokens
  localStorage.removeItem('auth-storage');
  sessionStorage.clear();
  
  // Show error message
  console.log('Auth error:', message);
  
  // Redirect to login page
  setTimeout(() => {
    window.location.href = '/login';
  }, 100);
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  localStorage.removeItem('auth-storage');
  sessionStorage.clear();
};
/**
 * Utility functions for handling JWT tokens
 */

interface JWTPayload {
  exp: number;
  iat: number;
  userId: number;
  username: string;
  level: string;
  [key: string]: any;
}

/**
 * Decode JWT token without verification (client-side only)
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 * @param token JWT token string
 * @param bufferSeconds Buffer time in seconds before actual expiry (default: 60)
 */
export const isTokenExpired = (token: string, bufferSeconds: number = 60): boolean => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const expiryTime = decoded.exp - bufferSeconds; // Add buffer time
    
    return currentTime >= expiryTime;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
};

/**
 * Get time until token expires
 */
export const getTokenTimeToExpiry = (token: string): number => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) {
      return 0;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeToExpiry = decoded.exp - currentTime;
    
    return Math.max(0, timeToExpiry);
  } catch (error) {
    console.error('Error getting token time to expiry:', error);
    return 0;
  }
};

/**
 * Check if token needs refresh (expires within next 5 minutes)
 */
export const shouldRefreshToken = (token: string): boolean => {
  return isTokenExpired(token, 300); // 5 minutes buffer
};
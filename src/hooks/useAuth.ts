import { useAuth as useAuthStore } from '../store/authStore';
import { roleGuard } from '../utils/roleGuard';

export const useAuth = () => {
  const auth = useAuthStore();
  
  return {
    ...auth,
    // Helper methods for role checking
    hasRole: (roles: string[]) => {
      return auth.user ? roleGuard.hasRole(auth.user.role, roles as any) : false;
    },
    canAccess: (feature: string) => {
      return auth.user ? roleGuard.canAccess(auth.user.role, feature) : false;
    },
    canCreate: (resource: string) => {
      return auth.user ? roleGuard.canCreate(auth.user.role, resource) : false;
    },
    canEdit: (resource: string) => {
      return auth.user ? roleGuard.canEdit(auth.user.role, resource) : false;
    },
    canDelete: (resource: string) => {
      return auth.user ? roleGuard.canDelete(auth.user.role, resource) : false;
    },
    isSuperAdmin: () => {
      return auth.user ? roleGuard.isSuperAdmin(auth.user.role) : false;
    },
    isAdmin: () => {
      return auth.user ? roleGuard.isAdmin(auth.user.role) : false;
    }
  };
};
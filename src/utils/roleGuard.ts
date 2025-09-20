import type { Role } from '../types/global';

// Role guard utilities
export const roleGuard = {
  // Check if user has required role
  hasRole: (userRole: Role, requiredRoles: Role[]): boolean => {
    return requiredRoles.includes(userRole);
  },

  // Check if user is super admin
  isSuperAdmin: (userRole: Role): boolean => {
    return userRole === 'super_admin';
  },

  // Check if user is admin
  isAdmin: (userRole: Role): boolean => {
    return userRole === 'admin';
  },

  // Check if user can access a specific feature
  canAccess: (userRole: Role, feature: string): boolean => {
    const permissions = {
      super_admin: [
        'dashboard',
        'pegawai',
        'skpd',
        'lokasi',
        'kegiatan',
        'presensi',
        'jam-dinas',
        'pengaturan'
      ],
      admin: [
        'dashboard',
        'pegawai',
        'skpd',
        'lokasi',
        'presensi'
      ]
    };

    return permissions[userRole]?.includes(feature) || false;
  },

  // Get allowed menu items for role
  getMenuForRole: (userRole: Role) => {
    const menuItems = {
      super_admin: [
        { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
        { label: 'Pegawai', path: '/pegawai', icon: 'Users' },
        { label: 'SKPD', path: '/skpd', icon: 'Building' },
        { label: 'Lokasi', path: '/lokasi', icon: 'MapPin' },
        { label: 'Kegiatan', path: '/kegiatan', icon: 'Calendar' },
        { label: 'Presensi', path: '/presensi', icon: 'Clock' },
        {
          label: 'Jam Dinas',
          icon: 'Timer',
          children: [
            { label: 'Kelola Jam Dinas', path: '/jam-dinas/kelola' },
            { label: 'Jam Dinas per Organisasi', path: '/jam-dinas/organisasi' }
          ]
        },
        { label: 'Pengaturan', path: '/pengaturan', icon: 'Settings' }
      ],
      admin: [
        { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
        { label: 'Pegawai', path: '/pegawai', icon: 'Users' },
        { label: 'SKPD', path: '/skpd', icon: 'Building' },
        { label: 'Lokasi', path: '/lokasi', icon: 'MapPin' },
        { label: 'Presensi', path: '/presensi', icon: 'Clock' }
      ]
    };

    return menuItems[userRole] || [];
  },

  // Check if user can perform CRUD operations
  canCreate: (userRole: Role, resource: string): boolean => {
    const createPermissions = {
      super_admin: ['pegawai', 'skpd', 'lokasi', 'kegiatan', 'jam-dinas'],
      admin: ['pegawai', 'lokasi']
    };

    return createPermissions[userRole]?.includes(resource) || false;
  },

  canEdit: (userRole: Role, resource: string): boolean => {
    const editPermissions = {
      super_admin: ['pegawai', 'skpd', 'lokasi', 'kegiatan', 'jam-dinas', 'pengaturan'],
      admin: ['pegawai', 'lokasi']
    };

    return editPermissions[userRole]?.includes(resource) || false;
  },

  canDelete: (userRole: Role, resource: string): boolean => {
    const deletePermissions = {
      super_admin: ['pegawai', 'skpd', 'lokasi', 'kegiatan'],
      admin: ['pegawai', 'lokasi']
    };

    return deletePermissions[userRole]?.includes(resource) || false;
  },

  canView: (userRole: Role, resource: string): boolean => {
    return roleGuard.canAccess(userRole, resource);
  },

  // Filter items based on role
  filterByRole: <T extends { roles?: Role[] }>(items: T[], userRole: Role): T[] => {
    return items.filter(item => 
      !item.roles || item.roles.length === 0 || item.roles.includes(userRole)
    );
  }
};

// Higher-order component for role-based rendering
export const withRoleGuard = (
  component: React.ReactNode,
  requiredRoles: Role[],
  userRole: Role,
  fallback?: React.ReactNode
): React.ReactNode => {
  if (roleGuard.hasRole(userRole, requiredRoles)) {
    return component;
  }
  return fallback || null;
};

// Hook for role-based access control (to be implemented with actual user store)
export const useRoleGuard = () => {
  // This will be connected to the auth store
  return {
    hasRole: (_requiredRoles: Role[]) => {
      // Implementation will depend on auth store
      return true; // Placeholder
    },
    canAccess: (_feature: string) => {
      // Implementation will depend on auth store
      return true; // Placeholder
    },
    canCreate: (_resource: string) => {
      // Implementation will depend on auth store
      return true; // Placeholder
    },
    canEdit: (_resource: string) => {
      // Implementation will depend on auth store
      return true; // Placeholder
    },
    canDelete: (_resource: string) => {
      // Implementation will depend on auth store
      return true; // Placeholder
    }
  };
};
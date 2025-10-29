export interface AdminLog {
  id: number;
  admin_id: number;
  admin_username: string;
  admin_level: string;
  action: string;
  resource: string;
  resource_id?: number;
  description: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  admin?: {
    id: number;
    username: string;
    email: string;
    level: string;
    status: number;
  };
}

export interface AdminLogFilters {
  page?: number;
  limit?: number;
  admin_id?: number;
  action?: string;
  resource?: string;
  start_date?: string;
  end_date?: string;
  admin_level?: string;
  search?: string;
}

export interface AdminLogListResponse {
  success: boolean;
  data: AdminLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AdminLogDetailResponse {
  success: boolean;
  data: AdminLog;
}

export interface AdminLogStats {
  totalLogs: number;
  logsByAction: Array<{
    action: string;
    count: number;
  }>;
  logsByResource: Array<{
    resource: string;
    count: number;
  }>;
  logsByLevel: Array<{
    admin_level: string;
    count: number;
  }>;
  mostActiveAdmins: Array<{
    admin_id: number;
    admin_username: string;
    admin_level: string;
    count: number;
  }>;
  recentActivity: Array<{
    date: string;
    count: number;
  }>;
}

export interface AdminLogStatsResponse {
  success: boolean;
  data: AdminLogStats;
}

export interface CleanupLogsRequest {
  days?: number;
}

export interface CleanupLogsResponse {
  success: boolean;
  message: string;
  deletedCount: number;
}

// Action types for filtering
export const ADMIN_LOG_ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  EXPORT: 'EXPORT'
} as const;

export type AdminLogAction = keyof typeof ADMIN_LOG_ACTIONS;

// Resource types for filtering
export const ADMIN_LOG_RESOURCES = {
  USER: 'users',
  PEGAWAI: 'pegawai',
  SKPD: 'skpd',
  UNIT_KERJA: 'unit_kerja',
  LOKASI: 'lokasi',
  KEGIATAN: 'kegiatan',
  JAM_DINAS: 'jam_dinas',
  PRESENSI: 'presensi',
  DEVICE_RESET: 'device_reset',
  ADMIN_LOGS: 'admin_logs',
} as const;

export type AdminLogResource = typeof ADMIN_LOG_RESOURCES[keyof typeof ADMIN_LOG_RESOURCES];

// Admin levels for filtering
export const ADMIN_LEVELS = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  ADMIN_OPD: 'admin-opd',
  ADMIN_UPT: 'admin-upt'
} as const;

export type AdminLevel = typeof ADMIN_LEVELS[keyof typeof ADMIN_LEVELS];
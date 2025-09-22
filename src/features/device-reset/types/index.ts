export interface DeviceResetRequest {
  id: number;
  user_id: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_response?: string;
  approved_by?: number;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
    email: string;
    level: string;
    id_opd?: number;
    id_upt?: number;
    device_id?: string;
    // Master data fields
    nama_lengkap?: string;
    opd?: {
      id: number;
      nama: string;
    };
    upt?: {
      id: number;
      nama: string;
    };
  };
  admin?: {
    id: number;
    username: string;
    email: string;
    nama_lengkap?: string;
  } | null;
}

export interface DeviceResetResponse {
  data: DeviceResetRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UpdateDeviceResetStatusRequest {
  status: 'approved' | 'rejected';
  admin_response?: string;
}

export interface UpdateDeviceResetStatusResponse {
  message: string;
  data: {
    id: number;
    status: string;
    admin_response?: string;
    approved_at?: string;
    user: DeviceResetRequest['user'];
  };
}

export interface DeviceResetFilters {
  status?: 'pending' | 'approved' | 'rejected';
  page?: number;
  limit?: number;
}
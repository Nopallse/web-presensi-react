// Global type definitions
export type Role = 'super_admin' | 'admin' | 'admin-opd' | 'admin-upt';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  nip: string;
  role: Role;
  skpd: string;
  jabatan: string;
  status: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  // Additional admin_opd data
  admin_opd?: {
    admopd_id: number;
    id_skpd: string;
    id_satker: string;
    id_bidang?: string;
    kategori: number;
  };
  // Additional admin_upt data
  admin_upt?: {
    admupt_id: number;
    id_skpd: string;
    id_satker: string;
    id_bidang: string;
    kategori: number;
    umum: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface MenuCategory {
  label: string;
  icon?: string;
  items: MenuItem[];
}

export interface MenuItem {
  label: string;
  path?: string;
  icon?: string;
  roles?: Role[];
  children?: MenuItem[];
}

export interface FilterParams {
  search?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  [key: string]: any;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}
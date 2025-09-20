import type { User } from '../../../types/global';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AdminOpd {
  admopd_id: string;
  id_skpd: string;
  id_satker: string;
  id_bidang: string;
  kategori: string;
}

export interface AdminUpt {
  admupt_id: string;
  id_skpd: string;
  id_satker: string;
  id_bidang: string;
  kategori: string;
  umum: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    level: string;
    status: string;
    device_id?: string;
  };
  admin_opd?: AdminOpd;
  admin_upt?: AdminUpt;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
  nip?: string;
  avatar?: File;
}

export interface AuthUser extends User {
  permissions?: string[];
  last_login?: string;
  level?: string;
  admin_opd?: AdminOpd;
  admin_upt?: AdminUpt;
}
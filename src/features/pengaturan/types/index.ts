export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TipeJadwalSetting {
  tipe: 'normal' | 'ramadhan';
}

export type TipeJadwalOption = 'normal' | 'ramadhan';

export interface UpdateTipeJadwalRequest {
  tipe: TipeJadwalOption;
}

export interface SystemSettingsResponse {
  success: boolean;
  data: SystemSetting[];
}

export interface TipeJadwalResponse {
  success: boolean;
  data: TipeJadwalSetting;
}

export interface UpdateTipeJadwalResponse {
  success: boolean;
  message: string;
  data: SystemSetting;
}
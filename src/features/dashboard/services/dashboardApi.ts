import { apiService } from '../../../services/apiService';

export interface KegiatanHariIni {
  id_kegiatan: number;
  tanggal_kegiatan: string;
  jenis_kegiatan: string;
  keterangan: string;
  jam_mulai: string | null;
  jam_selesai: string | null;
  include_absen: string;
}

export interface SuperAdminDashboardData {
  systemOverview: {
    totalUsers: number;
  };
  organizationalStatistics: {
    totalSatker: number;
    totalBidang: number;
    totalSubBidang: number;
  };
  kegiatanHariIni: KegiatanHariIni[];
  kehadiranList: {
    data: KehadiranItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface KehadiranItem {
  absen_id: number;
  absen_nip: string;
  lokasi_id: number;
  absen_tgl: string;
  absen_tgljam: string;
  absen_checkin: string;
  absen_checkout: string;
  absen_kat: string;
  absen_apel: string;
  absen_sore: string;
  User: {
    username: string;
    email: string;
  } | null;
  Lokasi: {
    lat: number;
    lng: number;
    ket: string;
  };
}

export class DashboardApi {
  async getSuperAdminDashboard(): Promise<SuperAdminDashboardData> {
    const response = await apiService.get<{ success: boolean; data: SuperAdminDashboardData }>('/superadmin/dashboard/super-admin');
    
    // Handle the response structure { success: true, data: {...} }
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error('Invalid response format');
  }

  async getKehadiranList(page = 1, limit = 10): Promise<SuperAdminDashboardData['kehadiranList']> {
    const response = await apiService.get<SuperAdminDashboardData['kehadiranList']>(
      `/dashboard/kehadiran?page=${page}&limit=${limit}`
    );
    return response.data;
  }
}

export const dashboardApi = new DashboardApi();
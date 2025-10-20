import { apiClient } from '../../../services/apiService';
import { useAuthStore } from '../../../store/authStore';
import type {
  KehadiranApiResponse,
  KehadiranDetailApiResponse,
  KehadiranFilters,
  MonthlyAttendanceFilters,
  MonthlyAttendanceApiResponse,
  ExportFilters,
  ApiError
} from '../types';

class PresensiApiService {
  /**
   * Get base path based on user role
   */
  private getBasePath(): string {
    const user = useAuthStore.getState().user;
    const role = user?.role;
    
    switch (role) {
      case 'super_admin':
        return '/superadmin/kehadiran';
      case 'admin':
      case 'admin-opd':
      case 'admin-upt':
        return '/admin/kehadiran';
      default:
        // Default to admin for safety
        return '/admin/kehadiran';
    }
  }

  /**
   * Get Satker options for dropdown
   */
  async getSatkerOptions(search?: string, page: number = 1, limit: number = 50): Promise<Array<{ label: string; value: string; }>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const queryString = params.toString();
    const url = queryString ? `/unit-kerja/options?${queryString}` : '/unit-kerja/options';

    try {
      const response = await apiClient.get<{ data: Array<{ KDSATKER: string; NMSATKER: string }> }>(url);
      return [
        { label: '🚫 Tanpa Satker', value: 'null' },
        ...response.data.data.map((satker: any) => ({
          label: `${satker.KDSATKER} - ${satker.NMSATKER}`,
          value: satker.KDSATKER,
        })),
      ];
    } catch (error) {
      console.error('Error fetching Satker options:', error);
      return [];
    }
  }

  /**
   * Get Bidang options for dropdown based on selected Satker
   */
  async getBidangOptions(idSatker: string, search?: string, page: number = 1, limit: number = 50): Promise<Array<{ label: string; value: string; }>> {
    const params = new URLSearchParams();
    params.append('satker', idSatker);
    if (search) params.append('search', search);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const queryString = params.toString();
    const url = queryString ? `/unit-kerja/options/bidang?${queryString}` : `/unit-kerja/options/bidang`;

    try {
      const response = await apiClient.get<{ data: Array<{ BIDANGF: string; NMBIDANG: string }> }>(url);
      return [
        { label: '🚫 Tanpa Bidang', value: 'null' },
        ...response.data.data.map((bidang: any) => ({
          label: `${bidang.BIDANGF} - ${bidang.NMBIDANG}`,
          value: bidang.BIDANGF,
        })),
      ];
    } catch (error) {
      console.error('Error fetching Bidang options:', error);
      return [{ label: '🚫 Tanpa Bidang', value: 'null' }];
    }
  }

  /**
   * Get all attendance records with filtering and pagination
   * Corresponds to: GET /kehadiran
   */
  async getAllKehadiran(filters: KehadiranFilters = {}): Promise<KehadiranApiResponse> {
    try {
      const params = new URLSearchParams();
      
      // Add pagination parameters
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      
      // Add search parameter
      if (filters.search) params.append('search', filters.search);
      
      // Add date range filters
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      // Add location filter
      if (filters.lokasi_id) params.append('lokasi_id', filters.lokasi_id);
      
      // Add satker filter
      if (filters.satker) params.append('satker', filters.satker);
      
      // Add bidang filter
      if (filters.bidang) params.append('bidang', filters.bidang);
      
      // Add status filter (for absen_apel or absen_sore)
      if (filters.status) params.append('status', filters.status);

      const response = await apiClient.get<KehadiranApiResponse>(
        `${this.getBasePath()}?${params.toString()}`
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching kehadiran data:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get attendance record by ID
   * Corresponds to: GET /kehadiran/:id
   */
  async getKehadiranById(id: string): Promise<KehadiranDetailApiResponse> {
    try {
      const response = await apiClient.get<KehadiranDetailApiResponse>(
        `${this.getBasePath()}/${id}`
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching kehadiran detail:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get attendance records by user ID
   * Corresponds to: GET /kehadiran/user/:user_id
   */
  async getKehadiranByUserId(userId: string, filters: Partial<KehadiranFilters> = {}): Promise<KehadiranApiResponse> {
    try {
      const params = new URLSearchParams();
      
      // Add pagination parameters
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      
      // Add date range filters
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      // Add location filter
      if (filters.lokasi_id) params.append('lokasi_id', filters.lokasi_id);
      
      // Add status filter
      if (filters.status) params.append('status', filters.status);

      const response = await apiClient.get<KehadiranApiResponse>(
        `${this.getBasePath()}/user/${userId}?${params.toString()}`
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user kehadiran data:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get monthly attendance data with statistics and daily breakdown
   * Corresponds to: GET /kehadiran/monthly/filter
   */
  async getMonthlyAttendanceByFilter(filters: MonthlyAttendanceFilters = {}): Promise<MonthlyAttendanceApiResponse> {
    try {
      const params = new URLSearchParams();
      
      // Add date filters (default to current month/year if not provided)
      const currentDate = new Date();
      const year = filters.year || currentDate.getFullYear();
      const month = filters.month || (currentDate.getMonth() + 1);
      
      params.append('year', year.toString());
      params.append('month', month.toString());
      
      // Add optional filters
      if (filters.satker) params.append('satker', filters.satker);
      if (filters.bidang) params.append('bidang', filters.bidang);
      if (filters.user_id) params.append('user_id', filters.user_id);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get<MonthlyAttendanceApiResponse>(
        `${this.getBasePath()}/monthly/filter?${params.toString()}`
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching monthly attendance data:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Export daily attendance report
   * Corresponds to: GET /kehadiran/export/harian
   */
  async exportPresensiHarian(filters: ExportFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      if (filters.tanggal) params.append('tanggal', filters.tanggal);
      if (filters.lokasi_id) params.append('lokasi_id', filters.lokasi_id);
      if (filters.satker) params.append('satker', filters.satker);
      if (filters.bidang) params.append('bidang', filters.bidang);
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);

      const response = await apiClient.get(
        `${this.getBasePath()}/export/harian?${params.toString()}`,
        {
          responseType: 'blob',
          headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        }
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Error exporting daily attendance:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Export monthly attendance report
   * Corresponds to: GET /kehadiran/export/bulanan
   */
  async exportPresensiBulanan(filters: ExportFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      if (filters.month) params.append('month', filters.month.toString());
      if (filters.year) params.append('year', filters.year.toString());
      if (filters.satker) params.append('satker', filters.satker);
      if (filters.bidang) params.append('bidang', filters.bidang);
      if (filters.user_id) params.append('user_id', filters.user_id);

      const response = await apiClient.get(
        `${this.getBasePath()}/export/bulanan?${params.toString()}`,
        {
          responseType: 'blob',
          headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        }
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Error exporting monthly attendance:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Download exported file
   */
  downloadFile(blob: Blob, filename: string): void {
    try {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error('Gagal mengunduh file');
    }
  }

  /**
   * Export daily attendance and trigger download
   */
  async exportAndDownloadHarian(filters: ExportFilters): Promise<void> {
    try {
      const blob = await this.exportPresensiHarian(filters);
      
      // Create more descriptive filename with filters
      let filenameParts = ['presensi-harian'];
      if (filters.tanggal) filenameParts.push(filters.tanggal);
      if (filters.lokasi_id) filenameParts.push(`lokasi-${filters.lokasi_id}`);
      if (filters.status) filenameParts.push(`status-${filters.status}`);
      
      const filename = `${filenameParts.join('-')}.xlsx`;
      this.downloadFile(blob, filename);
    } catch (error) {
      console.error('Error exporting and downloading daily attendance:', error);
      throw error;
    }
  }

  /**
   * Export monthly attendance and trigger download
   */
  async exportAndDownloadBulanan(filters: ExportFilters): Promise<void> {
    try {
      const blob = await this.exportPresensiBulanan(filters);
      
      // Create more descriptive filename with filters
      const month = filters.month || new Date().getMonth() + 1;
      const year = filters.year || new Date().getFullYear();
      
      let filenameParts = ['presensi-bulanan', `${month.toString().padStart(2, '0')}-${year}`];
      if (filters.lokasi_id) filenameParts.push(`lokasi-${filters.lokasi_id}`);
      if (filters.user_id) filenameParts.push(`user-${filters.user_id}`);
      
      const filename = `${filenameParts.join('-')}.xlsx`;
      this.downloadFile(blob, filename);
    } catch (error) {
      console.error('Error exporting and downloading monthly attendance:', error);
      throw error;
    }
  }

  /**
   * Handle API errors and convert to user-friendly messages
   */
  private handleApiError(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      const statusCode = error.response.status;
      const message = error.response.data?.error || error.response.data?.message || 'Terjadi kesalahan pada server';
      
      return {
        error: message,
        statusCode,
        message: this.getErrorMessage(statusCode, message)
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        error: 'Network error',
        message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
      };
    } else {
      // Something else happened
      return {
        error: error.message || 'Unknown error',
        message: 'Terjadi kesalahan yang tidak diketahui'
      };
    }
  }

  /**
   * Get user-friendly error messages based on status code
   */
  private getErrorMessage(statusCode: number, originalMessage: string): string {
    switch (statusCode) {
      case 400:
        return 'Permintaan tidak valid. Periksa kembali data yang dikirim.';
      case 401:
        return 'Sesi Anda telah berakhir. Silakan login kembali.';
      case 403:
        return 'Anda tidak memiliki akses untuk melakukan operasi ini.';
      case 404:
        return 'Data kehadiran tidak ditemukan.';
      case 500:
        return 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
      default:
        return originalMessage || 'Terjadi kesalahan yang tidak diketahui.';
    }
  }

  /**
   * Helper method to format date for API calls
   */
  formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Helper method to get current month filters
   */
  getCurrentMonthFilters(): MonthlyAttendanceFilters {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1
    };
  }

  /**
   * Helper method to get date range for current month
   */
  getCurrentMonthDateRange(): { startDate: string; endDate: string } {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    return {
      startDate: this.formatDateForApi(startDate),
      endDate: this.formatDateForApi(endDate)
    };
  }
}

// Export singleton instance
export const presensiApi = new PresensiApiService();
export default presensiApi;
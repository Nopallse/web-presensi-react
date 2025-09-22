import { ApiService } from '../../../services/apiService';
import { useAuthStore } from '../../../store/authStore';
import type { 
  DeviceResetResponse, 
  DeviceResetFilters,
  UpdateDeviceResetStatusRequest,
  UpdateDeviceResetStatusResponse 
} from '../types';

class DeviceResetApiService extends ApiService {
  private getBasePath() {
    const user = useAuthStore.getState().user;
    return user?.role === 'super_admin' ? '/superadmin' : '/admin';
  }

  async getAllResetRequests(filters: DeviceResetFilters = {}): Promise<DeviceResetResponse> {
    const { status, page = 1, limit = 10 } = filters;
    const basePath = this.getBasePath();
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) {
      params.append('status', status);
    }

    const response = await this.get<DeviceResetResponse>(
      `${basePath}/device-reset/requests?${params.toString()}`
    );
    
    return response.data;
  }

  async updateResetRequestStatus(
    id: number, 
    request: UpdateDeviceResetStatusRequest
  ): Promise<UpdateDeviceResetStatusResponse> {
    const basePath = this.getBasePath();
    
    const response = await this.put<UpdateDeviceResetStatusResponse>(
      `${basePath}/device-reset/requests/${id}`,
      request
    );
    
    return response.data;
  }

  async approveResetRequest(id: number, adminResponse?: string): Promise<UpdateDeviceResetStatusResponse> {
    return this.updateResetRequestStatus(id, {
      status: 'approved',
      admin_response: adminResponse
    });
  }

  async rejectResetRequest(id: number, adminResponse: string): Promise<UpdateDeviceResetStatusResponse> {
    return this.updateResetRequestStatus(id, {
      status: 'rejected',
      admin_response: adminResponse
    });
  }
}

export const deviceResetApi = new DeviceResetApiService();

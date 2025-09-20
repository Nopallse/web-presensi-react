import axios from 'axios';

// Create axios instance
export const apiClient = axios.create({
  baseURL: 'https://api.pariamankota.my.id/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Basic API service class
export class ApiService {
  private client = apiClient;

  async get<T>(url: string, config?: any): Promise<{ data: T }> {
    const response = await this.client.get<T>(url, config);
    return response;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<{ data: T }> {
    const response = await this.client.post<T>(url, data, config);
    return response;
  }

  async put<T>(url: string, data?: any, config?: any): Promise<{ data: T }> {
    const response = await this.client.put<T>(url, data, config);
    return response;
  }

  async delete<T>(url: string, config?: any): Promise<{ data: T }> {
    const response = await this.client.delete<T>(url, config);
    return response;
  }
}

export const apiService = new ApiService();
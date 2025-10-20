import { useState, useEffect, useCallback } from 'react';
import { dashboardApi, type SuperAdminDashboardData } from '../services/dashboardApi';

export const useSuperAdminDashboard = () => {
  const [data, setData] = useState<SuperAdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await dashboardApi.getSuperAdminDashboard();
      setData(result);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Gagal mengambil data dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Auto refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};

export const useKehadiranList = (page = 1, limit = 10) => {
  const [data, setData] = useState<SuperAdminDashboardData['kehadiranList'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await dashboardApi.getKehadiranList(page, limit);
      setData(result);
    } catch (err: any) {
      console.error('Error fetching kehadiran data:', err);
      setError(err.message || 'Gagal mengambil data kehadiran');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};
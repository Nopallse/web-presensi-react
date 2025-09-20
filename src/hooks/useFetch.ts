import { useState, useEffect } from 'react';
import { useToasts } from '../store/uiStore';

interface UseFetchOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: any;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
}

export function useFetch<T = any>(
  fetchFunction: () => Promise<T>,
  options: UseFetchOptions = {}
): UseFetchResult<T> {
  const { immediate = true, onSuccess, onError } = options;
  const { showToast } = useToasts();
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchFunction();
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err: any) {
      setError(err);
      
      if (onError) {
        onError(err);
      } else {
        // Default error handling
        const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan';
        showToast({
          message: errorMessage,
          type: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const mutate = (newData: T) => {
    setData(newData);
  };

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutate
  };
}

// Hook for mutations (POST, PUT, DELETE)
interface UseMutationOptions<TVariables, TData> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: any, variables: TVariables) => void;
  onSettled?: (data: TData | null, error: any, variables: TVariables) => void;
}

interface UseMutationResult<TVariables, TData> {
  mutate: (variables: TVariables) => Promise<TData>;
  loading: boolean;
  error: any;
  data: TData | null;
}

export function useMutation<TVariables = any, TData = any>(
  mutationFunction: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TVariables, TData> = {}
): UseMutationResult<TVariables, TData> {
  const { onSuccess, onError, onSettled } = options;
  const { showToast } = useToasts();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutate = async (variables: TVariables): Promise<TData> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await mutationFunction(variables);
      setData(result);
      
      if (onSuccess) {
        onSuccess(result, variables);
      }
      
      return result;
    } catch (err: any) {
      setError(err);
      
      if (onError) {
        onError(err, variables);
      } else {
        // Default error handling
        const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan';
        showToast({
          message: errorMessage,
          type: 'error'
        });
      }
      
      throw err;
    } finally {
      setLoading(false);
      
      if (onSettled) {
        onSettled(data, error, variables);
      }
    }
  };

  return {
    mutate,
    loading,
    error,
    data
  };
}
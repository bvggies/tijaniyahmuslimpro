import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

export interface Wazifa {
  id: string;
  title: string;
  description?: string;
  target?: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Lazim {
  id: string;
  title: string;
  description?: string;
  frequency: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useWazifas = () => {
  return useQuery({
    queryKey: ['wazifa'],
    queryFn: async () => {
      return apiClient.get<{ wazifas: Wazifa[] }>('/api/wazifa');
    },
    select: (data) => data.wazifas || [],
  });
};

export const useCreateWazifa = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; target?: number }) => {
      return apiClient.post<{ wazifa: Wazifa }>('/api/wazifa', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wazifa'] });
    },
  });
};

export const useUpdateWazifa = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      return apiClient.patch<{ wazifa: Wazifa }>('/api/wazifa', { id, completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wazifa'] });
    },
  });
};

export const useLazims = () => {
  return useQuery({
    queryKey: ['lazim'],
    queryFn: async () => {
      return apiClient.get<{ lazims: Lazim[] }>('/api/lazim');
    },
    select: (data) => data.lazims || [],
  });
};

export const useCreateLazim = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; frequency: string }) => {
      return apiClient.post<{ lazim: Lazim }>('/api/lazim', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lazim'] });
    },
  });
};

export const useUpdateLazim = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      return apiClient.patch<{ lazim: Lazim }>('/api/lazim', { id, completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lazim'] });
    },
  });
};


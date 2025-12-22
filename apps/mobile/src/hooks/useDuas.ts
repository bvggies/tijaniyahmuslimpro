import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

export interface DuaCategory {
  id: string;
  name: string;
  icon?: string;
}

export interface Dua {
  id: string;
  title: string;
  arabic: string;
  transliteration?: string;
  translation: string;
  reference?: string;
  categoryId: string;
  isFavorite?: boolean;
}

export const useDuaCategories = () => {
  return useQuery({
    queryKey: ['duas', 'categories'],
    queryFn: async () => {
      return apiClient.get<{ categories: DuaCategory[] }>('/api/tijaniyah-duas?categories=true');
    },
    select: (data) => data.categories || [],
  });
};

export const useDuas = (categoryId?: string) => {
  return useQuery({
    queryKey: ['duas', categoryId || 'all'],
    queryFn: async () => {
      const url = categoryId
        ? `/api/tijaniyah-duas?categoryId=${categoryId}`
        : '/api/tijaniyah-duas';
      return apiClient.get<{ duas: Dua[] }>(url);
    },
    select: (data) => data.duas || [],
  });
};

export const useDua = (duaId: string) => {
  return useQuery({
    queryKey: ['duas', duaId],
    queryFn: async () => {
      return apiClient.get<{ dua: Dua }>(`/api/tijaniyah-duas/${duaId}`);
    },
    select: (data) => data.dua,
  });
};


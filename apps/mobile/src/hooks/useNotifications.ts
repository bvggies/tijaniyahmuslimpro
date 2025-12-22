import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

interface ApiNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const useNotifications = () => {
  return useQuery<Notification[], Error>({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{ notifications: ApiNotification[] }>('/api/notifications');
        
        if (!response || !response.notifications) {
          return [];
        }
        
        return response.notifications.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: (n.type || 'info') as 'info' | 'success' | 'warning' | 'error',
          isRead: n.isRead || false,
          createdAt: n.createdAt,
        }));
      } catch (error: any) {
        if (error?.message === 'Network request failed.') {
          return [];
        }
        if (__DEV__) {
          console.warn('Failed to fetch notifications:', error?.message || error);
        }
        return [];
      }
    },
    retry: (failureCount, error) => {
      if (
        error?.message?.includes('401') ||
        error?.message?.includes('403') ||
        error?.message?.includes('Network request failed')
      ) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
    staleTime: 30000,
    throwOnError: false,
  });
};

export const useUnreadCount = () => {
  const { data: notifications } = useNotifications();
  return notifications?.filter((n) => !n.isRead).length || 0;
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      return apiClient.put<{ success: boolean }>('/api/notifications', { notificationId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { data: notifications } = useNotifications();
  
  return useMutation({
    mutationFn: async () => {
      if (!notifications) return;
      
      const unreadNotifications = notifications.filter((n) => !n.isRead);
      const promises = unreadNotifications.map((n) =>
        apiClient.put<{ success: boolean }>('/api/notifications', { notificationId: n.id })
      );
      
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};


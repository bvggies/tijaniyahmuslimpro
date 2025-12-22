import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useEvents = () => {
  return useQuery<Event[], Error>({
    queryKey: ['events'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{ events: Event[] }>('/api/events');
        return response.events || [];
      } catch (error: any) {
        if (error?.message === 'Network request failed.') {
          return [];
        }
        if (__DEV__) {
          console.warn('Failed to fetch events:', error?.message || error);
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
    staleTime: 60000, // 1 minute
    throwOnError: false,
  });
};

export const useUpcomingEvents = () => {
  const { data: events = [] } = useEvents();
  const now = new Date();
  
  return events.filter((event) => {
    const startDate = new Date(event.startDate);
    return startDate >= now && event.isActive;
  }).sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return dateA.getTime() - dateB.getTime();
  });
};

export const usePastEvents = () => {
  const { data: events = [] } = useEvents();
  const now = new Date();
  
  return events.filter((event) => {
    const endDate = event.endDate ? new Date(event.endDate) : new Date(event.startDate);
    return endDate < now && event.isActive;
  }).sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return dateB.getTime() - dateA.getTime();
  });
};

export const useCurrentEvents = () => {
  const { data: events = [] } = useEvents();
  const now = new Date();
  
  return events.filter((event) => {
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : startDate;
    return startDate <= now && endDate >= now && event.isActive;
  }).sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return dateA.getTime() - dateB.getTime();
  });
};


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  mood?: string;
  createdAt: string;
  updatedAt: string;
}

export const useJournalEntries = () => {
  return useQuery({
    queryKey: ['journal', 'entries'],
    queryFn: async () => {
      return apiClient.get<{ entries: JournalEntry[] }>('/api/journal-entries');
    },
    select: (data) => data.entries || [],
  });
};

export const useCreateJournalEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      return apiClient.post<{ entry: JournalEntry }>('/api/journal-entries', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal', 'entries'] });
    },
  });
};

export const useUpdateJournalEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title: string; content: string }) => {
      return apiClient.patch<{ entry: JournalEntry }>(`/api/journal-entries/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal', 'entries'] });
    },
  });
};

export const useDeleteJournalEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/api/journal-entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal', 'entries'] });
    },
  });
};


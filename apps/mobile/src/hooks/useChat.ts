import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

export interface ChatRoom {
  id: string;
  name: string;
  isGroup: boolean;
  recipient?: {
    id: string;
    name: string;
    email: string;
  };
  lastMessage?: {
    content: string;
    timestamp: string;
    author?: {
      id: string;
      name: string;
    };
  };
  unreadCount: number;
}

export interface Message {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
}

export const useChatRooms = () => {
  return useQuery({
    queryKey: ['chat', 'rooms'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{ rooms: ChatRoom[] }>('/api/chat-rooms');
        return response.rooms || [];
      } catch (error) {
        console.error('Failed to fetch chat rooms:', error);
        return [];
      }
    },
    staleTime: 0, // Always refetch
    retry: 1,
  });
};

export const useChatMessages = (roomId: string) => {
  return useQuery({
    queryKey: ['chat', 'rooms', roomId, 'messages'],
    queryFn: async () => {
      return apiClient.get<{ messages: Message[] }>(`/api/chat-messages?roomId=${roomId}`);
    },
    select: (data) => data.messages || [],
    enabled: !!roomId,
    refetchInterval: 5000, // Poll every 5 seconds
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ roomId, content }: { roomId: string; content: string }) => {
      return apiClient.post<{ message: Message }>('/api/chat-messages', { roomId, content });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'rooms', variables.roomId, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] });
    },
  });
};


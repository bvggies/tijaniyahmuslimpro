import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, AuthResponse } from '../services/authService';
import * as SecureStore from 'expo-secure-store';

export const useCurrentUser = () => {
  return useQuery<AuthResponse['user'] | null>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        // Check if user has a token first
        const token = await SecureStore.getItemAsync('accessToken');
        if (!token) {
          return null;
        }
        const user = await authService.getCurrentUser();
        console.log('Current user fetched:', JSON.stringify(user, null, 2)); // Debug log
        if (!user || !user.name || !user.email) {
          console.warn('User data incomplete:', user);
        }
        return user;
      } catch (error: any) {
        // If unauthenticated or error, treat as guest
        console.error('Failed to get current user:', error?.response?.data || error?.message || error);
        return null;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      return authService.updateProfile(data);
    },
    onSuccess: (updatedUser) => {
      // Update the cache with the new user data
      queryClient.setQueryData(['auth', 'me'], updatedUser);
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
};



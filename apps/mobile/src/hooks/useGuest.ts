import { useQuery } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

/**
 * Hook to check if user is in guest mode
 */
export const useIsGuest = () => {
  return useQuery({
    queryKey: ['auth', 'isGuest'],
    queryFn: async () => {
      const guestMode = await SecureStore.getItemAsync('guestMode');
      const token = await SecureStore.getItemAsync('accessToken');
      return guestMode === 'true' || !token;
    },
    staleTime: 0, // Always check fresh
  });
};


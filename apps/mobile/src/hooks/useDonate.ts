import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

export interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  imageUrl?: string;
  endDate?: string;
}

export interface Donation {
  id: string;
  campaignId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export const useCampaigns = () => {
  return useQuery({
    queryKey: ['donate', 'campaigns'],
    queryFn: async () => {
      return apiClient.get<{ campaigns: Campaign[] }>('/api/campaigns');
    },
    select: (data) => data.campaigns || [],
  });
};

export const useCreateDonation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { campaignId: string; amount: number }) => {
      // Record as "pledge" if payment not integrated
      return apiClient.post<{ donation: Donation }>('/api/donations', {
        ...data,
        status: 'pending',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donate', 'campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['donate', 'history'] });
    },
  });
};

export const useDonationHistory = () => {
  return useQuery({
    queryKey: ['donate', 'history'],
    queryFn: async () => {
      return apiClient.get<{ donations: Donation[] }>('/api/donations');
    },
    select: (data) => data.donations || [],
  });
};


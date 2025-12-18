import { useQuery } from '@tanstack/react-query';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

interface CampaignDto {
  id: string;
  title: string;
  description: string;
  goalAmount?: number | null;
  isActive: boolean;
}

export function DonateScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/campaigns`);
      if (!res.ok) throw new Error('Failed to load campaigns');
      return (await res.json()) as { campaigns: CampaignDto[] };
    },
  });

  return (
    <ScrollView className="flex-1 bg-islamic-linear">
      <View className="absolute inset-0 bg-islamic-radial opacity-80" />
      <View className="relative px-5 pt-12 pb-16">
        <Text className="text-3xl font-semibold text-white mb-2">Donate</Text>
        <Text className="text-xs text-emerald-100/80 mb-4">
          Support Tijaniyah projects and campaigns with full transparency.
        </Text>
        {isLoading && (
          <Text className="text-xs text-emerald-100/80 mb-2">Loading campaigns…</Text>
        )}
        {data?.campaigns?.map(c => (
          <View
            key={c.id}
            className="mb-3 rounded-2xl bg-black/40 border border-emerald-400/20 px-4 py-3"
          >
            <Text className="text-sm text-emerald-50 font-semibold mb-1">{c.title}</Text>
            <Text className="text-xs text-emerald-100/80 mb-2">{c.description}</Text>
            {typeof c.goalAmount === 'number' && (
              <Text className="text-[11px] text-emerald-100/70 mb-2">
                Goal: {c.goalAmount.toLocaleString()} (local currency)
              </Text>
            )}
            <TouchableOpacity className="self-start rounded-xl bg-emerald-400 px-3 py-1">
              <Text className="text-[11px] font-semibold text-slate-950">View details</Text>
            </TouchableOpacity>
          </View>
        ))}
        {!isLoading && !data?.campaigns?.length && (
          <Text className="text-xs text-emerald-100/70">
            No active campaigns right now. Please check back soon.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}




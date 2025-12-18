import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://tijaniyahmuslimpro-admin-mu.vercel.app';

interface WazifaDto {
  id: string;
  title: string;
  description?: string | null;
  target?: number | null;
  completed: boolean;
}

interface LazimDto {
  id: string;
  title: string;
  description?: string | null;
  frequency: string;
  completed: boolean;
}

export function WazifaLazimScreen() {
  const queryClient = useQueryClient();

  const { data: wazifaData } = useQuery({
    queryKey: ['wazifa'],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/wazifa`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error('Failed to load wazifa');
      return (await res.json()) as { wazifas: WazifaDto[] };
    },
  });

  const { data: lazimData } = useQuery({
    queryKey: ['lazim'],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/lazim`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error('Failed to load lazim');
      return (await res.json()) as { lazims: LazimDto[] };
    },
  });

  const toggleWazifa = useMutation({
    mutationFn: async (id: string) => {
      const token = await SecureStore.getItemAsync('accessToken');
      const current = wazifaData?.wazifas.find(w => w.id === id);
      if (!current) return;
      const res = await fetch(`${API_BASE_URL}/api/wazifa`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id, completed: !current.completed }),
      });
      if (!res.ok) throw new Error('Failed to update wazifa');
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['wazifa'] });
    },
  });

  const toggleLazim = useMutation({
    mutationFn: async (id: string) => {
      const token = await SecureStore.getItemAsync('accessToken');
      const current = lazimData?.lazims.find(l => l.id === id);
      if (!current) return;
      const res = await fetch(`${API_BASE_URL}/api/lazim`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id, completed: !current.completed }),
      });
      if (!res.ok) throw new Error('Failed to update lazim');
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['lazim'] });
    },
  });

  return (
    <ScrollView className="flex-1 bg-islamic-linear">
      <View className="absolute inset-0 bg-islamic-radial opacity-80" />
      <View className="relative px-5 pt-12 pb-16">
        <Text className="text-3xl font-semibold text-white mb-2">Wazifa & Lazim</Text>
        <Text className="text-xs text-emerald-100/80 mb-4">
          Track your daily Tijaniyah Wazifa and Lazim commitments.
        </Text>
        <Text className="text-xs text-emerald-100/80 mb-2">Wazifa</Text>
        {(wazifaData?.wazifas ?? []).map(w => (
          <TouchableOpacity
            key={w.id}
            onPress={() => toggleWazifa.mutate(w.id)}
            className="mb-3 rounded-2xl bg-black/40 border border-emerald-400/20 px-4 py-3"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-emerald-50 font-semibold">{w.title}</Text>
              <Text className="text-[11px] text-emerald-100/80">
                {w.completed ? 'Completed' : 'Pending'}
              </Text>
            </View>
            {w.description && (
              <Text className="text-[11px] text-emerald-100/80 mt-1">{w.description}</Text>
            )}
          </TouchableOpacity>
        ))}
        {!wazifaData?.wazifas?.length && (
          <Text className="text-[11px] text-emerald-100/70 mb-4">
            No wazifa entries yet. Create them via the admin dashboard.
          </Text>
        )}
        <Text className="text-xs text-emerald-100/80 mb-2 mt-4">Lazim</Text>
        {(lazimData?.lazims ?? []).map(l => (
          <TouchableOpacity
            key={l.id}
            onPress={() => toggleLazim.mutate(l.id)}
            className="mb-3 rounded-2xl bg-black/40 border border-emerald-400/20 px-4 py-3"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-emerald-50 font-semibold">{l.title}</Text>
              <Text className="text-[11px] text-emerald-100/80">
                {l.completed ? 'Completed' : 'Pending'}
              </Text>
            </View>
            <Text className="text-[11px] text-emerald-100/80 mt-1">
              {l.frequency}
              {l.description ? ` • ${l.description}` : ''}
            </Text>
          </TouchableOpacity>
        ))}
        {!lazimData?.lazims?.length && (
          <Text className="text-[11px] text-emerald-100/70">
            No lazim entries yet. Create them via the admin dashboard.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}




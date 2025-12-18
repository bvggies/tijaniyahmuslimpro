import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

interface TasbihSessionDto {
  id: string;
  phrase: string;
  target?: number | null;
  count: number;
}

export function TasbihScreen() {
  const [phrase, setPhrase] = useState('SubḥānAllāh');
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['tasbihSession'],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/tasbih-session`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error('Failed to load session');
      return (await res.json()) as { session: TasbihSessionDto };
    },
  });

  const increment = useMutation({
    mutationFn: async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/tasbih-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ phrase }),
      });
      if (!res.ok) throw new Error('Failed to increment');
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasbihSession'] });
    },
  });

  const session = data?.session;

  return (
    <ScrollView className="flex-1 bg-islamic-linear">
      <View className="absolute inset-0 bg-islamic-radial opacity-80" />
      <View className="relative px-5 pt-12 pb-16 items-center">
        <Text className="text-3xl font-semibold text-white mb-2">Digital Tasbih</Text>
        <Text className="text-xs text-emerald-100/80 mb-6">
          Tap to count in silence. Your last session is saved to your account.
        </Text>
        <View className="mb-6 items-center">
          <Text className="text-sm text-emerald-100/90 mb-1">
            {session?.phrase ?? phrase}
          </Text>
          <Text className="text-6xl text-emerald-200 font-semibold mb-2">
            {session?.count ?? 0}
          </Text>
          {session?.target ? (
            <Text className="text-xs text-emerald-100/70">
              Target {session.target} · Remaining {Math.max(session.target - session.count, 0)}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          onPress={() => increment.mutate()}
          className="h-40 w-40 rounded-full bg-black/40 border border-emerald-400/40 items-center justify-center shadow-soft"
        >
          <Text className="text-emerald-100/90">Tap</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}




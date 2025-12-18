import { useQuery } from '@tanstack/react-query';
import { View, Text, ScrollView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useI18n } from '../i18n';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

interface TijaniyahDuaDto {
  id: string;
  title: string;
  arabic: string;
  translation: string;
  reference?: string | null;
}

export function TijaniyahDuasScreen() {
  const { t } = useI18n();

  const { data, isLoading } = useQuery({
    queryKey: ['tijaniyahDuas'],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/tijaniyah-duas`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error('Failed to load Tijaniyah duas');
      return (await res.json()) as { duas: TijaniyahDuaDto[] };
    },
  });

  return (
    <ScrollView className="flex-1 bg-islamic-linear">
      <View className="absolute inset-0 bg-islamic-radial opacity-80" />
      <View className="relative px-5 pt-12 pb-16">
        <Text className="text-3xl font-semibold text-white mb-2">Dua of Tijaniyyah</Text>
        <Text className="text-xs text-emerald-100/80 mb-4">
          Core supplications of the Tijani path, including Khatmul Wazifa and Rābil ʿIbādi.
        </Text>
        {isLoading && (
          <Text className="text-xs text-emerald-100/70 mb-2">
            {t('home_notifications_on')}
          </Text>
        )}
        {data?.duas?.map(dua => (
          <View
            key={dua.id}
            className="mb-4 rounded-2xl bg-black/40 border border-emerald-400/20 px-4 py-3"
          >
            <Text className="text-sm text-emerald-50 font-semibold mb-1">
              {dua.title}
            </Text>
            <Text className="text-xs text-emerald-100/90 mb-2 leading-relaxed">
              {dua.arabic}
            </Text>
            <Text className="text-[11px] text-emerald-100/80">{dua.translation}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}




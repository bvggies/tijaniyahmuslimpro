import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://tijaniyahmuslimpro-admin-mu.vercel.app';

interface MosqueDto {
  id: string;
  name: string;
  address?: string;
  lat: number;
  lng: number;
}

export function MosqueLocatorScreen() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    const ask = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionError('Location permission is required to find nearby mosques.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    };
    void ask();
  }, []);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['mosquesNearby', coords],
    queryFn: async () => {
      if (!coords) throw new Error('No coordinates yet');
      const res = await fetch(
        `${API_BASE_URL}/api/mosques-nearby?lat=${coords.lat}&lng=${coords.lng}`,
      );
      if (!res.ok) throw new Error('Failed to load mosques');
      return (await res.json()) as { mosques: MosqueDto[] };
    },
    enabled: !!coords,
  });

  return (
    <ScrollView className="flex-1 bg-islamic-linear">
      <View className="absolute inset-0 bg-islamic-radial opacity-80" />
      <View className="relative px-5 pt-12 pb-16">
        <Text className="text-3xl font-semibold text-white mb-2">Mosque locator</Text>
        <Text className="text-xs text-emerald-100/80 mb-4">
          Find nearby masājid using your current location.
        </Text>
        {permissionError && (
          <Text className="text-xs text-red-300 mb-3">{permissionError}</Text>
        )}
        <TouchableOpacity
          onPress={() => refetch()}
          className="mb-3 self-start rounded-xl border border-emerald-400/40 bg-black/40 px-3 py-1"
        >
          <Text className="text-[11px] text-emerald-100/90">
            {isLoading ? 'Searching…' : 'Refresh list'}
          </Text>
        </TouchableOpacity>
        {data?.mosques?.map(m => (
          <View
            key={m.id}
            className="mb-3 rounded-2xl bg-black/40 border border-emerald-400/20 px-4 py-3"
          >
            <Text className="text-sm text-emerald-50 font-semibold mb-1">{m.name}</Text>
            {m.address && (
              <Text className="text-xs text-emerald-100/80 mb-1">{m.address}</Text>
            )}
            <Text className="text-[11px] text-emerald-100/70">
              ({m.lat.toFixed(3)}, {m.lng.toFixed(3)})
            </Text>
          </View>
        ))}
        {!isLoading && !data?.mosques?.length && (
          <Text className="text-xs text-emerald-100/70 mt-2">
            No mosques found nearby yet. Try refreshing or checking a different area.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}




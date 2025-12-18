import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { useI18n } from './i18n';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://tijaniyahmuslimpro-admin-mu.vercel.app';

interface PrayerSettingsDto {
  calculationMethod: string;
  madhab: string;
  latitudeAdjustment: string;
  notificationsOn: boolean;
}

interface PrayerTimingsDto {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export function PrayerScreen() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    const ask = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionError('Location permission is required to calculate prayer times.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    };
    void ask();
  }, []);

  const { data: settingsData } = useQuery({
    queryKey: ['prayerSettings'],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/prayer-settings`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error('Failed to load settings');
      return (await res.json()) as { settings: PrayerSettingsDto };
    },
  });

  const { data: timingsData } = useQuery({
    queryKey: ['prayerTimes', coords],
    queryFn: async () => {
      if (!coords) throw new Error('No coordinates');
      const res = await fetch(
        `${API_BASE_URL}/api/prayer-times?lat=${coords.lat}&lng=${coords.lng}`,
      );
      if (!res.ok) throw new Error('Failed to load prayer times');
      return (await res.json()) as { timings: PrayerTimingsDto };
    },
    enabled: !!coords,
  });

  const toggleNotifications = useMutation({
    mutationFn: async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      const current = settingsData?.settings;
      if (!current) return;
      const res = await fetch(`${API_BASE_URL}/api/prayer-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...current,
          notificationsOn: !current.notificationsOn,
        }),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['prayerSettings'] });
    },
  });

  const settings = settingsData?.settings;
  const timings = timingsData?.timings;

  const entries: { key: keyof PrayerTimingsDto; label: string }[] = [
    { key: 'Fajr', label: 'Fajr' },
    { key: 'Dhuhr', label: 'Dhuhr' },
    { key: 'Asr', label: 'Asr' },
    { key: 'Maghrib', label: 'Maghrib' },
    { key: 'Isha', label: 'Isha' },
  ];

  return (
    <ScrollView className="flex-1 bg-islamic-linear">
      <View className="absolute inset-0 bg-islamic-radial opacity-80" />
      <View className="relative px-5 pt-12 pb-16">
        <Text className="text-3xl font-semibold text-white mb-2">{t('prayer_title')}</Text>
        <Text className="text-xs text-emerald-100/80 mb-6">{t('prayer_subtitle')}</Text>
        {permissionError && (
          <Text className="text-[11px] text-red-300 mb-2">{permissionError}</Text>
        )}
        {entries.map(entry => (
          <View
            key={entry.key}
            className="mb-3 rounded-2xl bg-black/40 border border-emerald-400/20 px-4 py-3 flex-row items-center justify-between"
          >
            <View>
              <Text className="text-sm text-white font-semibold">{entry.label}</Text>
              <Text className="text-xs text-emerald-100/70">
                {timings ? 'Based on your location' : 'Loading…'}
              </Text>
            </View>
            <Text className="text-base text-emerald-200 font-semibold">
              {timings ? timings[entry.key] : '--:--'}
            </Text>
          </View>
        ))}
        {settings && (
          <View className="mt-4 rounded-2xl bg-black/40 border border-emerald-400/20 px-4 py-3">
            <Text className="text-xs text-emerald-100/80 mb-1">{t('prayer_settings_header')}</Text>
            <Text className="text-[11px] text-emerald-100/70 mb-1">
              Method: {settings.calculationMethod} · Madhab: {settings.madhab}
            </Text>
            <Text className="text-[11px] text-emerald-100/70 mb-2">
              Latitude: {settings.latitudeAdjustment}
            </Text>
            <TouchableOpacity
              onPress={() => toggleNotifications.mutate()}
              className="self-start rounded-xl border border-emerald-400/40 px-3 py-1"
            >
              <Text className="text-[11px] text-emerald-100/90">
                {t('prayer_notifications')}: {settings.notificationsOn ? 'On' : 'Off'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}


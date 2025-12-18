import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useI18n } from './i18n';

export function HomeScreen() {
  const navigation = useNavigation();
  const { t } = useI18n();

  return (
    <ScrollView className="flex-1 bg-islamic-linear">
      <View className="absolute inset-0 bg-islamic-radial opacity-80" />
      <View className="relative px-5 pt-12 pb-20">
        {/* Greeting + next prayer hero */}
        <View className="mb-5">
          <Text className="text-sm text-emerald-100/80 mb-1">{t('home_greeting')}</Text>
          <Text className="text-3xl font-semibold text-white mb-4">{t('home_title')}</Text>
          <View className="rounded-3xl bg-black/50 border border-emerald-400/30 px-4 py-4 shadow-soft">
            <View className="flex-row items-center justify-between mb-2">
              <View>
                <Text className="text-xs text-emerald-100/80 mb-1">
                  {t('home_next_prayer')}
                </Text>
                <Text className="text-xl text-white font-semibold">Dhuhr • 1:15 PM</Text>
              </View>
              <View className="items-end">
                <Text className="text-[11px] text-emerald-100/80">
                  {t('prayer_title')}
                </Text>
                <Text className="text-[11px] text-emerald-100/70">
                  {t('home_notifications_on')}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-[11px] text-emerald-100/70">Fajr • 05:00</Text>
              <Text className="text-[11px] text-emerald-100/70">Asr • 16:30</Text>
              <Text className="text-[11px] text-emerald-100/70">Maghrib • 18:05</Text>
            </View>
          </View>
        </View>

        {/* Quick Tijaniyah actions row */}
        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity
            className="flex-1 rounded-3xl bg-emerald-400/15 border border-emerald-400/40 px-4 py-3"
            // @ts-expect-error - screen registered in parent stack
            onPress={() => navigation.navigate('WazifaLazim')}
          >
            <Text className="text-xs text-emerald-100/80 mb-1">{t('home_wird_title')}</Text>
            <Text className="text-sm text-white font-semibold mb-1">
              {t('home_wird_subtitle')}
            </Text>
            <Text className="text-[11px] text-emerald-100/70" numberOfLines={2}>
              {t('home_wird_body')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 rounded-3xl bg-emerald-400/15 border border-emerald-400/40 px-4 py-3"
            // @ts-expect-error - screen registered in parent stack
            onPress={() => navigation.navigate('TijaniyahDuas')}
          >
            <Text className="text-xs text-emerald-100/80 mb-1">{t('home_jumma_title')}</Text>
            <Text className="text-sm text-white font-semibold mb-1">Tijaniyah Duas</Text>
            <Text className="text-[11px] text-emerald-100/70" numberOfLines={2}>
              {t('home_jumma_body')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Second row: Tasbih + Mosque locator */}
        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity
            className="flex-1 rounded-3xl bg-black/45 border border-emerald-400/30 px-4 py-3"
            // @ts-expect-error - screen registered in parent stack
            onPress={() => navigation.navigate('Tasbih')}
          >
            <Text className="text-xs text-emerald-100/80 mb-1">{t('tasbih_title')}</Text>
            <Text className="text-sm text-white font-semibold mb-1">
              {t('tasbih_subtitle')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 rounded-3xl bg-black/45 border border-emerald-400/30 px-4 py-3"
            // @ts-expect-error - screen registered in parent stack
            onPress={() => navigation.navigate('Mosques')}
          >
            <Text className="text-xs text-emerald-100/80 mb-1">{t('mosques_title')}</Text>
            <Text className="text-sm text-white font-semibold mb-1">
              {t('mosques_subtitle')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI Noor highlight */}
        <TouchableOpacity
          className="rounded-3xl bg-black/50 border border-emerald-400/30 px-4 py-4 mt-1"
          // @ts-expect-error - screen registered in parent stack
          onPress={() => navigation.navigate('AiNoor')}
        >
          <Text className="text-xs text-emerald-100/80 mb-1">{t('home_ai_title')}</Text>
          <Text className="text-sm text-white font-semibold mb-1">{t('home_ai_subtitle')}</Text>
          <Text className="text-xs text-emerald-100/70 mb-2">{t('home_ai_body')}</Text>
          <Text className="text-[11px] text-emerald-200 underline">{t('home_ai_cta')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

import { View, Text, ScrollView } from 'react-native';

export function QuranScreen() {
  return (
    <ScrollView className="flex-1 bg-islamic-linear">
      <View className="absolute inset-0 bg-islamic-radial opacity-80" />
      <View className="relative px-5 pt-12 pb-16">
        <Text className="text-3xl font-semibold text-white mb-2">Qur&apos;an</Text>
        <Text className="text-xs text-emerald-100/80 mb-6">
          Read by Surah or Juz, add bookmarks, and follow your tilāwah journey.
        </Text>
        <View className="rounded-2xl bg-black/40 border border-emerald-400/20 px-4 py-3 mb-4">
          <Text className="text-xs text-emerald-100/80 mb-1">Quick access</Text>
          <Text className="text-sm text-white font-semibold mb-1">Last bookmark</Text>
          <Text className="text-xs text-emerald-100/70">Surah Al-Baqarah • Ayah 255 (sample)</Text>
        </View>
        <View className="rounded-2xl bg-black/40 border border-emerald-400/20 px-4 py-3">
          <Text className="text-xs text-emerald-100/80 mb-1">Tilāwah note</Text>
          <Text className="text-xs text-emerald-100/80">
            For production, this screen will fetch surah & juz metadata and support bookmarks & translations via the
            backend.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}



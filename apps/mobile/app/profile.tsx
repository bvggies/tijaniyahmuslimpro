import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export function ProfileScreen() {
  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('guestMode');
    // RootNavigator listens to auth changes and will swap to AuthStack automatically.
    // No need to reset navigation here; this avoids dev warnings about unhandled RESET actions.
  };

  return (
    <ScrollView className="flex-1 bg-islamic-linear">
      <View className="absolute inset-0 bg-islamic-radial opacity-80" />
      <View className="relative px-5 pt-12 pb-16">
        <Text className="text-3xl font-semibold text-white mb-2">Profile & settings</Text>
        <Text className="text-xs text-emerald-100/80 mb-6">
          Manage privacy, notifications, and your Tijaniyah journey.
        </Text>
        <View className="rounded-2xl bg-black/40 border border-emerald-400/20 px-4 py-3 mb-4">
          <Text className="text-sm text-white font-semibold mb-1">Privacy & security</Text>
          <Text className="text-xs text-emerald-100/80">
            Islamic journal entries are private and can be protected with a PIN in future releases.
          </Text>
        </View>
        <TouchableOpacity
          className="rounded-2xl border border-emerald-400/40 bg-black/40 py-3 items-center"
          onPress={handleLogout}
        >
          <Text className="text-emerald-100 font-semibold">Sign out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}



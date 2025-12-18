import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

interface JournalEntryDto {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export function JournalScreen() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const check = async () => {
      const stored = await SecureStore.getItemAsync('journalPin');
      if (!stored) {
        setUnlocked(true);
      }
    };
    void check();
  }, []);

  const { data } = useQuery({
    queryKey: ['journalEntries'],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/journal-entries`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error('Failed to load entries');
      return (await res.json()) as { entries: JournalEntryDto[] };
    },
    enabled: unlocked,
  });

  const createEntry = useMutation({
    mutationFn: async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/journal-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error('Failed to save entry');
      return res.json();
    },
    onSuccess: () => {
      setTitle('');
      setContent('');
      void queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
    },
  });

  const handleUnlock = async () => {
    const stored = await SecureStore.getItemAsync('journalPin');
    if (!stored) {
      if (pin.length < 4) {
        Alert.alert('PIN too short', 'Choose at least 4 digits.');
        return;
      }
      await SecureStore.setItemAsync('journalPin', pin);
      setUnlocked(true);
      setPin('');
      return;
    }
    if (stored !== pin) {
      Alert.alert('Incorrect PIN', 'The PIN you entered is not correct.');
      return;
    }
    setUnlocked(true);
    setPin('');
  };

  if (!unlocked) {
    return (
      <View className="flex-1 bg-islamic-linear">
        <View className="absolute inset-0 bg-islamic-radial opacity-80" />
        <View className="flex-1 justify-center px-8">
          <Text className="text-2xl font-semibold text-white mb-2">Journal lock</Text>
          <Text className="text-xs text-emerald-100/80 mb-4">
            Your Islamic reflections are private to this device. Protect them with a PIN.
          </Text>
          <TextInput
            value={pin}
            onChangeText={setPin}
            placeholder="Enter PIN"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            secureTextEntry
            className="rounded-2xl bg-black/50 border border-emerald-400/30 px-4 py-3 text-white mb-3"
          />
          <TouchableOpacity
            onPress={handleUnlock}
            className="rounded-2xl bg-emerald-400 py-3 items-center shadow-soft"
          >
            <Text className="text-slate-950 font-semibold">Unlock</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-islamic-linear">
      <View className="absolute inset-0 bg-islamic-radial opacity-80" />
      <View className="relative px-5 pt-12 pb-16">
        <Text className="text-3xl font-semibold text-white mb-2">Islamic Journal</Text>
        <Text className="text-xs text-emerald-100/80 mb-4">
          Capture reflections, lessons, and duʿā moments. Entries are synced to your account but PIN-locked on this
          device.
        </Text>
        <View className="rounded-2xl bg-black/40 border border-emerald-400/20 px-4 py-3 mb-4">
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor="#9CA3AF"
            className="text-xs text-emerald-50 mb-2"
          />
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Write your reflection…"
            placeholderTextColor="#9CA3AF"
            multiline
            className="text-xs text-emerald-50 mb-3"
          />
          <TouchableOpacity
            disabled={!title.trim() || !content.trim() || createEntry.isPending}
            onPress={() => createEntry.mutate()}
            className="self-end rounded-xl bg-emerald-400 px-4 py-2"
          >
            <Text className="text-[11px] font-semibold text-slate-950">
              {createEntry.isPending ? 'Saving…' : 'Save entry'}
            </Text>
          </TouchableOpacity>
        </View>
        {data?.entries?.map(entry => (
          <View
            key={entry.id}
            className="mb-3 rounded-2xl bg-black/40 border border-emerald-400/20 px-4 py-3"
          >
            <Text className="text-sm text-emerald-50 font-semibold mb-1">{entry.title}</Text>
            <Text className="text-[11px] text-emerald-100/70 mb-1">
              {new Date(entry.createdAt).toLocaleString()}
            </Text>
            <Text className="text-xs text-emerald-100/80">{entry.content}</Text>
          </View>
        ))}
        {!data?.entries?.length && (
          <Text className="text-xs text-emerald-100/70 mt-2">No entries yet. Start with today&apos;s reflection.</Text>
        )}
      </View>
    </ScrollView>
  );
}




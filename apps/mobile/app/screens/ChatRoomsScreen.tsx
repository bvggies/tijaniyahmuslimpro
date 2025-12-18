import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://tijaniyahmuslimpro-admin-mu.vercel.app';

interface ChatRoomDto {
  id: string;
  name: string;
  isGroup: boolean;
}

export function ChatRoomsScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['chatRooms'],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/chat-rooms`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error('Failed to load rooms');
      return (await res.json()) as { rooms: ChatRoomDto[] };
    },
  });

  const createRoom = useMutation({
    mutationFn: async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/chat-rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name, isGroup: true }),
      });
      if (!res.ok) throw new Error('Failed to create room');
      return res.json();
    },
    onSuccess: () => {
      setName('');
      void queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
  });

  return (
    <ScrollView className="flex-1 bg-islamic-linear">
      <View className="absolute inset-0 bg-islamic-radial opacity-80" />
      <View className="relative px-5 pt-12 pb-16">
        <Text className="text-3xl font-semibold text-white mb-2">Chat rooms</Text>
        <Text className="text-xs text-emerald-100/80 mb-4">
          Join Tijaniyah community rooms or create a new group chat.
        </Text>
        <View className="rounded-2xl bg-black/40 border border-emerald-400/20 px-4 py-3 mb-4">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="New room name"
            placeholderTextColor="#9CA3AF"
            className="text-xs text-emerald-50 mb-2"
          />
          <TouchableOpacity
            disabled={!name.trim() || createRoom.isPending}
            onPress={() => createRoom.mutate()}
            className="self-end rounded-xl bg-emerald-400 px-4 py-2"
          >
            <Text className="text-[11px] font-semibold text-slate-950">
              {createRoom.isPending ? 'Creating…' : 'Create room'}
            </Text>
          </TouchableOpacity>
        </View>
        {data?.rooms?.map(room => (
          <TouchableOpacity
            key={room.id}
            // @ts-expect-error - screen registered in parent stack
            onPress={() => navigation.navigate('ChatRoom', { roomId: room.id, name: room.name })}
            className="mb-3 rounded-2xl bg-black/40 border border-emerald-400/20 px-4 py-3"
          >
            <Text className="text-sm text-emerald-50 font-semibold mb-1">{room.name}</Text>
            <Text className="text-[11px] text-emerald-100/70">
              {room.isGroup ? 'Group chat' : 'Direct chat'}
            </Text>
          </TouchableOpacity>
        ))}
        {!data?.rooms?.length && (
          <Text className="text-xs text-emerald-100/70">
            No rooms yet. Create one to begin a Tijaniyah-focused conversation.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}




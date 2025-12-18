import { RouteProp, useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://tijaniyahmuslimpro-admin-mu.vercel.app';

type ChatRoomRoute = RouteProp<{ ChatRoom: { roomId: string; name: string } }, 'ChatRoom'>;

interface MessageDto {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string | null };
  isMine: boolean;
}

export function ChatRoomScreen() {
  const route = useRoute<ChatRoomRoute>();
  const { roomId, name } = route.params;
  const [text, setText] = useState('');
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['chatMessages', roomId],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/chat-messages?roomId=${roomId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error('Failed to load messages');
      return (await res.json()) as { messages: MessageDto[] };
    },
    refetchInterval: 4000,
  });

  const send = useMutation({
    mutationFn: async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/chat-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ roomId, content: text }),
      });
      if (!res.ok) throw new Error('Failed to send');
      return res.json();
    },
    onSuccess: () => {
      setText('');
      void queryClient.invalidateQueries({ queryKey: ['chatMessages', roomId] });
    },
  });

  return (
    <View className="flex-1 bg-islamic-linear">
      <View className="absolute inset-0 bg-islamic-radial opacity-80" />
      <View className="relative flex-1 px-5 pt-10 pb-4">
        <Text className="text-sm text-emerald-100/80 mb-1">Chat room</Text>
        <Text className="text-xl font-semibold text-white mb-4">{name}</Text>
        <ScrollView className="flex-1 mb-3">
          {data?.messages?.map(m => (
            <View
              key={m.id}
              className={`mb-2 max-w-[80%] rounded-2xl px-3 py-2 ${
                m.isMine
                  ? 'self-end bg-emerald-400 text-slate-950'
                  : 'self-start bg-black/40 border border-emerald-400/20'
              }`}
            >
              {!m.isMine && (
                <Text className="text-[10px] text-emerald-100/80 mb-1">
                  {m.sender.name || 'User'}
                </Text>
              )}
              <Text className={`text-xs ${m.isMine ? 'text-slate-950' : 'text-emerald-50'}`}>
                {m.content}
              </Text>
              <Text
                className={`mt-1 text-[9px] ${
                  m.isMine ? 'text-emerald-900' : 'text-emerald-100/60'
                }`}
              >
                {new Date(m.createdAt).toLocaleTimeString()}
              </Text>
            </View>
          ))}
        </ScrollView>
        <View className="flex-row items-center rounded-2xl bg-black/40 border border-emerald-400/30 px-3 py-2">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message…"
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-xs text-emerald-50"
          />
          <TouchableOpacity
            disabled={!text.trim() || send.isPending}
            onPress={() => send.mutate()}
            className="ml-2 rounded-xl bg-emerald-400 px-3 py-1"
          >
            <Text className="text-[11px] text-slate-950 font-semibold">Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}




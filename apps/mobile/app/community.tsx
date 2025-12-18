import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

interface FeedPost {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  author: { id: string; name: string | null };
  likeCount: number;
  commentCount: number;
  likedByViewer: boolean;
}

export function CommunityScreen() {
  const [composer, setComposer] = useState('');
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['communityFeed'],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/community-feed`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        throw new Error('Failed to load feed');
      }
      return (await res.json()) as { posts: FeedPost[] };
    },
  });

  const createPost = useMutation({
    mutationFn: async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/community-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: composer }),
      });
      if (!res.ok) throw new Error('Unable to post');
      return res.json();
    },
    onSuccess: () => {
      setComposer('');
      void queryClient.invalidateQueries({ queryKey: ['communityFeed'] });
    },
  });

  const toggleLike = useMutation({
    mutationFn: async (id: string) => {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/community-like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ postId: id }),
      });
      if (!res.ok) throw new Error('Unable to like');
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['communityFeed'] });
    },
  });

  return (
    <ScrollView className="flex-1 bg-islamic-linear">
      <View className="absolute inset-0 bg-islamic-radial opacity-80" />
      <View className="relative px-5 pt-12 pb-16">
        <Text className="text-3xl font-semibold text-white mb-2">Community</Text>
        <Text className="text-xs text-emerald-100/80 mb-6">
          A gentle feed for reflections, duas, and reminders — moderated to keep adab.
        </Text>

        <View className="mb-4 rounded-2xl bg-black/40 border border-emerald-400/20 px-4 py-3">
          <TextInput
            value={composer}
            onChangeText={setComposer}
            placeholder="Share a reflection or dua…"
            placeholderTextColor="#9CA3AF"
            multiline
            className="text-xs text-emerald-50 mb-2"
          />
          <TouchableOpacity
            disabled={!composer.trim() || createPost.isPending}
            onPress={() => createPost.mutate()}
            className="self-end rounded-xl bg-emerald-400 px-3 py-1"
          >
            <Text className="text-[11px] font-semibold text-slate-950">
              {createPost.isPending ? 'Posting…' : 'Post'}
            </Text>
          </TouchableOpacity>
        </View>

        {data?.posts?.map(post => (
          <View
            key={post.id}
            className="mb-3 rounded-2xl bg-black/40 border border-emerald-400/20 px-4 py-3"
          >
            <Text className="text-[11px] text-emerald-100/70 mb-1">
              {post.author.name || 'Anonymous'} ·{' '}
              {new Date(post.createdAt).toLocaleString()}
            </Text>
            <Text className="text-xs text-emerald-50 mb-2">{post.content}</Text>
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => toggleLike.mutate(post.id)}
                className="flex-row items-center"
              >
                <Text className="text-[11px] text-emerald-100/80">
                  {post.likedByViewer ? '♥' : '♡'} {post.likeCount}
                </Text>
              </TouchableOpacity>
              <Text className="text-[11px] text-emerald-100/60">
                {post.commentCount} comments
              </Text>
            </View>
          </View>
        ))}

        {!data?.posts?.length && (
          <View className="mt-6 rounded-2xl bg-black/30 border border-emerald-400/15 px-4 py-3">
            <Text className="text-xs text-emerald-100/80">
              No posts yet. Be the first to share a gentle reminder.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}


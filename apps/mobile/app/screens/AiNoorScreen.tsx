import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export function AiNoorScreen() {
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setAnswer(null);
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/ai-noor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAnswer(json.error ?? 'AI Noor is currently unavailable.');
        return;
      }
      setAnswer(json.answer);
      setDisclaimer(json.disclaimer);
    } catch {
      setAnswer('AI Noor is currently unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-islamic-linear">
      <View className="absolute inset-0 bg-islamic-radial opacity-80" />
      <View className="relative px-5 pt-12 pb-16">
        <Text className="text-3xl font-semibold text-white mb-2">AI Noor</Text>
        <Text className="text-xs text-emerald-100/80 mb-4">
          An assistive tool for general Islamic questions. It does not replace qualified scholarship.
        </Text>
        <View className="rounded-2xl bg-black/40 border border-emerald-400/20 px-4 py-3 mb-4">
          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Ask with adab, and verify with scholars…"
            placeholderTextColor="#9CA3AF"
            multiline
            className="text-xs text-emerald-50 mb-3"
          />
          <TouchableOpacity
            onPress={ask}
            disabled={loading || !prompt.trim()}
            className="self-end rounded-xl bg-emerald-400 px-4 py-2"
          >
            {loading ? (
              <ActivityIndicator color="#022203" size="small" />
            ) : (
              <Text className="text-[11px] font-semibold text-slate-950">Ask AI Noor</Text>
            )}
          </TouchableOpacity>
        </View>
        {answer && (
          <View className="rounded-2xl bg-black/40 border border-emerald-400/20 px-4 py-3">
            <Text className="text-xs text-emerald-50 mb-2">{answer}</Text>
            {disclaimer && (
              <Text className="text-[10px] text-emerald-100/70">{disclaimer}</Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}




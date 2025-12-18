import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { AuthStackParamList } from '../auth-stack';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export function SignInScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/auth-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        Alert.alert('Sign in failed', json.error ?? 'Please check your details');
        return;
      }
      await SecureStore.setItemAsync('accessToken', json.accessToken);
      await SecureStore.setItemAsync('refreshToken', json.refreshToken);
      // navigation will be replaced by root layout effect on token
      Alert.alert('Welcome back', 'You are signed in.');
    } catch (e) {
      Alert.alert('Error', 'Unable to sign in right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-islamic-linear">
      <View className="absolute inset-0 bg-islamic-radial opacity-80" />
      <View className="flex-1 justify-center px-8">
        <Text className="text-2xl font-semibold text-white mb-6">Welcome back</Text>
        <View className="gap-4">
          <View>
            <Text className="text-xs text-emerald-100 mb-1">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              className="rounded-2xl bg-black/50 border border-emerald-400/30 px-4 py-3 text-white"
            />
          </View>
          <View>
            <Text className="text-xs text-emerald-100 mb-1">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              className="rounded-2xl bg-black/50 border border-emerald-400/30 px-4 py-3 text-white"
            />
          </View>
          <TouchableOpacity
            disabled={loading}
            className="mt-2 rounded-2xl bg-emerald-400 py-3 items-center shadow-soft"
            onPress={handleSignIn}
          >
            <Text className="text-slate-950 font-semibold">{loading ? 'Signing in…' : 'Sign in'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text className="text-emerald-100/80 text-xs text-center mt-2">Forgot password?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text className="text-emerald-100/80 text-xs text-center mt-4">
              New here? <Text className="font-semibold">Create an account</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}



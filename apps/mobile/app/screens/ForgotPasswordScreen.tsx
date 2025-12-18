import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AuthStackParamList } from '../auth-stack';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    // In a real deployment you would hit a password-reset endpoint.
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Check your email',
        'If an account exists with that address, a reset link has been sent.',
      );
      navigation.goBack();
    }, 800);
  };

  return (
    <View className="flex-1 bg-islamic-linear">
      <View className="absolute inset-0 bg-islamic-radial opacity-80" />
      <View className="flex-1 justify-center px-8">
        <Text className="text-2xl font-semibold text-white mb-2">Forgot password</Text>
        <Text className="text-sm text-emerald-100/80 mb-6">
          Enter your email and we&apos;ll send you a secure reset link.
        </Text>
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
          <TouchableOpacity
            disabled={loading}
            className="mt-2 rounded-2xl bg-emerald-400 py-3 items-center shadow-soft"
            onPress={handleReset}
          >
            <Text className="text-slate-950 font-semibold">
              {loading ? 'Sending link…' : 'Send reset link'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-emerald-100/80 text-xs text-center mt-4">Back to sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}



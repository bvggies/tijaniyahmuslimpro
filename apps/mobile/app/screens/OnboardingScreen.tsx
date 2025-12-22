import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { AuthStackParamList } from '../auth-stack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

export function OnboardingScreen({ navigation }: Props) {
  return (
    <View className="flex-1 bg-islamic-linear">
      <View className="absolute inset-0 bg-islamic-radial opacity-80" />
      <View className="flex-1 justify-center px-8">
        <View className="items-center mb-10">
          <Image
            source={require('../../assets/logo.png')}
            className="h-24 w-24 mb-6"
          />
          <Text className="text-3xl font-semibold text-white mb-2 text-center">
            Tijaniyah Muslim Pro
          </Text>
          <Text className="text-sm text-emerald-100/80 text-center">
            Your companion for Salah, Quran, Zikr, and the Tijaniyah path — in one serene experience.
          </Text>
        </View>
        <View className="gap-3">
          <TouchableOpacity
            className="rounded-2xl bg-emerald-400 py-3 items-center shadow-soft"
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text className="text-slate-950 font-semibold">Create account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="rounded-2xl border border-emerald-400/40 bg-black/40 py-3 items-center"
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text className="text-emerald-50 font-semibold">Sign in</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="py-3 items-center"
            onPress={() => navigation.replace('SignIn')}
          >
            <Text className="text-emerald-100/80 text-xs underline">
              Continue as guest (limited access)
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}



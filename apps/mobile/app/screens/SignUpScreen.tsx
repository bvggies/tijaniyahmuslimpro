import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { useState, useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { AuthStackParamList } from '../auth-stack';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

// Get API URL from app.json extra field, falling back to deployed backend URL.
// We intentionally ignore any local EXPO_PUBLIC_API_BASE_URL to avoid localhost.
const API_BASE_URL =
  (Constants.expoConfig as any)?.extra?.apiBaseUrl ??
  'https://tijaniyahmuslimpro-admin-mu.vercel.app';

export function SignUpScreen({ navigation }: Props) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  // Animation values
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Listen for dimension changes (orientation changes)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });
    return () => subscription?.remove();
  }, []);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Password too short', 'Password must be at least 8 characters.');
      return;
    }

    try {
      setLoading(true);
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      console.log('Attempting sign up to:', `${API_BASE_URL}/api/auth-register`);
      
      const res = await fetch(`${API_BASE_URL}/api/auth-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      // Check content type before parsing
      const contentType = res.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      // Read response as text first to handle non-JSON responses
      const responseText = await res.text();
      
      let json;
      if (isJson && responseText) {
        try {
          json = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse JSON response:', parseError);
          console.error('Response text (first 200 chars):', responseText.substring(0, 200));
          Alert.alert(
            'Error',
            `Server returned invalid response (${res.status}). Please check your connection and try again.`
          );
          return;
        }
      } else {
        // Non-JSON response (likely HTML error page or plain text error)
        console.error('Non-JSON response received:', {
          status: res.status,
          contentType,
          preview: responseText.substring(0, 200),
        });
        
        let errorMessage = 'Server error. Please try again.';
        if (res.status === 402) {
          errorMessage = 'Service temporarily unavailable. The server deployment is currently disabled. Please contact support or try again later.';
        } else if (res.status === 404) {
          errorMessage = 'API endpoint not found. Please check your connection.';
        } else if (res.status === 403) {
          errorMessage = 'Access forbidden. Please check your credentials.';
        } else if (res.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (res.status === 0 || !res.status) {
          errorMessage = 'Network error. Please check your connection.';
        }
        
        Alert.alert('Error', errorMessage);
        return;
      }

      if (!res.ok) {
        // Handle API error responses
        const errorMessage = json?.error || json?.message || 'Please check your details';
        console.error('Sign up failed:', { status: res.status, error: errorMessage, json });
        
        // Map common error codes to user-friendly messages
        let userMessage = errorMessage;
        if (res.status === 402) {
          userMessage = 'Service temporarily unavailable. The server deployment is currently disabled. Please contact support or try again later.';
        } else if (errorMessage === 'EMAIL_IN_USE') {
          userMessage = 'This email is already registered. Please sign in instead.';
        } else if (errorMessage === 'INVALID_INPUT') {
          userMessage = 'Please check that all fields are filled correctly.';
        } else if (res.status === 500 || errorMessage === 'INTERNAL_SERVER_ERROR') {
          userMessage = 'Server error occurred. Please try again in a moment. If the problem persists, contact support.';
        } else if (res.status >= 500) {
          userMessage = 'Server error. Please try again later.';
        }
        
        Alert.alert('Sign up failed', userMessage);
        return;
      }

      // Check if response has required fields
      if (!json.accessToken || !json.refreshToken) {
        console.error('Invalid response structure:', json);
        Alert.alert('Error', 'Server response was incomplete. Please try again.');
        return;
      }

      await SecureStore.setItemAsync('accessToken', json.accessToken);
      await SecureStore.setItemAsync('refreshToken', json.refreshToken);
      // Clear guest mode if it was set
      await SecureStore.deleteItemAsync('guestMode');
      
      // Store user data in React Query cache immediately
      if (json.user) {
        queryClient.setQueryData(['auth', 'me'], json.user);
        console.log('User data stored in cache:', json.user);
      }
      
      // Navigate to MainTabs via root navigator
      const rootNavigation = navigation.getParent()?.getParent();
      if (rootNavigation) {
        rootNavigation.replace('MainTabs');
      } else {
        console.warn('Root navigator not found for sign up navigation');
      }
    } catch (e) {
      // Handle network errors and other exceptions
      const error = e as Error;
      console.error('Sign up error:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        apiUrl: API_BASE_URL,
      });
      
      let errorMessage = 'Unable to sign up right now. Please try again.';
      
      if (error.name === 'AbortError' || error.message.includes('aborted')) {
        errorMessage = 'Request timed out. Please check your internet connection and try again.';
      } else if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check:\n\n• Your internet connection\n• The API server is accessible\n• Try again in a moment';
      } else if (error.message.includes('Failed to connect') || error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Connection Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.darkTeal[950], colors.darkTeal[900]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Modern mosque background image - full screen */}
      <View style={styles.mosqueContainer}>
        <Image
          source={require('../../AppIcons/mosque-modern.png')}
          resizeMode="cover"
          style={[styles.mosqueImage, {
            width: screenData.width,
            height: screenData.height,
          }]}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.pineBlue[100]} />
          </Pressable>

          <Animated.View
            style={[
              styles.content,
              {
                opacity: contentOpacity,
                transform: [{ translateY: contentTranslateY }],
              },
            ]}
          >
            <Text style={styles.title}>Create your Tijaniyah space</Text>
            <Text style={styles.subtitle}>
              Join our community and begin your spiritual journey
            </Text>

            <View style={styles.form}>
              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full name</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={colors.pineBlue[300]}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Abdullah ibn Ahmad"
                    placeholderTextColor={colors.pineBlue[300]}
                    autoCapitalize="words"
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={colors.pineBlue[300]}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.pineBlue[300]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={colors.pineBlue[300]}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={colors.pineBlue[300]}
                    secureTextEntry={!showPassword}
                    style={[styles.input, styles.passwordInput]}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.pineBlue[300]}
                    />
                  </Pressable>
                </View>
                <Text style={styles.passwordHint}>
                  Must be at least 8 characters
                </Text>
              </View>

              {/* Sign Up Button */}
              <Pressable
                onPress={handleSignUp}
                disabled={loading}
                style={({ pressed }) => [
                  styles.primaryButton,
                  (loading || pressed) && styles.primaryButtonPressed,
                ]}
              >
                <LinearGradient
                  colors={[colors.darkTeal[800], colors.darkTeal[700]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.primaryButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.primaryButtonText}>Create account</Text>
                  )}
                </LinearGradient>
              </Pressable>

              {/* Sign In Link */}
              <View style={styles.footerLinks}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <Pressable onPress={() => navigation.navigate('SignIn')}>
                  <Text style={styles.footerLink}>Sign in</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkTeal[800],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...typography.headingLg,
    fontSize: 28,
    color: colors.white, // Headings
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.pineBlue[100], // Body text
    marginBottom: spacing['2xl'],
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    ...typography.bodySm,
    fontSize: 13,
    color: colors.pineBlue[100], // Body text
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkTeal[800], // Primary card surface
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: spacing.md,
    height: 56,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.pineBlue[100], // Body text
  },
  passwordInput: {
    paddingRight: spacing.sm,
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  passwordHint: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300], // Muted text
    marginTop: -spacing.xs,
  },
  primaryButton: {
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  primaryButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...typography.buttonMd,
    color: colors.white,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    ...typography.bodySm,
    color: colors.pineBlue[300], // Muted text
  },
  footerLink: {
    ...typography.bodySm,
    color: colors.pineBlue[100], // Body text
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  mosqueContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
  },
  mosqueImage: {
    opacity: 0.4,
  },
});

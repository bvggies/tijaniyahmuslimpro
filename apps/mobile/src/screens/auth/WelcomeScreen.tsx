import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { IslamicPattern } from '../../components/ui/IslamicPattern';

type AuthStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  SignIn: undefined;
  ForgotPassword: undefined;
  Terms: undefined;
  Privacy: undefined;
};

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  // Screen dimensions for responsive sizing
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  
  // Animation values
  const heroCardOpacity = useRef(new Animated.Value(0)).current;
  const heroCardTranslateY = useRef(new Animated.Value(20)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const buttonsTranslateY = useRef(new Animated.Value(20)).current;
  
  // Footer link press states
  const [termsPressed, setTermsPressed] = React.useState(false);
  const [privacyPressed, setPrivacyPressed] = React.useState(false);
  
  // Listen for dimension changes (orientation changes)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    // Animate hero card
    Animated.parallel([
      Animated.timing(heroCardOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(heroCardTranslateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate buttons with slight delay
    Animated.parallel([
      Animated.timing(buttonsOpacity, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(buttonsTranslateY, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

  }, []);

  const handleCreateAccount = () => {
    navigation.navigate('SignUp');
  };

  const handleSignIn = () => {
    navigation.navigate('SignIn');
  };

  const handleContinueAsGuest = async () => {
    try {
      // Mark guest mode and clear any auth tokens
      await SecureStore.setItemAsync('guestMode', 'true');
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');

      // Navigate to MainTabs (Tabs) using CommonActions.reset
      try {
        const rootNavigation = navigation.getParent()?.getParent();
        if (rootNavigation) {
          rootNavigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            }),
          );
        } else {
          // Fallback: try direct navigation
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            }),
          );
        }
      } catch (navError) {
        // If navigation fails, RootNavigator will detect the change within 1 second
        console.log('Navigation will auto-update via RootNavigator');
      }
    } catch (error) {
      console.error('Error setting guest mode:', error);
      Alert.alert('Error', 'Unable to continue as guest. Please try again.');
    }
  };

  const handleTermsPress = () => {
    navigation.navigate('Terms');
  };

  const handlePrivacyPress = () => {
    navigation.navigate('Privacy');
  };

  return (
    <View style={styles.container}>
      {/* Full-screen dark-teal gradient background */}
      <LinearGradient
        colors={[colors.darkTeal[950], colors.darkTeal[900]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Very subtle Islamic geometric watermark pattern */}
      <IslamicPattern />

      {/* Modern mosque background image - full screen */}
      <View style={styles.mosqueContainer}>
        <Image
          source={require('../../../AppIcons/mosque-modern.png')}
          resizeMode="cover"
          style={[styles.mosqueImage, {
            width: screenData.width,
            height: screenData.height,
          }]}
        />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        <View style={styles.content}>
          {/* Logo with Animation */}
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                opacity: heroCardOpacity,
                transform: [{ translateY: heroCardTranslateY }],
              },
            ]}
          >
            {/* Optional small Arabic line above logo */}
            <Text style={styles.bismillah}>بِسْمِ ٱللَّٰهِ</Text>

            {/* Logo container - centered */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../AppIcons/App logo.png')}
                resizeMode="contain"
                style={styles.heroLogo}
              />
            </View>
          </Animated.View>

          {/* Text block */}
          <View style={styles.textBlock}>
            <Text style={styles.subtitle}>
              Your companion for Salah, Quran, Zikr, and the Tijaniyah path — in one serene experience.
            </Text>
          </View>

          {/* Actions with Animation */}
          <Animated.View
            style={[
              styles.actions,
              {
                opacity: buttonsOpacity,
                transform: [{ translateY: buttonsTranslateY }],
              },
            ]}
          >
            {/* Primary Button - Create account (Longest) */}
            <Pressable
              onPress={handleCreateAccount}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
            >
              <LinearGradient
                colors={[colors.evergreen[500], colors.evergreen[500]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.primaryButtonGradient}
              >
                <Text style={styles.primaryButtonText}>Create account</Text>
              </LinearGradient>
            </Pressable>

            {/* Secondary Button - Sign in (Long) */}
            <Pressable
              onPress={handleSignIn}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
              ]}
            >
              <BlurView intensity={20} tint="light" style={styles.secondaryButtonBlur}>
                <Text style={styles.secondaryButtonText}>Sign in</Text>
              </BlurView>
            </Pressable>

            {/* Tertiary Button - Continue as guest (Short) */}
            <Pressable
              onPress={handleContinueAsGuest}
              style={({ pressed }) => [
                styles.guestButton,
                pressed && styles.guestButtonPressed,
              ]}
            >
              <BlurView intensity={15} tint="light" style={styles.guestButtonBlur}>
                <Text style={styles.guestButtonText}>
                  <Text style={styles.guestButtonTextMain}>Continue as guest{'\n'}</Text>
                  <Text style={styles.guestButtonTextLimited}>(limited access)</Text>
                </Text>
              </BlurView>
            </Pressable>
          </Animated.View>

          {/* Footer with Tappable Links */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our{' '}
              <Pressable 
                onPress={handleTermsPress}
                onPressIn={() => setTermsPressed(true)}
                onPressOut={() => setTermsPressed(false)}
              >
                <Text style={[styles.footerLink, termsPressed && styles.footerLinkPressed]}>
                  Terms
                </Text>
              </Pressable>
              {' & '}
              <Pressable 
                onPress={handlePrivacyPress}
                onPressIn={() => setPrivacyPressed(true)}
                onPressOut={() => setPrivacyPressed(false)}
              >
                <Text style={[styles.footerLink, privacyPressed && styles.footerLinkPressed]}>
                  Privacy Policy
                </Text>
              </Pressable>
              .
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    marginBottom: spacing.lg,
  },
  bismillah: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.pineBlue[300],
    textAlign: 'center',
    letterSpacing: 1.5,
    marginBottom: spacing.md,
    opacity: 0.5,
  },
  logoContainer: {
    width: '60%',
    maxWidth: 200,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLogo: {
    width: '100%',
    height: '100%',
  },
  textBlock: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  subtitle: {
    ...typography.bodyMd,
    fontSize: 15,
    color: colors.pineBlue[300],
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '87%',
  },
  actions: {
    width: '100%',
    maxWidth: 400,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  primaryButton: {
    height: 56,
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: colors.evergreen[500],
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  primaryButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...typography.buttonMd,
    color: colors.white,
    fontWeight: '600',
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  secondaryButton: {
    height: 56,
    width: '75%',
    alignSelf: 'center',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  secondaryButtonBlur: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    ...typography.buttonMd,
    color: colors.pineBlue[100],
    fontWeight: '500',
  },
  secondaryButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  guestButton: {
    height: 56,
    width: '50%',
    alignSelf: 'center',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  guestButtonBlur: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  guestButtonText: {
    ...typography.bodySm,
    fontSize: 14,
    textAlign: 'center',
  },
  guestButtonTextMain: {
    color: colors.pineBlue[300],
  },
  guestButtonTextLimited: {
    color: colors.pineBlue[300],
    opacity: 0.5,
  },
  guestButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  footer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  footerText: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
    textDecorationLine: 'underline',
  },
  footerLinkPressed: {
    color: colors.pineBlue[100],
    opacity: 1,
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

export default WelcomeScreen;

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const SplashScreen: React.FC = () => {
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const crescentOpacity = useRef(new Animated.Value(0.3)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Logo animation - scale and fade in
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Text animation - fade in and slide up
    Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateY, {
        toValue: 0,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Crescent pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(crescentOpacity, {
          toValue: 0.6,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(crescentOpacity, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={[colors.darkTeal[950], colors.darkTeal[900], colors.darkTeal[950]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Islamic Geometric Pattern Watermark */}
      <View style={styles.patternContainer}>
        <Svg width="400" height="400" viewBox="0 0 200 200" style={styles.patternSvg}>
          <Path
            d="M100 20 L110 50 L140 50 L115 70 L125 100 L100 85 L75 100 L85 70 L60 50 L90 50 Z"
            fill={colors.evergreen[500]}
            opacity={0.08}
          />
          <Path
            d="M100 180 L90 150 L60 150 L85 130 L75 100 L100 115 L125 100 L115 130 L140 150 L110 150 Z"
            fill={colors.evergreen[500]}
            opacity={0.08}
          />
          <Path
            d="M20 100 L50 90 L50 60 L70 85 L100 75 L85 100 L100 125 L70 115 L50 140 L50 110 Z"
            fill={colors.evergreen[500]}
            opacity={0.06}
          />
          <Path
            d="M180 100 L150 110 L150 140 L130 115 L100 125 L115 100 L100 75 L130 85 L150 60 L150 90 Z"
            fill={colors.evergreen[500]}
            opacity={0.06}
          />
        </Svg>
      </View>

      {/* Mosque Arch Motif */}
      <View style={styles.mosqueArch}>
        <Svg width="300" height="200" viewBox="0 0 300 200" style={styles.archSvg}>
          <Path
            d="M150 0 Q 50 50, 50 120 Q 50 150, 150 200 Q 250 150, 250 120 Q 250 50, 150 0"
            fill="none"
            stroke={colors.evergreen[500]}
            strokeWidth="2"
            opacity={0.12}
          />
        </Svg>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Crescent Icon */}
        <Animated.View
          style={[
            styles.crescentContainer,
            { opacity: crescentOpacity },
          ]}
        >
          <Ionicons
            name="moon"
            size={32}
            color={colors.evergreen[500]}
          />
        </Animated.View>

        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../../AppIcons/App logo.png')}
              resizeMode="contain"
              style={styles.logo}
            />
          </View>
        </Animated.View>

        {/* App Name */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={styles.appName}>Tijaniyah Muslim Pro</Text>
          <Text style={styles.tagline}>بِسْمِ ٱللَّٰهِ</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  patternContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.06,
    overflow: 'hidden',
  },
  patternSvg: {
    width: '200%',
    height: '200%',
    position: 'absolute',
    top: -50,
    left: -50,
  },
  mosqueArch: {
    position: 'absolute',
    top: '15%',
    left: '50%',
    marginLeft: -150,
    width: 300,
    height: 200,
    opacity: 0.1,
  },
  archSvg: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  crescentContainer: {
    position: 'absolute',
    top: '20%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  logoWrapper: {
    width: 200,
    height: 200,
    borderRadius: 40,
    backgroundColor: colors.darkTeal[900],
    borderWidth: 2,
    borderColor: `rgba(8, 247, 116, 0.2)`,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    shadowColor: colors.evergreen[500],
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  appName: {
    ...typography.headingLg,
    fontSize: 28,
    color: colors.white,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 20,
    fontWeight: '700',
    color: `rgba(24, 120, 129, 0.8)`,
    textAlign: 'center',
    letterSpacing: 2,
  },
});

export default SplashScreen;


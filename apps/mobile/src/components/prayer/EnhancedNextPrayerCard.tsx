import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../ui/GlassCard';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface EnhancedNextPrayerCardProps {
  prayerName: string;
  countdown: string;
  location?: string;
  onViewAllTimes?: () => void;
  onQibla?: () => void;
  hijriDate?: string;
  compact?: boolean; // For PrayerTimesScreen
}

export const EnhancedNextPrayerCard: React.FC<EnhancedNextPrayerCardProps> = ({
  prayerName,
  countdown,
  location,
  onViewAllTimes,
  onQibla,
  hijriDate,
  compact = false,
}) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const starRotate = useRef(new Animated.Value(0)).current;
  const crescentScale = useRef(new Animated.Value(1)).current;

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  // Continuous animations
  useEffect(() => {
    // Pulse animation for countdown
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Rotating star pattern
    Animated.loop(
      Animated.timing(starRotate, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      }),
    ).start();

    // Crescent moon gentle pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(crescentScale, {
          toValue: 1.08,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(crescentScale, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim, starRotate, crescentScale]);

  const starRotation = starRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const prayerIconMap: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
    Fajr: { name: 'sunny', color: '#FFD700' },
    Dhuhr: { name: 'sunny', color: '#FFA500' },
    Asr: { name: 'sunny', color: '#FF8C00' },
    Maghrib: { name: 'sunny', color: '#FF6347' },
    Isha: { name: 'moon-outline', color: '#9370DB' },
  };

  const prayerIcon = prayerIconMap[prayerName] || { name: 'time-outline' as keyof typeof Ionicons.glyphMap, color: colors.evergreen[500] };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <GlassCard style={[styles.card, compact && styles.cardCompact]}>
        {/* Animated Islamic Background Vectors */}
        <View style={styles.backgroundVectors}>
          {/* Rotating star pattern */}
          <Animated.View
            style={[
              styles.starContainer,
              { transform: [{ rotate: starRotation }] },
            ]}
          >
            <Svg width="120" height="120" viewBox="0 0 100 100" style={styles.starSvg}>
              <Path
                d="M50 5 L55 35 L85 35 L60 55 L70 85 L50 70 L30 85 L40 55 L15 35 L45 35 Z"
                fill={colors.evergreen[500]}
                opacity={0.08}
              />
            </Svg>
          </Animated.View>

          {/* Crescent moon */}
          <Animated.View
            style={[
              styles.crescentContainer,
              { transform: [{ scale: crescentScale }] },
            ]}
          >
            <Svg width="80" height="80" viewBox="0 0 100 100" style={styles.crescentSvg}>
              <Circle cx="50" cy="50" r="30" fill={colors.darkTeal[950]} />
              <Circle cx="65" cy="50" r="30" fill={colors.darkTeal[800]} />
              <Path
                d="M 50 20 Q 70 50 50 80"
                stroke={colors.evergreen[500]}
                strokeWidth="2"
                fill="none"
                opacity={0.15}
              />
            </Svg>
          </Animated.View>

          {/* Geometric pattern overlay */}
          <Svg width="200" height="200" viewBox="0 0 200 200" style={styles.patternSvg}>
            {Array.from({ length: 3 }).map((_, i) =>
              Array.from({ length: 3 }).map((__, j) => (
                <Path
                  key={`${i}-${j}`}
                  d="M50 10 L60 30 L80 30 L65 45 L70 65 L50 55 L30 65 L35 45 L20 30 L40 30 Z"
                  fill={colors.evergreen[500]}
                  opacity={0.04}
                  transform={`translate(${i * 70}, ${j * 70}) scale(0.5)`}
                />
              )),
            )}
          </Svg>

          {/* Mosque arch silhouette */}
          <Svg width="100%" height="100%" viewBox="0 0 400 200" style={styles.archSvg}>
            <Path
              d="M 50 180 Q 200 20 350 180"
              stroke={colors.evergreen[500]}
              strokeWidth="1.5"
              opacity={0.06}
              fill="none"
            />
            <Path
              d="M 100 180 Q 200 40 300 180"
              stroke={colors.evergreen[500]}
              strokeWidth="1"
              opacity={0.04}
              fill="none"
            />
          </Svg>
        </View>

        {/* Gradient overlay */}
        <LinearGradient
          colors={[
            'rgba(8,247,116,0.12)',
            'rgba(8,247,116,0.06)',
            'rgba(8,247,116,0.02)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientOverlay}
        />

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.label}>Next Prayer</Text>
              <View style={styles.prayerNameRow}>
                <Ionicons
                  name={prayerIcon.name as any}
                  size={compact ? 20 : 24}
                  color={prayerIcon.color}
                  style={{ marginRight: spacing.xs }}
                />
                <Text style={styles.prayerName}>{prayerName}</Text>
              </View>
            </View>
            <Animated.View
              style={[
                styles.countdownContainer,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={compact ? 16 : 18}
                color={colors.evergreen[500]}
                style={styles.countdownIcon}
              />
              <Text style={styles.countdown}>{countdown}</Text>
            </Animated.View>
          </View>

          {!compact && (
            <>
              <View style={styles.metaRow}>
                {hijriDate && (
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color={colors.pineBlue[300]}
                      style={{ marginRight: spacing.xs }}
                    />
                    <Text style={styles.metaText}>{hijriDate}</Text>
                  </View>
                )}
                {location && (
                  <Pressable style={styles.locationRow}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color={colors.pineBlue[300]}
                      style={{ marginRight: spacing.xs }}
                    />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {location}
                    </Text>
                  </Pressable>
                )}
              </View>

              {(onViewAllTimes || onQibla) && (
                <View style={styles.actions}>
                  {onViewAllTimes && (
                    <Pressable
                      onPress={onViewAllTimes}
                      style={({ pressed }) => [
                        styles.actionButtonPrimary,
                        pressed && styles.actionButtonPressed,
                      ]}
                    >
                      <Text style={styles.actionButtonPrimaryText}>View all times</Text>
                    </Pressable>
                  )}
                  {onQibla && (
                    <Pressable
                      onPress={onQibla}
                      style={({ pressed }) => [
                        styles.actionButtonSecondary,
                        pressed && styles.actionButtonPressed,
                      ]}
                    >
                      <Ionicons
                        name="compass-outline"
                        size={16}
                        color={colors.pineBlue[100]}
                        style={styles.actionButtonIcon}
                      />
                      <Text style={styles.actionButtonSecondaryText}>Qibla</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  card: {
    overflow: 'hidden',
    position: 'relative',
    minHeight: 180,
  },
  cardCompact: {
    minHeight: 120,
  },
  backgroundVectors: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  starContainer: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 120,
    height: 120,
  },
  starSvg: {
    position: 'absolute',
  },
  crescentContainer: {
    position: 'absolute',
    bottom: -15,
    left: -15,
    width: 80,
    height: 80,
  },
  crescentSvg: {
    position: 'absolute',
  },
  patternSvg: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -100 }],
    opacity: 0.3,
  },
  archSvg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    position: 'relative',
    zIndex: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.pineBlue[300],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  prayerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerIcon: {
    marginRight: spacing.xs,
  },
  prayerName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(8,247,116,0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(8,247,116,0.3)',
  },
  countdownIcon: {
    marginRight: spacing.xs,
  },
  countdown: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.evergreen[500],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  metaText: {
    fontSize: 13,
    color: colors.pineBlue[300],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 13,
    color: colors.pineBlue[300],
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButtonPrimary: {
    flex: 1,
    backgroundColor: colors.evergreen[500],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginLeft: spacing.sm,
  },
  actionButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  actionButtonPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.darkTeal[950],
  },
  actionButtonIcon: {
    marginRight: spacing.xs,
  },
  actionButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.pineBlue[100],
  },
});


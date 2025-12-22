import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Animated } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { GlassCard } from '../ui/GlassCard';
import { CompassDial } from './CompassDial';
import { QiblaNeedle } from './QiblaNeedle';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native';
import { typography } from '../../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COMPASS_SIZE = Math.min(SCREEN_WIDTH * 0.75, 320);

interface QiblaCompassTabProps {
  qiblaBearing: number | null;
  heading: number;
  smoothedHeading: number;
  isAligned: boolean;
  distance: number | null;
  compassRotation: Animated.AnimatedInterpolation<string | number>;
  alignedGlow: Animated.AnimatedValue;
}

export const QiblaCompassTab: React.FC<QiblaCompassTabProps> = ({
  qiblaBearing,
  heading,
  smoothedHeading,
  isAligned,
  distance,
  compassRotation,
  alignedGlow,
}) => {
  if (qiblaBearing === null) {
    return null;
  }

  return (
    <View style={styles.compassSection}>
      <GlassCard style={styles.compassCard}>
        <View style={styles.compassContainer}>
          {/* Compass Dial */}
          <CompassDial
            size={COMPASS_SIZE}
            qiblaBearing={qiblaBearing}
            isAligned={isAligned}
          />

          {/* Qibla Needle */}
          <QiblaNeedle
            size={COMPASS_SIZE}
            rotation={compassRotation}
            isAligned={isAligned}
          />

          {/* Aligned Badge */}
          {isAligned && (
            <Animated.View
              style={[
                styles.alignedBadge,
                {
                  opacity: alignedGlow,
                },
              ]}
            >
              <LinearGradient
                colors={[colors.evergreen[500], colors.evergreen[500]]}
                style={styles.alignedBadgeGradient}
              >
                <Ionicons name="checkmark-circle" size={20} color={colors.darkTeal[950]} />
                <Text style={styles.alignedText}>Aligned</Text>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Distance to Makkah */}
          {distance !== null && (
            <View style={styles.distanceBadge}>
              <Ionicons name="location" size={14} color={colors.pineBlue[300]} />
              <Text style={styles.distanceText}>
                {distance.toLocaleString()} km to Makkah
              </Text>
            </View>
          )}
        </View>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  compassSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  compassCard: {
    width: COMPASS_SIZE + 40,
    height: COMPASS_SIZE + 40,
    borderRadius: (COMPASS_SIZE + 40) / 2,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassContainer: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  alignedBadge: {
    position: 'absolute',
    top: COMPASS_SIZE * 0.15,
    alignSelf: 'center',
    borderRadius: 20,
    overflow: 'hidden',
  },
  alignedBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  alignedText: {
    ...typography.buttonSm,
    color: colors.darkTeal[950],
    fontWeight: '700',
  },
  distanceBadge: {
    position: 'absolute',
    bottom: COMPASS_SIZE * 0.1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkTeal[800],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  distanceText: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
  },
});

export default QiblaCompassTab;


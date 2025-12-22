import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../ui/GlassCard';
import { calculateDistanceToMecca, getDirectionName } from '../../services/qiblaUtils';

interface QiblaInfoTabProps {
  userLocation: { lat: number; lng: number } | null;
  bearing: number | null;
  distance: number | null;
  heading: number | null;
}

export const QiblaInfoTab: React.FC<QiblaInfoTabProps> = ({
  userLocation,
  bearing,
  distance,
  heading,
}) => {
  const formatDistance = (distKm: number | null): string => {
    if (distKm === null) return 'Calculating...';
    return `${distKm.toLocaleString()} km (${(distKm * 0.621371).toLocaleString(undefined, { maximumFractionDigits: 0 })} mi)`;
  };

  return (
    <View style={styles.container}>
      {/* Location Info */}
      {userLocation && (
        <GlassCard style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="location" size={24} color={colors.evergreen[500]} />
            <Text style={styles.infoTitle}>Your Location</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Latitude:</Text>
            <Text style={styles.infoValue}>{userLocation.lat.toFixed(6)}°</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Longitude:</Text>
            <Text style={styles.infoValue}>{userLocation.lng.toFixed(6)}°</Text>
          </View>
        </GlassCard>
      )}

      {/* Qibla Bearing */}
      {bearing !== null && (
        <GlassCard style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="navigate" size={24} color={colors.evergreen[500]} />
            <Text style={styles.infoTitle}>Qibla Bearing</Text>
          </View>
          <View style={styles.bearingContainer}>
            <Text style={styles.bearingValue}>
              {Math.round(bearing)}°
            </Text>
            <Text style={styles.bearingDirection}>
              {getDirectionName(bearing)}
            </Text>
          </View>
          <Text style={styles.infoDescription}>
            Face this direction to pray toward the Kaaba in Makkah.
          </Text>
        </GlassCard>
      )}

      {/* Current Heading */}
      {heading !== null && (
        <GlassCard style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="compass" size={24} color={colors.pineBlue[300]} />
            <Text style={styles.infoTitle}>Current Heading</Text>
          </View>
          <View style={styles.bearingContainer}>
            <Text style={styles.bearingValue}>
              {Math.round(heading)}°
            </Text>
            <Text style={styles.bearingDirection}>
              {getDirectionName(heading)}
            </Text>
          </View>
        </GlassCard>
      )}

      {/* Distance */}
      {distance !== null && (
        <GlassCard style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="map-outline" size={24} color={colors.evergreen[500]} />
            <Text style={styles.infoTitle}>Distance to Makkah</Text>
          </View>
          <Text style={styles.distanceValue}>{formatDistance(distance)}</Text>
          <Text style={styles.infoDescription}>
            Great circle distance from your location to the Kaaba.
          </Text>
        </GlassCard>
      )}

      {/* Makkah Info */}
      <GlassCard style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Ionicons name="cube" size={24} color="#ff4d6d" />
          <Text style={styles.infoTitle}>Makkah (Kaaba)</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Latitude:</Text>
          <Text style={styles.infoValue}>21.422487°</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Longitude:</Text>
          <Text style={styles.infoValue}>39.826206°</Text>
        </View>
        <Text style={styles.infoDescription}>
          The Kaaba is the holiest site in Islam, located in the Grand Mosque (Masjid al-Haram) in Makkah, Saudi Arabia.
        </Text>
      </GlassCard>

      {/* Tips */}
      <GlassCard style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Ionicons name="bulb-outline" size={24} color={colors.evergreen[500]} />
          <Text style={styles.infoTitle}>Tips for Accuracy</Text>
        </View>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.evergreen[500]} />
            <Text style={styles.tipText}>Ensure GPS is enabled for accurate location</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.evergreen[500]} />
            <Text style={styles.tipText}>Hold your device flat when using the compass</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.evergreen[500]} />
            <Text style={styles.tipText}>Keep away from magnetic interference</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.evergreen[500]} />
            <Text style={styles.tipText}>Calibrate compass regularly for best results</Text>
          </View>
        </View>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  infoCard: {
    padding: spacing.lg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoTitle: {
    ...typography.headingMd,
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    ...typography.bodyMd,
    fontSize: 13,
    color: colors.pineBlue[300],
  },
  infoValue: {
    ...typography.bodyMd,
    fontSize: 13,
    color: colors.pineBlue[100],
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  bearingContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  bearingValue: {
    ...typography.headingLg,
    fontSize: 32,
    color: colors.evergreen[500],
    fontWeight: '700',
  },
  bearingDirection: {
    ...typography.headingMd,
    fontSize: 18,
    color: colors.pineBlue[100],
    fontWeight: '600',
  },
  distanceValue: {
    ...typography.headingMd,
    fontSize: 20,
    color: colors.evergreen[500],
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  infoDescription: {
    ...typography.bodyMd,
    fontSize: 13,
    color: colors.pineBlue[100],
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  tipsList: {
    gap: spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  tipText: {
    ...typography.bodyMd,
    fontSize: 13,
    color: colors.pineBlue[100],
    flex: 1,
    lineHeight: 20,
  },
});

export default QiblaInfoTab;


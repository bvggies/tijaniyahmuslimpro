import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../ui/GlassCard';
import { calculateDistanceToMecca } from '../../services/qiblaUtils';

const MAKKAH = { latitude: 21.422487, longitude: 39.826206 };

// Dark map style for Google Maps
const DARK_MAP_STYLE = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#1d2c4d' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8ec3b9' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1a3646' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9e9e9e' }],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#bdbdbd' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#bdbdbd' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#181818' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#616161' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1b1b1b' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#2c2c2c' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8a8a8a' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#373737' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3c3c3c' }],
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry',
    stylers: [{ color: '#4e4e4e' }],
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#616161' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0e1626' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3d96ae' }],
  },
];

interface QiblaMapTabProps {
  userLocation: { lat: number; lng: number } | null;
  onLocationRefresh: () => Promise<void>;
  distance: number | null;
  bearing: number | null;
}

export const QiblaMapTab: React.FC<QiblaMapTabProps> = ({
  userLocation,
  onLocationRefresh,
  distance,
  bearing,
}) => {
  const mapRef = useRef<MapView>(null);
  const [mapStyle, setMapStyle] = useState<'standard' | 'dark'>('dark');
  const [units, setUnits] = useState<'km' | 'mi'>('km');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (userLocation && mapRef.current) {
      fitMapToBothPoints();
    }
  }, [userLocation]);

  const fitMapToBothPoints = () => {
    if (!userLocation || !mapRef.current) return;

    mapRef.current.fitToCoordinates(
      [
        { latitude: userLocation.lat, longitude: userLocation.lng },
        MAKKAH,
      ],
      {
        edgePadding: { top: 70, right: 70, bottom: 70, left: 70 },
        animated: true,
      }
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onLocationRefresh();
      // Small delay to ensure location is updated
      setTimeout(() => {
        fitMapToBothPoints();
        setIsRefreshing(false);
      }, 500);
    } catch (error) {
      setIsRefreshing(false);
      Alert.alert('Error', 'Failed to refresh location. Please try again.');
    }
  };

  const formatDistance = (distKm: number | null): string => {
    if (distKm === null) return 'Calculating...';
    if (units === 'mi') {
      const miles = distKm * 0.621371;
      return `${miles.toLocaleString(undefined, { maximumFractionDigits: 0 })} mi`;
    }
    return `${distKm.toLocaleString()} km`;
  };

  if (!userLocation) {
    return (
      <GlassCard style={styles.emptyCard}>
        <View style={styles.emptyContent}>
          <Ionicons name="location-outline" size={48} color={colors.pineBlue[300]} />
          <Text style={styles.emptyTitle}>Location Required</Text>
          <Text style={styles.emptyMessage}>
            Enable location to see the map with Qibla direction.
          </Text>
        </View>
      </GlassCard>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map Card */}
      <GlassCard style={styles.mapCard}>
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            customMapStyle={mapStyle === 'dark' ? DARK_MAP_STYLE : undefined}
            showsUserLocation={true}
            showsMyLocationButton={false}
            initialRegion={{
              latitude: userLocation.lat,
              longitude: userLocation.lng,
              latitudeDelta: 50,
              longitudeDelta: 50,
            }}
            onMapReady={() => {
              // Fit map when ready
              setTimeout(() => fitMapToBothPoints(), 300);
            }}
          >
            {/* User Location Marker */}
            <Marker
              coordinate={{
                latitude: userLocation.lat,
                longitude: userLocation.lng,
              }}
              title="Your Location"
              pinColor="#4285F4"
            />

            {/* Makkah Marker */}
            <Marker
              coordinate={MAKKAH}
              title="Makkah (Kaaba)"
              description="The Holy Kaaba"
              pinColor="#ff4d6d"
            />

            {/* Polyline from user to Makkah */}
            <Polyline
              coordinates={[
                { latitude: userLocation.lat, longitude: userLocation.lng },
                MAKKAH,
              ]}
              strokeColor="#12d6b0"
              strokeWidth={3}
              lineDashPattern={[5, 5]}
            />
          </MapView>
        </View>
      </GlassCard>

      {/* Distance Display */}
      {distance !== null && (
        <GlassCard style={styles.distanceCard}>
          <View style={styles.distanceContent}>
            <Ionicons name="location" size={20} color={colors.evergreen[500]} />
            <Text style={styles.distanceLabel}>Distance to Makkah:</Text>
            <Text style={styles.distanceValue}>{formatDistance(distance)}</Text>
          </View>
        </GlassCard>
      )}

      {/* Control Buttons */}
      <View style={styles.controls}>
        <Pressable
          onPress={() => setUnits(units === 'km' ? 'mi' : 'km')}
          style={({ pressed }) => [
            styles.controlButton,
            pressed && styles.controlButtonPressed,
          ]}
        >
          <GlassCard style={styles.controlButtonCard}>
            <Ionicons
              name="resize-outline"
              size={18}
              color={colors.pineBlue[100]}
            />
            <Text style={styles.controlButtonText}>{units.toUpperCase()}</Text>
          </GlassCard>
        </Pressable>

        <Pressable
          onPress={() => setMapStyle(mapStyle === 'standard' ? 'dark' : 'standard')}
          style={({ pressed }) => [
            styles.controlButton,
            pressed && styles.controlButtonPressed,
          ]}
        >
          <GlassCard style={styles.controlButtonCard}>
            <Ionicons
              name={mapStyle === 'dark' ? 'moon-outline' : 'sunny-outline'}
              size={18}
              color={colors.pineBlue[100]}
            />
            <Text style={styles.controlButtonText}>Style</Text>
          </GlassCard>
        </Pressable>

        <Pressable
          onPress={handleRefresh}
          disabled={isRefreshing}
          style={({ pressed }) => [
            styles.controlButton,
            pressed && styles.controlButtonPressed,
          ]}
        >
          <GlassCard style={styles.controlButtonCard}>
            {isRefreshing ? (
              <ActivityIndicator size="small" color={colors.evergreen[500]} />
            ) : (
              <Ionicons name="refresh" size={18} color={colors.evergreen[500]} />
            )}
            <Text style={styles.controlButtonText}>Refresh</Text>
          </GlassCard>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  mapCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  mapContainer: {
    width: '100%',
    height: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  emptyCard: {
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.headingLg,
    fontSize: 18,
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    textAlign: 'center',
  },
  distanceCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 16,
  },
  distanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  distanceLabel: {
    ...typography.bodyMd,
    fontSize: 14,
    color: colors.pineBlue[100],
  },
  distanceValue: {
    ...typography.headingMd,
    fontSize: 16,
    color: colors.evergreen[500],
    fontWeight: '700',
  },
  controls: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  controlButton: {
    flex: 1,
  },
  controlButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  controlButtonCard: {
    padding: spacing.md,
    borderRadius: 16,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  controlButtonText: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[100],
    fontWeight: '600',
  },
});

export default QiblaMapTab;


import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { IslamicPattern } from '../../src/components/ui/IslamicPattern';
import { Button } from '../../src/components/ui/Button';
import apiClient from '../../src/services/apiClient';

interface MosqueDto {
  id: string;
  name: string;
  address?: string;
  lat: number;
  lng: number;
}

export function MosqueLocatorScreen() {
  const navigation = useNavigation();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);

  useEffect(() => {
    const ask = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setPermissionError('Location permission is required to find nearby mosques.');
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const newCoords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
        setCoords(newCoords);

        // Reverse geocode for location name
        try {
          const addresses = await Location.reverseGeocodeAsync(newCoords);
          if (addresses.length > 0) {
            const addr = addresses[0];
            const city = addr.city || addr.subAdministrativeArea || addr.administrativeArea || 'Current location';
            setLocationName(city);
          }
        } catch {
          setLocationName('Current location');
        }
      } catch (error) {
        setPermissionError('Failed to get your location. Please try again.');
      }
    };
    void ask();
  }, []);

  // Note: Fallback mosques will be empty array since we need real location data

  const { data, isLoading, refetch, error } = useQuery({
    queryKey: ['mosquesNearby', coords],
    queryFn: async () => {
      if (!coords) throw new Error('No coordinates yet');
      try {
        const response = await apiClient.get<{ mosques: MosqueDto[] }>(
          `/api/mosques-nearby?lat=${coords.lat}&lng=${coords.lng}`
        );
        return { mosques: response.mosques || [], isFallback: false };
      } catch (err: any) {
        // Log error for debugging
        if (__DEV__) {
          console.error('Mosque fetch error:', err?.message || err);
        }
        // Return fallback data instead of throwing
        return { mosques: [], isFallback: true, error: err?.message || 'Network request failed' };
      }
    },
    enabled: !!coords,
    retry: 1,
    retryDelay: 1000,
    // Don't throw errors, return fallback data instead
    throwOnError: false,
  });

  const handleRefresh = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert('Permission Required', 'Location permission is required to find nearby mosques.');
          return;
        }
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const newCoords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      setCoords(newCoords);
      setPermissionError(null);

      // Reverse geocode
      try {
        const addresses = await Location.reverseGeocodeAsync(newCoords);
        if (addresses.length > 0) {
          const addr = addresses[0];
          const city = addr.city || addr.subAdministrativeArea || addr.administrativeArea || 'Current location';
          setLocationName(city);
        }
      } catch {
        setLocationName('Current location');
      }

      void refetch();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh location. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={[colors.darkTeal[950], colors.darkTeal[900]]}
        style={styles.gradient}
      >
        <IslamicPattern />

        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.pineBlue[100]} />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Mosque Locator</Text>
            <Text style={styles.headerSubtitle}>Find Nearby Masājid</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Location Info Card */}
          {coords && (
            <GlassCard style={styles.locationCard}>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={24} color={colors.evergreen[500]} />
                <View style={styles.locationInfo}>
                  <Text style={styles.locationLabel}>Current Location</Text>
                  <Text style={styles.locationName}>{locationName || 'Current location'}</Text>
                  <Text style={styles.locationCoords}>
                    {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                  </Text>
                </View>
              </View>
              <Pressable onPress={handleRefresh} style={styles.refreshButton}>
                <Ionicons name="refresh" size={18} color={colors.pineBlue[100]} />
              </Pressable>
            </GlassCard>
          )}

          {/* Permission Error */}
          {permissionError && (
            <GlassCard style={styles.errorCard}>
              <View style={styles.errorContent}>
                <Ionicons name="location-outline" size={32} color={colors.pineBlue[300]} />
                <Text style={styles.errorTitle}>Location Permission Required</Text>
                <Text style={styles.errorMessage}>{permissionError}</Text>
                <Button
                  label="Enable Location"
                  onPress={handleRefresh}
                  variant="primary"
                  style={styles.errorButton}
                />
              </View>
            </GlassCard>
          )}

          {/* Loading State */}
          {isLoading && coords && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.evergreen[500]} />
              <Text style={styles.loadingText}>Finding nearby mosques...</Text>
            </View>
          )}

          {/* Fallback Notice */}
          {data?.isFallback && coords && (
            <GlassCard style={styles.fallbackNotice}>
              <View style={styles.fallbackContent}>
                <Ionicons name="cloud-offline" size={20} color={colors.pineBlue[300]} />
                <Text style={styles.fallbackText}>
                  Unable to load nearby mosques. Showing offline mode.
                </Text>
                <Pressable onPress={() => refetch()} style={styles.refreshButton}>
                  <Ionicons name="refresh" size={18} color={colors.evergreen[500]} />
                </Pressable>
              </View>
            </GlassCard>
          )}

          {/* Error State */}
          {error && coords && !data?.isFallback && (
            <GlassCard style={styles.errorCard}>
              <View style={styles.errorContent}>
                <Ionicons name="alert-circle" size={32} color={colors.pineBlue[300]} />
                <Text style={styles.errorTitle}>Unable to Load</Text>
                <Text style={styles.errorMessage}>
                  Failed to load nearby mosques. Please check your connection and try again.
                </Text>
                <Button
                  label="Retry"
                  onPress={() => refetch()}
                  variant="outline"
                  style={styles.errorButton}
                />
              </View>
            </GlassCard>
          )}

          {/* Mosques List */}
          {data?.mosques && data.mosques.length > 0 && (
            <View style={styles.mosquesList}>
              <View style={styles.sectionHeader}>
                <Ionicons name="business" size={20} color={colors.evergreen[500]} />
                <Text style={styles.sectionTitle}>
                  {data.mosques.length} Mosque{data.mosques.length !== 1 ? 's' : ''} Found
                </Text>
              </View>
              {data.mosques.map((mosque) => (
                <GlassCard key={mosque.id} style={styles.mosqueCard}>
                  <View style={styles.mosqueHeader}>
                    <View style={styles.mosqueIconContainer}>
                      <Ionicons name="business" size={24} color={colors.evergreen[500]} />
                    </View>
                    <View style={styles.mosqueInfo}>
                      <Text style={styles.mosqueName}>{mosque.name}</Text>
                      {mosque.address && (
                        <View style={styles.mosqueAddressRow}>
                          <Ionicons name="location" size={14} color={colors.pineBlue[300]} />
                          <Text style={styles.mosqueAddress}>{mosque.address}</Text>
                        </View>
                      )}
                      <Text style={styles.mosqueCoords}>
                        {mosque.lat.toFixed(4)}, {mosque.lng.toFixed(4)}
                      </Text>
                    </View>
                  </View>
                </GlassCard>
              ))}
            </View>
          )}

          {/* Empty State */}
          {!isLoading && !error && !data?.isFallback && coords && (!data?.mosques || data.mosques.length === 0) && (
            <GlassCard style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <Ionicons name="business-outline" size={48} color={colors.pineBlue[300]} />
                <Text style={styles.emptyTitle}>No Mosques Found</Text>
                <Text style={styles.emptyMessage}>
                  No mosques found nearby. Try refreshing or checking a different area.
                </Text>
                <Button
                  label="Refresh"
                  onPress={handleRefresh}
                  variant="outline"
                  style={styles.emptyButton}
                />
              </View>
            </GlassCard>
          )}

          <View style={styles.footer} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.darkTeal[950],
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkTeal[800],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.headingLg,
    fontSize: 22,
    color: colors.white,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  locationCard: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
    marginBottom: spacing.xs,
  },
  locationName: {
    ...typography.headingLg,
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  locationCoords: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.darkTeal[700],
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorCard: {
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  errorContent: {
    alignItems: 'center',
  },
  errorTitle: {
    ...typography.headingLg,
    fontSize: 18,
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  errorButton: {
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  loadingText: {
    ...typography.bodyMd,
    color: colors.pineBlue[300],
    marginTop: spacing.md,
  },
  mosquesList: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.headingLg,
    fontSize: 18,
    color: colors.white,
    fontWeight: '700',
  },
  mosqueCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  mosqueHeader: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  mosqueIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.darkTeal[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  mosqueInfo: {
    flex: 1,
  },
  mosqueName: {
    ...typography.headingLg,
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  mosqueAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  mosqueAddress: {
    ...typography.bodySm,
    color: colors.pineBlue[100],
    flex: 1,
  },
  mosqueCoords: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
  },
  emptyCard: {
    padding: spacing['2xl'],
    marginTop: spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.headingLg,
    fontSize: 20,
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.bodyMd,
    color: colors.pineBlue[300],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    width: '100%',
  },
  footer: {
    height: spacing['2xl'],
  },
  fallbackNotice: {
    padding: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.darkTeal[800],
  },
  fallbackContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fallbackText: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
    flex: 1,
  },
});

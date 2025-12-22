import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
  ScrollView,
  Alert,
  useSafeAreaInsets,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import {
  calculateQiblaBearing,
  getDirectionName,
  calculateDistanceToMecca,
  isAlignedWithQibla,
  normalizeAngle,
} from '../../services/qiblaUtils';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { IslamicPattern } from '../../components/ui/IslamicPattern';
import { QiblaTabs, QiblaTab } from '../../components/qibla/QiblaTabs';
import { QiblaCompassTab } from '../../components/qibla/QiblaCompassTab';
import { QiblaMapTab } from '../../components/qibla/QiblaMapTab';
import { QiblaInfoTab } from '../../components/qibla/QiblaInfoTab';

type LocationState = {
  coords: { lat: number; lng: number } | null;
  address: string | null;
  error: string | null;
  permissionStatus: 'granted' | 'denied' | 'checking';
};

export const QiblaCompassScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<QiblaTab>('compass');
  
  // Location state
  const [locationState, setLocationState] = useState<LocationState>({
    coords: null,
    address: null,
    error: null,
    permissionStatus: 'checking',
  });
  
  // Compass state
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
  const [heading, setHeading] = useState(0);
  const [smoothedHeading, setSmoothedHeading] = useState(0);
  const [isAligned, setIsAligned] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  
  // UI state
  const [infoSheetVisible, setInfoSheetVisible] = useState(false);
  const [calibrationSheetVisible, setCalibrationSheetVisible] = useState(false);
  const [troubleshootSheetVisible, setTroubleshootSheetVisible] = useState(false);
  
  // Animations
  const compassRotation = useRef(new Animated.Value(0)).current;
  const alignedGlow = useRef(new Animated.Value(0)).current;
  
  // Low-pass filter for smooth heading
  const headingFilter = useRef(0.15);
  const lastHeading = useRef(0);

  // Request location permission and get location
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Location.requestForegroundPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          setLocationState({
            coords: null,
            address: null,
            error: 'Location permission is required to calculate Qibla accurately.',
            permissionStatus: 'denied',
          });
          return;
        }

        setLocationState((prev) => ({ ...prev, permissionStatus: 'granted' }));

        let position;
        try {
          position = await Promise.race([
            Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Highest,
            }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Location timeout')), 15000)
            ),
          ]);
        } catch (positionError) {
          console.error('Error getting position:', positionError);
          setLocationState({
            coords: null,
            address: null,
            error: 'Failed to get your location. Please ensure GPS is enabled and try again.',
            permissionStatus: 'granted',
          });
          return;
        }

        if (!position || !position.coords) {
          setLocationState({
            coords: null,
            address: null,
            error: 'Invalid location data received. Please try again.',
            permissionStatus: 'granted',
          });
          return;
        }

        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (isNaN(coords.lat) || isNaN(coords.lng) || coords.lat === 0 || coords.lng === 0) {
          setLocationState({
            coords: null,
            address: null,
            error: 'Invalid location coordinates. Please try again.',
            permissionStatus: 'granted',
          });
          return;
        }

        Location.reverseGeocodeAsync(coords)
          .then((addresses) => {
            if (addresses && addresses.length > 0) {
              const addr = addresses[0];
              const city = addr.city || addr.subAdministrativeArea || addr.administrativeArea || 'Current location';
              setLocationState((prev) => ({ ...prev, address: city }));
            } else {
              setLocationState((prev) => ({ ...prev, address: 'Current location' }));
            }
          })
          .catch(() => {
            setLocationState((prev) => ({ ...prev, address: 'Current location' }));
          });

        setLocationState((prev) => ({
          ...prev,
          coords,
          error: null,
          permissionStatus: 'granted',
        }));

        const bearing = calculateQiblaBearing(coords.lat, coords.lng);
        setQiblaBearing(bearing);
        
        const dist = calculateDistanceToMecca(coords.lat, coords.lng);
        setDistance(dist);
      } catch (error) {
        console.error('Location initialization error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to get location. Please try again.';
        setLocationState({
          coords: null,
          address: null,
          error: errorMessage,
          permissionStatus: 'denied',
        });
      }
    };

    void initializeLocation();
  }, []);

  // Watch heading changes
  useEffect(() => {
    if (qiblaBearing === null) return;

    const subscription = Location.watchHeadingAsync((data) => {
      if (data.trueHeading >= 0) {
        const rawHeading = data.trueHeading;
        const smoothed = lastHeading.current + headingFilter.current * (rawHeading - lastHeading.current);
        lastHeading.current = smoothed;
        
        const normalizedHeading = normalizeAngle(smoothed);
        setHeading(normalizedHeading);
        setSmoothedHeading(normalizedHeading);

        const rotation = normalizeAngle(qiblaBearing - normalizedHeading);
        
        Animated.timing(compassRotation, {
          toValue: rotation,
          duration: 200,
          useNativeDriver: true,
        }).start();

        const aligned = isAlignedWithQibla(normalizedHeading, qiblaBearing, 5);
        setIsAligned(aligned);

        Animated.timing(alignedGlow, {
          toValue: aligned ? 1 : 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    });

    return () => {
      subscription.then((sub) => sub.remove());
    };
  }, [qiblaBearing, compassRotation, alignedGlow]);

  // Refresh location
  const handleRefreshLocation = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert('Permission Required', 'Location permission is required to refresh your location.');
          return;
        }
      }

      const position = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Location timeout')), 15000)
        ),
      ]);

      if (!position || !position.coords) {
        Alert.alert('Error', 'Invalid location data received. Please try again.');
        return;
      }

      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      if (isNaN(coords.lat) || isNaN(coords.lng) || coords.lat === 0 || coords.lng === 0) {
        Alert.alert('Error', 'Invalid location coordinates. Please try again.');
        return;
      }

      setLocationState((prev) => ({ ...prev, coords, error: null }));

      const bearing = calculateQiblaBearing(coords.lat, coords.lng);
      setQiblaBearing(bearing);
      
      const dist = calculateDistanceToMecca(coords.lat, coords.lng);
      setDistance(dist);
      
      Location.reverseGeocodeAsync(coords)
        .then((addresses) => {
          if (addresses && addresses.length > 0) {
            const addr = addresses[0];
            const city = addr.city || addr.subAdministrativeArea || addr.administrativeArea || 'Current location';
            setLocationState((prev) => ({ ...prev, address: city }));
          } else {
            setLocationState((prev) => ({ ...prev, address: 'Current location' }));
          }
        })
        .catch(() => {
          setLocationState((prev) => ({ ...prev, address: 'Current location' }));
        });
    } catch (error) {
      console.error('Refresh location error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh location. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  // Request location permission again
  const handleRequestPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationState((prev) => ({ ...prev, permissionStatus: 'granted' }));

        try {
          const position = await Promise.race([
            Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Highest,
            }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Location timeout')), 15000)
            ),
          ]);

          if (!position || !position.coords) {
            setLocationState((prev) => ({
              ...prev,
              error: 'Invalid location data. Please try again.',
            }));
            return;
          }

          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          if (isNaN(coords.lat) || isNaN(coords.lng) || coords.lat === 0 || coords.lng === 0) {
            setLocationState((prev) => ({
              ...prev,
              error: 'Invalid location coordinates. Please try again.',
            }));
            return;
          }

          setLocationState((prev) => ({
            ...prev,
            coords,
            error: null,
            permissionStatus: 'granted',
          }));

          const bearing = calculateQiblaBearing(coords.lat, coords.lng);
          setQiblaBearing(bearing);

          const dist = calculateDistanceToMecca(coords.lat, coords.lng);
          setDistance(dist);

          Location.reverseGeocodeAsync(coords)
            .then((addresses) => {
              if (addresses && addresses.length > 0) {
                const addr = addresses[0];
                const city = addr.city || addr.subAdministrativeArea || addr.administrativeArea || 'Current location';
                setLocationState((prev) => ({ ...prev, address: city }));
              } else {
                setLocationState((prev) => ({ ...prev, address: 'Current location' }));
              }
            })
            .catch(() => {
              setLocationState((prev) => ({ ...prev, address: 'Current location' }));
            });
        } catch (positionError) {
          console.error('Error getting position after permission:', positionError);
          setLocationState((prev) => ({
            ...prev,
            error: 'Failed to get your location. Please ensure GPS is enabled and try again.',
          }));
        }
      } else {
        setLocationState((prev) => ({
          ...prev,
          error: 'Location permission was denied. Please enable it in your device settings.',
          permissionStatus: 'denied',
        }));
      }
    } catch (error) {
      console.error('Permission request error:', error);
      setLocationState((prev) => ({
        ...prev,
        error: 'Failed to request location permission. Please try again.',
      }));
    }
  };

  // Compass rotation interpolation
  const rotationInterpolate = compassRotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

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
          <Text style={styles.headerTitle}>Qibla Direction</Text>
          <View style={styles.headerActions}>
            <Pressable onPress={() => setInfoSheetVisible(true)} style={styles.headerActionButton}>
              <Ionicons name="help-circle-outline" size={20} color={colors.pineBlue[100]} />
            </Pressable>
            <Pressable onPress={handleRefreshLocation} style={styles.headerActionButton}>
              <Ionicons name="refresh" size={20} color={colors.pineBlue[100]} />
            </Pressable>
          </View>
        </View>

        {/* Tabs */}
        <QiblaTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(160, insets.bottom + 140) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Info Strip */}
          {locationState.permissionStatus === 'granted' && qiblaBearing !== null && (
            <GlassCard style={styles.infoStrip}>
              <View style={styles.infoStripContent}>
                <View style={styles.infoItem}>
                  <Ionicons name="location" size={18} color={colors.evergreen[500]} />
                  <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>Location</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {locationState.address || 'Current location'}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoDivider} />

                <View style={styles.infoItem}>
                  <Ionicons name="navigate" size={18} color={colors.pineBlue[300]} />
                  <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>Qibla</Text>
                    <Text style={styles.infoValue}>
                      {Math.round(qiblaBearing)}° {getDirectionName(qiblaBearing)}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoDivider} />

                <View style={styles.infoItem}>
                  <Ionicons name="compass" size={18} color={colors.pineBlue[300]} />
                  <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>Heading</Text>
                    <Text style={styles.infoValue}>
                      {Math.round(smoothedHeading)}° {getDirectionName(smoothedHeading)}
                    </Text>
                  </View>
                </View>
              </View>
            </GlassCard>
          )}

          {/* Tab Content */}
          {activeTab === 'compass' && (
            <QiblaCompassTab
              qiblaBearing={qiblaBearing}
              heading={heading}
              smoothedHeading={smoothedHeading}
              isAligned={isAligned}
              distance={distance}
              compassRotation={rotationInterpolate}
              alignedGlow={alignedGlow}
            />
          )}

          {activeTab === 'map' && (
            <QiblaMapTab
              userLocation={locationState.coords}
              onLocationRefresh={handleRefreshLocation}
              distance={distance}
              bearing={qiblaBearing}
            />
          )}

          {activeTab === 'info' && (
            <QiblaInfoTab
              userLocation={locationState.coords}
              bearing={qiblaBearing}
              distance={distance}
              heading={smoothedHeading}
            />
          )}

          {/* Permission Denied State */}
          {locationState.permissionStatus === 'denied' && (
            <GlassCard style={styles.errorCard}>
              <View style={styles.errorContent}>
                <Ionicons name="location-outline" size={48} color={colors.pineBlue[300]} />
                <Text style={styles.errorTitle}>Location Permission Required</Text>
                <Text style={styles.errorMessage}>
                  {locationState.error ||
                    'Enable location to calculate Qibla direction accurately.'}
                </Text>
                <View style={styles.errorActions}>
                  <Button
                    label="Enable Location"
                    onPress={handleRequestPermission}
                    variant="primary"
                    style={styles.errorButton}
                  />
                  <Button
                    label="Set Location Manually"
                    onPress={() => {
                      Alert.alert('Coming Soon', 'Manual location selection will be available soon.');
                    }}
                    variant="outline"
                    style={styles.errorButton}
                  />
                </View>
              </View>
            </GlassCard>
          )}

          {/* Guidance & Calibration Section (only for compass tab) */}
          {activeTab === 'compass' && qiblaBearing !== null && (
            <View style={styles.guidanceSection}>
              <GlassCard style={styles.guidanceCard}>
                <Text style={styles.guidanceTitle}>Compass Tips</Text>
                <View style={styles.guidanceTips}>
                  <View style={styles.tipItem}>
                    <Ionicons name="phone-portrait-outline" size={20} color={colors.evergreen[500]} />
                    <Text style={styles.tipText}>Hold phone flat and level</Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons name="magnet-outline" size={20} color={colors.evergreen[500]} />
                    <Text style={styles.tipText}>Keep away from magnets and metal</Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons name="refresh-outline" size={20} color={colors.evergreen[500]} />
                    <Text style={styles.tipText}>Move phone in a figure-8 to calibrate</Text>
                  </View>
                </View>

                <View style={styles.guidanceActions}>
                  <Button
                    label="Calibrate Compass"
                    onPress={() => setCalibrationSheetVisible(true)}
                    variant="primary"
                    icon={<Ionicons name="refresh" size={18} color={colors.darkTeal[950]} />}
                    style={styles.guidanceButton}
                  />
                  <Button
                    label="Troubleshoot"
                    onPress={() => setTroubleshootSheetVisible(true)}
                    variant="outline"
                    icon={<Ionicons name="help-circle-outline" size={18} color={colors.pineBlue[100]} />}
                    style={styles.guidanceButton}
                  />
                </View>
              </GlassCard>
            </View>
          )}
        </ScrollView>

        {/* Info Bottom Sheet */}
        <BottomSheet
          visible={infoSheetVisible}
          onClose={() => setInfoSheetVisible(false)}
          title="Qibla Compass Guide"
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sheetText}>
              The Qibla Compass helps you find the direction to the Kaaba in Mecca for prayer.
            </Text>
            <Text style={styles.sheetText}>
              • The green needle points toward Qibla{'\n'}
              • The Kaaba icon shows the target direction{'\n'}
              • When aligned, you'll see an "Aligned" badge{'\n'}
              • Keep your phone flat and away from metal objects
            </Text>
            <Text style={styles.sheetText}>
              For best accuracy, calibrate your compass regularly by moving your phone in a figure-8 motion.
            </Text>
          </ScrollView>
        </BottomSheet>

        {/* Calibration Bottom Sheet */}
        <BottomSheet
          visible={calibrationSheetVisible}
          onClose={() => setCalibrationSheetVisible(false)}
          title="Calibrate Compass"
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.calibrationSteps}>
              <View style={styles.calibrationStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>
                  Hold your phone flat in front of you
                </Text>
              </View>
              <View style={styles.calibrationStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>
                  Move your phone in a horizontal figure-8 motion
                </Text>
              </View>
              <View style={styles.calibrationStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>
                  Repeat 5-10 times slowly and smoothly
                </Text>
              </View>
              <View style={styles.calibrationStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <Text style={styles.stepText}>
                  Return to a flat, level position
                </Text>
              </View>
            </View>
            <Text style={styles.sheetText}>
              Calibration improves compass accuracy by removing magnetic interference.
            </Text>
          </ScrollView>
        </BottomSheet>

        {/* Troubleshoot Bottom Sheet */}
        <BottomSheet
          visible={troubleshootSheetVisible}
          onClose={() => setTroubleshootSheetVisible(false)}
          title="Troubleshooting"
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.troubleshootItem}>
              <Text style={styles.troubleshootTitle}>Compass not working?</Text>
              <Text style={styles.sheetText}>
                • Move away from metal objects, magnets, or electronic devices{'\n'}
                • Ensure location services are enabled{'\n'}
                • Try calibrating the compass{'\n'}
                • Restart the app if issues persist
              </Text>
            </View>
            <View style={styles.troubleshootItem}>
              <Text style={styles.troubleshootTitle}>Inaccurate direction?</Text>
              <Text style={styles.sheetText}>
                • Hold phone flat and level{'\n'}
                • Avoid magnetic interference{'\n'}
                • Calibrate regularly{'\n'}
                • Use in an open area when possible
              </Text>
            </View>
            <View style={styles.troubleshootItem}>
              <Text style={styles.troubleshootTitle}>Location issues?</Text>
              <Text style={styles.sheetText}>
                • Check location permissions in settings{'\n'}
                • Ensure GPS is enabled{'\n'}
                • Try refreshing your location{'\n'}
                • Use manual location if needed
              </Text>
            </View>
          </ScrollView>
        </BottomSheet>
      </LinearGradient>
    </SafeAreaView>
  );
};

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
    paddingBottom: spacing.md,
    zIndex: 10,
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
  headerTitle: {
    ...typography.headingLg,
    fontSize: 22,
    color: colors.white,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkTeal[800],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  infoStrip: {
    marginBottom: spacing.xl,
    padding: spacing.md,
  },
  infoStripContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  infoLabel: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
    marginBottom: 2,
  },
  infoValue: {
    ...typography.bodySm,
    fontSize: 13,
    color: colors.pineBlue[100],
    fontWeight: '600',
  },
  infoDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: spacing.sm,
  },
  errorCard: {
    marginBottom: spacing.xl,
    padding: spacing.xl,
  },
  errorContent: {
    alignItems: 'center',
  },
  errorTitle: {
    ...typography.headingLg,
    fontSize: 20,
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  errorActions: {
    width: '100%',
    gap: spacing.md,
  },
  errorButton: {
    width: '100%',
  },
  guidanceSection: {
    marginTop: spacing.lg,
  },
  guidanceCard: {
    padding: spacing.lg,
  },
  guidanceTitle: {
    ...typography.headingLg,
    fontSize: 18,
    color: colors.white,
    marginBottom: spacing.md,
  },
  guidanceTips: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  tipText: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    flex: 1,
  },
  guidanceActions: {
    gap: spacing.md,
  },
  guidanceButton: {
    width: '100%',
  },
  sheetText: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  calibrationSteps: {
    marginBottom: spacing.lg,
  },
  calibrationStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.evergreen[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    ...typography.buttonMd,
    color: colors.darkTeal[950],
    fontWeight: '700',
  },
  stepText: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    flex: 1,
    lineHeight: 22,
  },
  troubleshootItem: {
    marginBottom: spacing.xl,
  },
  troubleshootTitle: {
    ...typography.headingLg,
    fontSize: 18,
    color: colors.white,
    marginBottom: spacing.sm,
  },
});

export default QiblaCompassScreen;

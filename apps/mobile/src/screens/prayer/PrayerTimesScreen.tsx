import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Animated,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { usePrayerTimesToday, useNextPrayer, useHijriDate } from '../../hooks/usePrayerData';
import { useLocation } from '../../hooks/usePrayerData';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EnhancedNextPrayerCard } from '../../components/prayer/EnhancedNextPrayerCard';
import * as SecureStore from 'expo-secure-store';
import { notificationService } from '../../services/notificationService';
import { locationService } from '../../services/locationService';
import { usePrayerTimes } from '../../hooks/usePrayerData';

const NOTIFICATION_PREFS_KEY = 'prayer_notification_prefs';

// Tomorrow's Prayer Times Component
const TomorrowPrayerTimes: React.FC<{ coords: { lat: number; lng: number } }> = ({ coords }) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  // Fetch tomorrow's prayer times (using same API with tomorrow's date if supported)
  // For now, we'll show today's times as approximation
  const { data: prayerData } = usePrayerTimes(coords);
  
  const tomorrowTimes = React.useMemo(() => {
    if (!prayerData?.timings) return null;
    
    // Prayer times typically vary by 1-2 minutes per day
    // This is an approximation - in production, you'd fetch tomorrow's date from API
    const timings = prayerData.timings;
    const adjustments: Record<string, number> = {
      Fajr: -1, // Usually gets earlier
      Dhuhr: 0, // Stays roughly same
      Asr: 1, // Gets slightly later
      Maghrib: 1, // Gets slightly later
      Isha: 1, // Gets slightly later
    };
    
    return [
      { name: 'Fajr', time: adjustTime(timings.Fajr, adjustments.Fajr) },
      { name: 'Dhuhr', time: adjustTime(timings.Dhuhr, adjustments.Dhuhr) },
      { name: 'Asr', time: adjustTime(timings.Asr, adjustments.Asr) },
      { name: 'Maghrib', time: adjustTime(timings.Maghrib, adjustments.Maghrib) },
      { name: 'Isha', time: adjustTime(timings.Isha, adjustments.Isha) },
    ];
  }, [prayerData]);
  
  if (!tomorrowTimes) {
    return (
      <GlassCard style={styles.tomorrowCard}>
        <Text style={styles.tomorrowNote}>Loading tomorrow's times...</Text>
      </GlassCard>
    );
  }
  
  return (
    <GlassCard style={styles.tomorrowCard}>
      <View style={styles.tomorrowGrid}>
        {tomorrowTimes.map((prayer) => (
          <View key={prayer.name} style={styles.tomorrowPrayerItem}>
            <Text style={styles.tomorrowPrayerName}>{prayer.name}</Text>
            <Text style={styles.tomorrowPrayerTime}>{prayer.time}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.tomorrowNote}>
        * Times are approximate. Actual times may vary slightly.
      </Text>
    </GlassCard>
  );
};

// Helper to adjust time by minutes
const adjustTime = (timeStr: string, minutes: number): string => {
  const [hours, mins] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, mins + minutes, 0, 0);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export const PrayerTimesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { coords, location, isLoading: locationLoading, refreshLocation } = useLocation();
  const { data: prayerData, isLoading: prayerDataLoading } = usePrayerTimes(coords);
  const prayerTimes = usePrayerTimesToday();
  const nextPrayerData = useNextPrayer(coords);
  const nextPrayer = nextPrayerData ? { name: nextPrayerData.name, time: nextPrayerData.time } : null;
  const countdown = nextPrayerData?.countdown || '--:--';
  const hijriDate = useHijriDate();
  const [notifications, setNotifications] = useState({
    Fajr: true,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true,
  });
  const [locationGlow, setLocationGlow] = useState(false);
  const locationIconGlow = useRef(new Animated.Value(0)).current;

  // Load saved notification preferences
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const stored = await SecureStore.getItemAsync(NOTIFICATION_PREFS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as typeof notifications;
          setNotifications(prev => ({ ...prev, ...parsed }));
        }
      } catch {
        // ignore
      }
    };
    void loadPrefs();
  }, []);

  // Animate location icon glow when location is resolved
  useEffect(() => {
    if (location && !locationLoading) {
      setLocationGlow(true);
      Animated.sequence([
        Animated.timing(locationIconGlow, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(locationIconGlow, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [location, locationLoading, locationIconGlow]);

  const handleEnableLocation = async () => {
    try {
      const granted = await locationService.requestPermission();
      if (granted) {
        // Refresh location after permission is granted
        refreshLocation();
      }
    } catch (error) {
      console.error('Failed to request location permission:', error);
    }
  };

  const handleSetLocationManually = () => {
    navigation.navigate('PrayerSettings' as never);
  };

  // Persist preferences and schedule notifications when times or toggles change
  useEffect(() => {
    const updateNotifications = async () => {
      if (!prayerTimes || prayerTimes.length === 0) return;

      // Save preferences
      await SecureStore.setItemAsync(NOTIFICATION_PREFS_KEY, JSON.stringify(notifications));

      // Cancel existing scheduled notifications
      await notificationService.cancelPrayerNotifications();

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      for (const pt of prayerTimes) {
        const enabled = notifications[pt.name as keyof typeof notifications];
        if (!enabled || pt.time === '--:--') continue;

        const dateForPrayer = buildPrayerDate(todayStr, pt.time, now);
        await notificationService.schedulePrayerNotification({
          prayerName: pt.name,
          time: dateForPrayer,
          enabled: true,
        });
      }
    };

    void updateNotifications();
  }, [prayerTimes, notifications]);

  const isLoading = locationLoading || prayerDataLoading;
  
  if (isLoading && !prayerData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Skeleton width="100%" height={60} />
          <Skeleton width="100%" height={200} style={{ marginTop: spacing.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={[colors.darkTeal[950], colors.darkTeal[900]]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.pineBlue[100]} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Prayer Times</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('PrayerSettings' as never)}
              style={styles.settingsButton}
            >
              <Ionicons name="settings-outline" size={24} color={colors.pineBlue[100]} />
            </TouchableOpacity>
          </View>

          {/* Location & Date */}
          <GlassCard style={styles.locationCard}>
            <View style={styles.locationRow}>
              <View style={styles.locationIconWrapper}>
                {locationGlow && (
                  <Animated.View
                    style={[
                      styles.locationIconGlow,
                      {
                        opacity: locationIconGlow,
                      },
                    ]}
                  />
                )}
                <Ionicons
                  name="location"
                  size={20}
                  color={location ? colors.evergreen[500] : colors.pineBlue[300]}
                />
              </View>
              <View style={styles.locationText}>
                <Text style={styles.locationLabel}>Location</Text>
                {locationLoading || !location ? (
                  <View style={styles.locationLoadingContainer}>
                    <Skeleton width={120} height={16} borderRadius={4} />
                  </View>
                ) : (
                  <Text style={styles.locationValue}>{location}</Text>
                )}
              </View>
              <TouchableOpacity onPress={handleSetLocationManually}>
                <Ionicons name="create-outline" size={20} color={colors.pineBlue[300]} />
              </TouchableOpacity>
            </View>
            {!location && !locationLoading && (
              <Pressable onPress={handleSetLocationManually} style={styles.manualLocationLink}>
                <Text style={styles.manualLocationText}>Set location manually</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.evergreen[500]} />
              </Pressable>
            )}
            {hijriDate && (
              <Text style={styles.hijriDate}>{hijriDate.formatted}</Text>
            )}
          </GlassCard>

          {/* Next Prayer Hero */}
          {nextPrayer ? (
            <EnhancedNextPrayerCard
              prayerName={nextPrayer.name}
              countdown={countdown}
              hijriDate={hijriDate?.formatted}
              compact={true}
            />
          ) : (
            // Placeholder Next Prayer card when no data
            <GlassCard style={[styles.nextPrayerCard, styles.nextPrayerPlaceholder]}>
              <View style={styles.nextPrayerPlaceholderContent}>
                <Skeleton width={100} height={14} borderRadius={4} style={{ marginBottom: spacing.sm }} />
                <Skeleton width={140} height={28} borderRadius={6} style={{ marginBottom: spacing.sm }} />
                <Skeleton width={80} height={20} borderRadius={4} />
              </View>
            </GlassCard>
          )}

          {/* Today's Prayer Times */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Prayer Times</Text>
            {prayerTimes && prayerTimes.length > 0 ? (
              prayerTimes.map((prayer, index) => {
                const isCurrentPrayer = nextPrayer?.name === prayer.name;
                return (
                  <AnimatedPrayerCard
                    key={prayer.name}
                    index={index}
                    name={prayer.name}
                    time={prayer.time}
                    enabled={notifications[prayer.name as keyof typeof notifications]}
                    onToggle={value =>
                      setNotifications({ ...notifications, [prayer.name]: value })
                    }
                    isCurrent={isCurrentPrayer}
                  />
                );
              })
            ) : (
              // Show loading state while fetching prayer times
              <View style={styles.loadingPrayerTimes}>
                {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((name, index) => (
                  <GlassCard key={name} style={styles.prayerCard}>
                    <View style={styles.prayerRow}>
                      <View style={styles.prayerInfo}>
                        <Skeleton width={80} height={18} borderRadius={4} style={{ marginBottom: spacing.xs }} />
                        <Skeleton width={100} height={20} borderRadius={4} />
                      </View>
                      <Skeleton width={50} height={30} borderRadius={15} />
                    </View>
                  </GlassCard>
                ))}
              </View>
            )}
          </View>

          {/* Prayer Reminders Summary */}
          {prayerTimes && prayerTimes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Prayer Reminders</Text>
              <GlassCard style={styles.remindersCard}>
                <View style={styles.remindersContent}>
                  <View style={styles.remindersHeader}>
                    <Ionicons name="notifications-outline" size={20} color={colors.evergreen[500]} />
                    <Text style={styles.remindersTitle}>Notification Settings</Text>
                  </View>
                  <View style={styles.remindersList}>
                    {Object.entries(notifications).map(([prayer, enabled]) => (
                      <View key={prayer} style={styles.reminderItem}>
                        <Text style={styles.reminderPrayerName}>{prayer}</Text>
                        <View style={styles.reminderStatus}>
                          <Ionicons
                            name={enabled ? 'checkmark-circle' : 'close-circle-outline'}
                            size={18}
                            color={enabled ? colors.evergreen[500] : colors.pineBlue[300]}
                          />
                          <Text
                            style={[
                              styles.reminderStatusText,
                              enabled && styles.reminderStatusActive,
                            ]}
                          >
                            {enabled ? 'Enabled' : 'Disabled'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                  <Pressable
                    onPress={() => navigation.navigate('PrayerSettings' as never)}
                    style={styles.remindersAction}
                  >
                    <Text style={styles.remindersActionText}>Manage notifications</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.evergreen[500]} />
                  </Pressable>
                </View>
              </GlassCard>
            </View>
          )}

          {/* Tomorrow's Prayer Times Preview */}
          {prayerTimes && prayerTimes.length > 0 && coords && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Tomorrow's Prayer Times</Text>
                <Text style={styles.sectionSubtitle}>
                  {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <TomorrowPrayerTimes coords={coords} />
            </View>
          )}

          {/* Prayer Tip Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prayer Reminder</Text>
            <GlassCard style={styles.tipCard}>
              <View style={styles.tipContent}>
                <View style={styles.tipIconWrapper}>
                  <Ionicons name="bulb-outline" size={24} color={colors.evergreen[500]} />
                </View>
                <Text style={styles.tipTitle}>The Importance of Punctuality</Text>
                <Text style={styles.tipText}>
                  "The best of deeds is to perform Salah at its appointed time." - Prophet Muhammad (SAW)
                </Text>
                <Text style={styles.tipSubtext}>
                  Set reminders for each prayer to maintain consistency in your worship.
                </Text>
              </View>
            </GlassCard>
          </View>

          {/* Prayer Tools Section */}
          <View style={styles.prayerToolsSection}>
            <Text style={styles.sectionTitle}>Prayer tools</Text>
            <View style={styles.prayerToolsGrid}>
              <Pressable
                onPress={() => navigation.navigate('QiblaCompass' as never)}
                style={({ pressed }) => [
                  styles.toolCard,
                  pressed && styles.toolCardPressed,
                ]}
              >
                <View style={styles.toolIconWrapper}>
                  <Ionicons name="compass-outline" size={24} color={colors.evergreen[500]} />
                </View>
                <Text style={styles.toolLabel}>Qibla Compass</Text>
                <Text style={styles.toolDescription}>Find the direction of the Kaaba</Text>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate('Mosques' as never)}
                style={({ pressed }) => [
                  styles.toolCard,
                  pressed && styles.toolCardPressed,
                ]}
              >
                <View style={styles.toolIconWrapper}>
                  <Ionicons name="navigate-outline" size={24} color={colors.evergreen[500]} />
                </View>
                <Text style={styles.toolLabel}>Find Mosques</Text>
                <Text style={styles.toolDescription}>Locate nearby masajid</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 200 : 190, // Space for tab bar (74) + bottom spacing (20/14) + FAB (60) + extra padding
  },
  container: {
    flex: 1,
    padding: spacing.lg,
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
  },
  headerTitle: {
    ...typography.headingLg,
    fontSize: 22,
    color: colors.white,
    fontWeight: '700',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkTeal[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  locationIconWrapper: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  locationIconGlow: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.evergreen[500],
    opacity: 0.3,
  },
  locationText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  locationLabel: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
    marginBottom: 2,
  },
  locationLoadingContainer: {
    marginTop: 2,
  },
  locationValue: {
    ...typography.bodyMd,
    color: colors.white,
    fontWeight: '600',
  },
  manualLocationLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
  manualLocationText: {
    ...typography.bodySm,
    color: colors.evergreen[500],
    marginRight: spacing.xs,
  },
  hijriDate: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    marginTop: spacing.xs,
  },
  nextPrayerCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.xl,
    minHeight: 180,
  },
  nextPrayerGradient: {
    borderRadius: 20,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextPrayerLabel: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    marginBottom: spacing.xs,
  },
  nextPrayerName: {
    ...typography.headingXl,
    fontSize: 32,
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  nextPrayerTime: {
    ...typography.headingLg,
    fontSize: 24,
    color: colors.evergreen[500],
    fontWeight: '600',
  },
  nextPrayerPlaceholder: {
    opacity: 0.6,
  },
  nextPrayerPlaceholderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.headingMd,
    color: colors.white,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  sectionSubtitle: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    fontSize: 12,
  },
  prayerCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 18,
  },
  prayerCardCurrent: {
    borderWidth: 1,
    borderColor: 'rgba(8, 247, 116, 0.3)',
    shadowColor: colors.evergreen[500],
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  currentPrayerAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.evergreen[500],
  },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prayerIconWrapper: {
    marginRight: spacing.sm,
  },
  prayerIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  prayerIconBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  prayerInfo: {
    flex: 1,
  },
  prayerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  prayerName: {
    ...typography.headingMd,
    fontSize: 18,
    color: colors.white,
    fontWeight: '600',
  },
  prayerNameCurrent: {
    color: colors.white,
    fontWeight: '700',
  },
  currentBadge: {
    backgroundColor: colors.evergreen[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.darkTeal[950],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  prayerTime: {
    ...typography.bodyLg,
    fontSize: 20,
    color: colors.evergreen[500],
    fontWeight: '600',
  },
  prayerTimeCurrent: {
    color: colors.evergreen[500],
    fontWeight: '700',
  },
  loadingPrayerTimes: {
    gap: spacing.md,
  },
  prayerToolsSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  prayerToolsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  toolCard: {
    flex: 1,
    backgroundColor: colors.darkTeal[800],
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
  },
  toolCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  toolIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(8, 247, 116, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  toolLabel: {
    ...typography.bodyMd,
    color: colors.white,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  toolDescription: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
    textAlign: 'center',
  },
  remindersCard: {
    padding: spacing.lg,
  },
  remindersContent: {
    gap: spacing.md,
  },
  remindersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  remindersTitle: {
    ...typography.headingSm,
    color: colors.white,
    fontWeight: '600',
  },
  remindersList: {
    gap: spacing.sm,
  },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  reminderPrayerName: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
  },
  reminderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  reminderStatusText: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    fontSize: 12,
  },
  reminderStatusActive: {
    color: colors.evergreen[500],
  },
  remindersAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  remindersActionText: {
    ...typography.bodySm,
    color: colors.evergreen[500],
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  tomorrowCard: {
    padding: spacing.lg,
  },
  tomorrowGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  tomorrowPrayerItem: {
    width: '48%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.darkTeal[700],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tomorrowPrayerName: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    fontSize: 11,
    marginBottom: spacing.xs,
  },
  tomorrowPrayerTime: {
    ...typography.bodyMd,
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  tomorrowNote: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    fontSize: 10,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  tipCard: {
    padding: spacing.lg,
  },
  tipContent: {
    gap: spacing.sm,
  },
  tipIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(8, 247, 116, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  tipTitle: {
    ...typography.headingSm,
    color: colors.white,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  tipText: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  tipSubtext: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    fontSize: 12,
  },
});

const buildPrayerDate = (dateStr: string, timeStr: string, now: Date): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const base = new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
  if (base <= now) {
    // Schedule for tomorrow if today's time has passed
    const tomorrow = new Date(base);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  return base;
};

type AnimatedPrayerCardProps = {
  index: number;
  name: string;
  time: string;
  enabled: boolean;
  onToggle: (value: boolean) => void;
  isCurrent?: boolean;
};

const AnimatedPrayerCard: React.FC<AnimatedPrayerCardProps> = ({
  index,
  name,
  time,
  enabled,
  onToggle,
  isCurrent = false,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, translateY, scaleAnim]);

  // Pulse animation for current prayer icon
  useEffect(() => {
    if (isCurrent) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconPulse, {
            toValue: 1.15,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(iconPulse, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [isCurrent, iconPulse]);

  const prayerIconMap: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
    Fajr: { name: 'sunny', color: '#FFD700' },
    Dhuhr: { name: 'sunny', color: '#FFA500' },
    Asr: { name: 'sunny', color: '#FF8C00' },
    Maghrib: { name: 'sunny', color: '#FF6347' },
    Isha: { name: 'moon-outline', color: '#9370DB' },
  };

  const prayerIcon = prayerIconMap[name] || { name: 'time-outline' as keyof typeof Ionicons.glyphMap, color: colors.evergreen[500] };

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }, { scale: scaleAnim }],
      }}
    >
      <GlassCard style={[styles.prayerCard, isCurrent && styles.prayerCardCurrent]}>
        {isCurrent && (
          <LinearGradient
            colors={['rgba(8,247,116,0.2)', 'rgba(8,247,116,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}
        {isCurrent && <View style={styles.currentPrayerAccent} />}
        <View style={styles.prayerRow}>
          <View style={styles.prayerIconWrapper}>
            <Animated.View
              style={[
                styles.prayerIconContainer,
                isCurrent && {
                  transform: [{ scale: iconPulse }],
                },
              ]}
            >
              <View
                style={[
                  styles.prayerIconBackground,
                  { backgroundColor: `${prayerIcon.color}20` },
                  isCurrent && { backgroundColor: `${prayerIcon.color}30` },
                ]}
              >
                <Ionicons
                  name={prayerIcon.name as any}
                  size={24}
                  color={prayerIcon.color}
                />
              </View>
            </Animated.View>
          </View>
          <View style={styles.prayerInfo}>
            <View style={styles.prayerNameRow}>
              <Text style={[styles.prayerName, isCurrent && styles.prayerNameCurrent]}>
                {name}
              </Text>
              {isCurrent && (
                <View style={[styles.currentBadge, { marginLeft: spacing.xs }]}>
                  <Text style={styles.currentBadgeText}>Now</Text>
                </View>
              )}
            </View>
            <Text style={[styles.prayerTime, isCurrent && styles.prayerTimeCurrent]}>
              {time}
            </Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={onToggle}
            trackColor={{ false: colors.darkTeal[700], true: colors.evergreen[500] }}
            thumbColor={colors.white}
            ios_backgroundColor={colors.darkTeal[700]}
          />
        </View>
      </GlassCard>
    </Animated.View>
  );
};

export default PrayerTimesScreen;


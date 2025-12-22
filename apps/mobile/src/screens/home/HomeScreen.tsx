import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import GlassCard from '../../components/ui/GlassCard';
import { IconTile } from '../../components/ui/IconTile';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { EnhancedNextPrayerCard } from '../../components/prayer/EnhancedNextPrayerCard';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import {
  useNextPrayer,
  usePrayerTimesToday,
  useHijriDate,
} from '../../hooks/usePrayerData';
import { useCurrentUser } from '../../hooks/useAuth';
import { useUnreadCount } from '../../hooks/useNotifications';
import { useUpcomingEvents, useCurrentEvents } from '../../hooks/useEvents';
import { EventCard } from '../../components/events/EventCard';

type LastRead = {
  surah: string;
  ayahRange: string;
};

type WazifaSummary = {
  completionPercent: number;
};

type LazimSummary = {
  currentStreak: number;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;
const IS_VERY_SMALL_DEVICE = SCREEN_WIDTH < 340;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const unreadCount = useUnreadCount();
  const upcomingEvents = useUpcomingEvents();
  const currentEvents = useCurrentEvents();

  const [countdown, setCountdown] = useState<string>('');
  const { data: currentUser } = useCurrentUser();
  const nextPrayer = useNextPrayer();
  const prayerTimes = usePrayerTimesToday();
  const hijriDate = useHijriDate();
  const lastRead = getLastRead();
  const wazifa = useWazifaSummary();
  const lazim = useLazimSummary();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateYAnim]);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = nextPrayer.time.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown('Starting now');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      setCountdown(`${hours}h ${minutes}m`);
    };

    updateCountdown();
    const id = setInterval(updateCountdown, 60_000);
    return () => clearInterval(id);
  }, [nextPrayer.time]);

  const handleViewAllTimes = () => {
    navigation.getParent()?.navigate('PrayerTab');
    navigation.getParent()?.navigate('PrayerTab', { screen: 'PrayerTimes' });
  };

  const handleQibla = () => {
    navigation.getParent()?.navigate('PrayerTab');
    navigation.getParent()?.navigate('PrayerTab', { screen: 'QiblaCompass' });
  };

  return (
    <View style={styles.root}>
      {/* Background gradient - dark teal */}
      <LinearGradient
        colors={[colors.darkTeal[950], colors.darkTeal[900]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Geometric pattern watermark */}
      <View style={styles.patternContainer}>
        <Svg height="100%" width="100%" viewBox="0 0 200 200" style={styles.patternSvg}>
          {Array.from({ length: 4 }).map((_, i) =>
            Array.from({ length: 4 }).map((__, j) => (
              <Path
                key={`${i}-${j}`}
                d="M50 10 L60 30 L80 30 L65 45 L70 65 L50 55 L30 65 L35 45 L20 30 L40 30 Z"
                fill={colors.evergreen[500]}
                opacity={0.06}
                transform={`translate(${i * 50}, ${j * 50}) scale(0.7)`}
              />
            )),
          )}
        </Svg>
      </View>

      {/* Mosque arch behind hero */}
      <View style={styles.archContainer}>
        <Svg height="100%" width="100%" viewBox="0 0 400 400">
          <Path
            d="M 50 380 Q 200 80 350 380"
            stroke={colors.evergreen[500]}
            strokeWidth={2}
            opacity={0.06}
            fill="none"
          />
        </Svg>
      </View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greetingTop}>
                Assalamu alaikum
                {currentUser?.name ? `, ${currentUser.name}` : currentUser?.email ? `, ${currentUser.email.split('@')[0]}` : ''}
              </Text>
            </View>
            <View style={styles.headerIcons}>
              <Pressable
                style={styles.headerIcon}
                onPress={() => navigation.navigate('Notifications' as never)}
              >
                <Ionicons name="notifications-outline" size={20} color={colors.pineBlue[100]} />
                {unreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </Pressable>
              <Pressable
                style={styles.headerIcon}
                onPress={() => navigation.navigate('Search' as never)}
              >
                <Ionicons name="search-outline" size={20} color={colors.pineBlue[100]} />
              </Pressable>
              <Pressable
                style={styles.headerIcon}
                onPress={() => navigation.navigate('AllFeatures' as never)}
              >
                <Ionicons name="grid-outline" size={20} color={colors.pineBlue[100]} />
              </Pressable>
            </View>
          </View>

          {/* Search Bar */}
          <Pressable
            onPress={() => navigation.navigate('Search' as never)}
            style={styles.searchBarContainer}
          >
            <View style={styles.searchBarPlaceholder}>
              <Ionicons name="search-outline" size={18} color={colors.pineBlue[300]} />
              <Text style={styles.searchBarPlaceholderText}>
                Search Quran, Duas, Scholars, Tijaniyah...
              </Text>
            </View>
          </Pressable>

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: translateYAnim }],
            }}
          >
            {/* Next Prayer Hero Card */}
            <EnhancedNextPrayerCard
              prayerName={nextPrayer.name}
              countdown={countdown}
              location={nextPrayer.location}
              hijriDate={hijriDate?.formatted}
              onViewAllTimes={handleViewAllTimes}
              onQibla={handleQibla}
            />

            {/* Daily Motivation Card */}
            <DailyMotivationCard />

            {/* Quick Actions */}
            <View style={styles.section}>
              <SectionHeader title="Quick worship" subtitle="Jump into daily essentials" />
              <View style={styles.tilesGrid}>
                <IconTile
                  label="Duas"
                  iconName="leaf-outline"
                  onPress={() => navigation.navigate('TijaniyahDuas' as never)}
                />
                <IconTile
                  label="Digital Tasbih"
                  iconName="infinite-outline"
                  onPress={() => navigation.navigate('Tasbih' as never)}
                />
                <IconTile
                  label="Journal"
                  iconName="journal-outline"
                  onPress={() => navigation.navigate('Journal' as never)}
                />
                <IconTile
                  label="Mosque Locator"
                  iconName="navigate-outline"
                  onPress={() => navigation.navigate('Mosques' as never)}
                />
                <IconTile
                  label="Makkah Live"
                  iconName="videocam-outline"
                  onPress={() => navigation.navigate('MakkahLive' as never)}
                />
                <IconTile
                  label="AI Noor"
                  iconName="sparkles-outline"
                  onPress={() => navigation.navigate('AiNoor' as never)}
                />
                <IconTile
                  label="Donate"
                  iconName="heart-outline"
                  onPress={() => navigation.navigate('Donate' as never)}
                />
                <IconTile
                  label="Events"
                  iconName="calendar-outline"
                  onPress={() => navigation.navigate('Events' as never)}
                />
              </View>
            </View>

            {/* Quran Continue Card */}
            <View style={styles.section}>
              <SectionHeader
                title="Quran"
                subtitle="Continue where you left off"
                onPressSeeAll={() => {
                  // Navigate to sibling tab - go up to tab navigator level
                  const tabNavigator = navigation.getParent()?.getParent();
                  if (tabNavigator) {
                    tabNavigator.dispatch(CommonActions.navigate('QuranTab'));
                  }
                }}
              />
              <GlassCard
                onPress={() => {
                  // Navigate to sibling tab - go up to tab navigator level
                  const tabNavigator = navigation.getParent()?.getParent();
                  if (tabNavigator) {
                    tabNavigator.dispatch(CommonActions.navigate('QuranTab'));
                  }
                }}
                style={styles.quranCard}
              >
                <View style={styles.quranRow}>
                  <View>
                    <Text style={styles.quranLabel}>Continue reading</Text>
                    <Text style={styles.quranSurah}>{lastRead.surah}</Text>
                    <Text style={styles.quranAyah}>{lastRead.ayahRange}</Text>
                  </View>
                  <Ionicons name="bookmark-outline" size={22} color={colors.evergreen[500]} />
                </View>
              </GlassCard>
            </View>

            {/* Events Section */}
            {(currentEvents.length > 0 || upcomingEvents.length > 0) && (
              <View style={styles.section}>
                <SectionHeader
                  title="Events & Gatherings"
                  subtitle="Current and upcoming events"
                  onPressSeeAll={() => navigation.navigate('Events' as never)}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.eventsScrollContent}
                >
                  {currentEvents.slice(0, 3).map((event) => (
                    <View key={event.id} style={styles.eventCardWrapper}>
                      <EventCard
                        event={event}
                        onPress={() => navigation.navigate('Events' as never)}
                        compact={true}
                      />
                    </View>
                  ))}
                  {upcomingEvents.slice(0, 3 - currentEvents.length).map((event) => (
                    <View key={event.id} style={styles.eventCardWrapper}>
                      <EventCard
                        event={event}
                        onPress={() => navigation.navigate('Events' as never)}
                        compact={true}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Tijaniyah Daily Practices */}
            <View style={styles.section}>
              <SectionHeader
                title="Tijaniyah daily practices"
                subtitle="Gentle tracking for your path"
              />
              <GlassCard
                style={styles.practicesCard}
                onPress={() => navigation.navigate('WazifaLazim' as never)}
              >
                <View style={styles.practicesRow}>
                  <View style={{ flex: 1, marginRight: spacing.lg }}>
                    <Text style={styles.practiceLabel}>Wazifa today</Text>
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${wazifa.completionPercent}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.practiceValue}>{wazifa.completionPercent}% complete</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.practiceLabel}>Lazim streak</Text>
                    <Text style={styles.practiceStreak}>{lazim.currentStreak} days</Text>
                    <Text style={styles.practiceValue}>Keep your heart consistent</Text>
                  </View>
                </View>
              </GlassCard>
            </View>

            {/* Featured Content Carousel */}
            <View style={styles.section}>
              <SectionHeader title="Featured" subtitle="Curated for your week" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carousel}
              >
                <GlassCard
                  style={styles.featureCard}
                  onPress={() => {
                    navigation.getParent()?.getParent()?.dispatch(
                      CommonActions.navigate('CommunityTab')
                    );
                  }}
                >
                  <Text style={styles.featureTitle}>Scholar of the week</Text>
                  <Text style={styles.featureSubtitle}>Listen to a short reminder</Text>
                </GlassCard>
                <GlassCard
                  style={styles.featureCard}
                  onPress={() => {
                    navigation.getParent()?.getParent()?.dispatch(
                      CommonActions.navigate('CommunityTab')
                    );
                  }}
                >
                  <Text style={styles.featureTitle}>Friday Zikr Jumma</Text>
                  <Text style={styles.featureSubtitle}>Prepare your heart for Jumma</Text>
                </GlassCard>
                <GlassCard
                  style={styles.featureCard}
                  onPress={() => navigation.navigate('Mosques' as never)}
                >
                  <Text style={styles.featureTitle}>Makkah live</Text>
                  <Text style={styles.featureSubtitle}>Connect spiritually in real time</Text>
                </GlassCard>
                <GlassCard
                  style={styles.featureCard}
                  onPress={() => navigation.navigate('AiNoor' as never)}
                >
                  <Text style={styles.featureTitle}>AI Noor</Text>
                  <Text style={styles.featureSubtitle}>Ask questions with adab</Text>
                </GlassCard>
              </ScrollView>
            </View>

            {/* Donate Card */}
            <View style={[styles.section, { marginBottom: spacing['3xl'] }]}>
              <SectionHeader title="Support Tijaniyah causes" />
              <GlassCard
                style={styles.donateCard}
                onPress={() => navigation.navigate('Donate' as never)}
              >
                <View style={styles.donateRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.donateTitle}>Give a small sadaqah</Text>
                    <Text style={styles.donateSubtitle}>
                      Support knowledge, dhikr gatherings, and community work.
                    </Text>
                  </View>
                  <Ionicons name="heart-outline" size={24} color={colors.evergreen[500]} />
                </View>
              </GlassCard>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

// ---- Data hooks (using real API via usePrayerData.ts) ----

export const getLastRead = (): LastRead => {
  return {
    surah: 'Surah Al-Baqarah',
    ayahRange: 'Ayah 185–190',
  };
};

export const useWazifaSummary = (): WazifaSummary => {
  const [completionPercent] = useState(40);
  return { completionPercent };
};

export const useLazimSummary = (): LazimSummary => {
  const [currentStreak] = useState(7);
  return { currentStreak };
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: IS_VERY_SMALL_DEVICE ? spacing.md : IS_SMALL_DEVICE ? spacing.lg : spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  patternContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.04,
  },
  patternSvg: {
    width: '200%',
    height: '200%',
  },
  archContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    height: 260,
    opacity: 0.12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: IS_SMALL_DEVICE ? spacing.md : spacing.lg,
  },
  greetingTop: {
    ...typography.bodySm,
    fontSize: IS_SMALL_DEVICE ? 13 : 14,
    color: colors.pineBlue[300], // Muted text
  },
  greetingName: {
    ...typography.headingLg,
    fontSize: IS_SMALL_DEVICE ? 20 : 24,
    color: colors.white, // Headings
  },
  headerIcons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  headerIcon: {
    width: IS_SMALL_DEVICE ? 34 : 36,
    height: IS_SMALL_DEVICE ? 34 : 36,
    borderRadius: IS_SMALL_DEVICE ? 17 : 18,
    backgroundColor: colors.darkTeal[800], // Dark surface
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.evergreen[500],
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.darkTeal[950],
  },
  notificationBadgeText: {
    ...typography.bodySm,
    fontSize: 10,
    fontWeight: '700',
    color: colors.darkTeal[950],
  },
  searchBarContainer: {
    marginBottom: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  searchBarPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkTeal[800],
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    gap: spacing.sm,
  },
  searchBarPlaceholderText: {
    ...typography.bodyMd,
    fontSize: 14,
    color: colors.pineBlue[300],
    flex: 1,
  },
  eventsScrollContent: {
    paddingRight: spacing.lg,
    gap: spacing.md,
  },
  eventCardWrapper: {
    width: 280,
    marginRight: spacing.md,
  },
  heroCard: {
    marginBottom: IS_SMALL_DEVICE ? spacing.xl : spacing['2xl'],
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroLabel: {
    ...typography.bodySm,
    fontSize: IS_SMALL_DEVICE ? 12 : 13,
    color: colors.pineBlue[300], // Muted text
  },
  heroPrayerName: {
    ...typography.headingLg,
    fontSize: IS_SMALL_DEVICE ? 28 : 32,
    color: colors.white, // Headings
  },
  heroCountdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(8, 247, 116, 0.15)', // Evergreen accent background
    borderWidth: 1,
    borderColor: 'rgba(8, 247, 116, 0.25)',
  },
  heroCountdownText: {
    ...typography.bodySm,
    color: colors.evergreen[500], // Accent
    fontWeight: '700',
  },
  heroRow: {
    flexDirection: IS_VERY_SMALL_DEVICE ? 'column' : 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: IS_VERY_SMALL_DEVICE ? spacing.md : 0,
  },
  heroMeta: {
    ...typography.bodySm,
    fontSize: IS_SMALL_DEVICE ? 12 : 13,
    color: colors.pineBlue[100], // Body text
  },
  heroMetaMuted: {
    ...typography.bodySm,
    fontSize: IS_SMALL_DEVICE ? 11 : 12,
    color: colors.pineBlue[300], // Muted text
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  locationText: {
    ...typography.bodySm,
    fontSize: IS_SMALL_DEVICE ? 11 : 12,
    color: colors.pineBlue[100], // Body text
    flex: 1,
  },
  timesColumn: {
    alignItems: IS_VERY_SMALL_DEVICE ? 'flex-start' : 'flex-end',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeLabel: {
    ...typography.bodySm,
    color: colors.pineBlue[300], // Muted text
    marginRight: 8,
  },
  timeValue: {
    ...typography.bodySm,
    color: colors.pineBlue[100], // Body text
  },
  heroActions: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  heroButtonPrimary: {
    flex: 1,
    minHeight: 44,
    borderRadius: 16,
    backgroundColor: colors.evergreen[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    paddingVertical: IS_SMALL_DEVICE ? spacing.sm : spacing.md,
  },
  heroButtonPrimaryText: {
    ...typography.buttonSm,
    fontSize: IS_SMALL_DEVICE ? 14 : 15,
    color: colors.darkTeal[950],
  },
  heroButtonSecondary: {
    paddingHorizontal: spacing.md,
    minHeight: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: colors.darkTeal[700], // Secondary card surface
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: IS_SMALL_DEVICE ? spacing.sm : spacing.md,
  },
  heroButtonSecondaryText: {
    ...typography.bodySm,
    fontSize: IS_SMALL_DEVICE ? 13 : 14,
    color: colors.pineBlue[100], // Body text
  },
  section: {
    marginBottom: IS_SMALL_DEVICE ? spacing.xl : spacing['2xl'],
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    gap: IS_SMALL_DEVICE ? spacing.xs : 0,
  },
  quranCard: {
    marginTop: spacing.sm,
  },
  quranRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quranLabel: {
    ...typography.bodySm,
    color: colors.pineBlue[300], // Muted text
  },
  quranSurah: {
    ...typography.bodyMd,
    color: colors.white, // Headings
  },
  quranAyah: {
    ...typography.bodySm,
    color: colors.pineBlue[300], // Muted text
  },
  practicesCard: {
    marginTop: spacing.sm,
  },
  practicesRow: {
    flexDirection: 'row',
  },
  practiceLabel: {
    ...typography.bodySm,
    color: colors.pineBlue[300], // Muted text
    marginBottom: 4,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(15, 118, 110, 0.4)',
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.evergreen[500],
  },
  practiceValue: {
    ...typography.bodySm,
    color: colors.pineBlue[100], // Body text
  },
  practiceStreak: {
    ...typography.headingLg,
    fontSize: 22,
    color: colors.evergreen[500],
  },
  carousel: {
    paddingVertical: spacing.sm,
  },
  featureCard: {
    width: IS_SMALL_DEVICE ? 200 : 220,
    marginRight: spacing.md,
  },
  featureTitle: {
    ...typography.bodyMd,
    fontSize: 16,
    color: colors.white, // Headings
    marginBottom: 4,
  },
  featureSubtitle: {
    ...typography.bodySm,
    color: colors.pineBlue[100], // Body text
  },
  donateCard: {
    marginTop: spacing.sm,
  },
  donateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  donateTitle: {
    ...typography.bodyMd,
    fontSize: 16,
    color: colors.white, // Headings
    marginBottom: 4,
  },
  donateSubtitle: {
    ...typography.bodySm,
    color: colors.pineBlue[100], // Body text
  },
});

// ---- Daily Motivation Card ----

const QUOTES: { text: string; source: string }[] = [
  {
    text: 'Indeed, in the remembrance of Allah do hearts find rest.',
    source: 'Qur’an 13:28',
  },
  {
    text: 'The best of deeds are those done consistently, even if small.',
    source: 'Prophet Muhammad ﷺ',
  },
  {
    text: 'Whoever relies upon Allah – then He is sufficient for him.',
    source: 'Qur’an 65:3',
  },
  {
    text: 'Verily, with hardship comes ease.',
    source: 'Qur’an 94:6',
  },
  {
    text: 'Be mindful of Allah, and He will protect you.',
    source: 'Prophet Muhammad ﷺ',
  },
];

const getQuoteForDate = (date: Date) => {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const index = dayOfYear % QUOTES.length;
  return QUOTES[index];
};

const DailyMotivationCard: React.FC = () => {
  const [quote, setQuote] = useState(() => getQuoteForDate(new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const newQuote = getQuoteForDate(now);
      setQuote(prev => (prev.text === newQuote.text ? prev : newQuote));
    }, 60_000); // Check every minute for date change

    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard style={{ marginBottom: spacing['2xl'] }}>
      <LinearGradient
        colors={['rgba(8,247,116,0.16)', 'rgba(16,80,86,0.8)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 22,
          padding: spacing.lg,
        }}
      >
        <Text
          style={{
            ...typography.bodySm,
            fontSize: 12,
            color: colors.pineBlue[300],
            marginBottom: spacing.xs,
          }}
        >
          Daily reminder
        </Text>
        <Text
          style={{
            ...typography.headingMd,
            fontSize: 16,
            color: colors.white,
            marginBottom: spacing.sm,
          }}
        >
          {quote.text}
        </Text>
        <Text
          style={{
            ...typography.bodySm,
            fontSize: 12,
            color: colors.pineBlue[100],
          }}
        >
          {quote.source}
        </Text>
      </LinearGradient>
    </GlassCard>
  );
};

export default HomeScreen;



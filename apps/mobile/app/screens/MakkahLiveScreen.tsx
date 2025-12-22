import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  useSafeAreaInsets,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { IslamicPattern } from '../../src/components/ui/IslamicPattern';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { HeroStreamCard } from '../../src/components/makkah/HeroStreamCard';
import { StreamPills, StreamOption } from '../../src/components/makkah/StreamPills';
import { ChannelGrid, Channel } from '../../src/components/makkah/ChannelGrid';
import apiClient from '../../src/services/apiClient';
import { useQuery } from '@tanstack/react-query';

// Default stream options (fallback if API fails)
const DEFAULT_STREAMS: StreamOption[] = [
  {
    id: 'makkah-24-7',
    title: 'Makkah Live Online 24/7',
    subtitle: 'Live streaming from the Holy Kaaba',
    url: 'https://www.youtube.com/embed/jNgP6d9HraI?playsinline=1',
  },
  {
    id: 'makkah-hd',
    title: 'Makkah Live HD',
    subtitle: 'High definition stream',
    url: 'https://www.youtube.com/embed/jNgP6d9HraI?playsinline=1',
  },
];

// Default channels
const DEFAULT_CHANNELS: Channel[] = [
  {
    id: 'quran-tv-saudi',
    title: 'Quran TV Saudi Arabia',
    description: 'Official Saudi Quran TV Channel',
    tag: 'Quran',
    url: 'https://www.qurantv.sa',
  },
  {
    id: 'iqra-tv',
    title: 'Iqra TV',
    description: 'International Islamic TV Network',
    tag: 'Islamic',
    url: 'https://www.iqra.tv',
  },
  {
    id: 'makkah-tv',
    title: 'Makkah TV',
    description: 'Live from the Holy City of Makkah',
    tag: 'Makkah',
    url: 'https://www.makkah.tv',
  },
  {
    id: 'madinah-tv',
    title: 'Madinah TV',
    description: 'Live from the Prophet\'s Mosque',
    tag: 'Madinah',
    url: 'https://www.madinah.tv',
  },
  {
    id: 'islamic-tv',
    title: 'Islamic TV Network',
    description: '24/7 Islamic programming and Quran recitation',
    tag: 'Islamic',
    url: 'https://www.islamictv.net',
  },
  {
    id: 'quran-radio',
    title: 'Quran Radio',
    description: 'Continuous Quran recitation and Islamic content',
    tag: 'Quran',
    url: 'https://www.quranradio.com',
  },
];

export const MakkahLiveScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [selectedStream, setSelectedStream] = useState<StreamOption>(DEFAULT_STREAMS[0]);
  const [showHelp, setShowHelp] = useState(false);

  // Fetch Makkah streams from API
  const { data: streamsData } = useQuery({
    queryKey: ['makkah-streams'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{ streams: StreamOption[] }>('/api/makkah-streams');
        return response.streams || DEFAULT_STREAMS;
      } catch {
        return DEFAULT_STREAMS;
      }
    },
    staleTime: 60000,
  });

  const streams = streamsData || DEFAULT_STREAMS;

  useEffect(() => {
    if (streams.length > 0 && (!selectedStream || !streams.find(s => s.id === selectedStream.id))) {
      setSelectedStream(streams[0]);
    }
  }, [streams]);

  const handleStreamSelect = (stream: StreamOption) => {
    setSelectedStream(stream);
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
          <Text style={styles.headerLabel}>More Features</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(160, insets.bottom + 140) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Page Title Section */}
          <View style={styles.titleSection}>
            <View style={styles.titleContainer}>
              <Text style={styles.pageTitle}>Makkah Live</Text>
              <Text style={styles.pageSubtitle}>Live streams from the Holy Mosques</Text>
            </View>
            <Pressable
              onPress={() => setShowHelp(!showHelp)}
              style={styles.helpButton}
            >
              <Ionicons name="help-circle-outline" size={24} color={colors.pineBlue[100]} />
            </Pressable>
          </View>

          {/* Help Card */}
          {showHelp && (
            <GlassCard style={styles.helpCard}>
              <View style={styles.helpContent}>
                <Ionicons name="information-circle" size={20} color={colors.evergreen[500]} />
                <Text style={styles.helpText}>
                  Select a stream option below to watch live from Makkah. Tap on TV channels to visit their official websites.
                </Text>
              </View>
            </GlassCard>
          )}

          {/* Hero Video Card */}
          <HeroStreamCard
            streamUrl={selectedStream.url}
            onError={() => {
              // Handle error if needed
            }}
          />

          {/* Quick Action Pills */}
          <StreamPills
            streams={streams}
            selectedId={selectedStream.id}
            onSelect={handleStreamSelect}
          />

          {/* TV Channels Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Islamic & Quran TV Channels</Text>
              <Text style={styles.sectionSubtitle}>Visit official websites to watch live</Text>
            </View>
            <ChannelGrid channels={DEFAULT_CHANNELS} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
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
  headerLabel: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  titleContainer: {
    flex: 1,
  },
  pageTitle: {
    ...typography.headingLg,
    fontSize: 28,
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  pageSubtitle: {
    ...typography.bodyMd,
    fontSize: 14,
    color: colors.pineBlue[100],
    lineHeight: 20,
  },
  helpButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.darkTeal[800],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginLeft: spacing.md,
  },
  helpCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  helpContent: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  helpText: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[100],
    flex: 1,
    lineHeight: 18,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.headingLg,
    fontSize: 18,
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
  },
});

export default MakkahLiveScreen;

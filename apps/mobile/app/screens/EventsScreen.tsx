import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { IslamicPattern } from '../../src/components/ui/IslamicPattern';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { EventCard } from '../../src/components/events/EventCard';
import { useEvents, useUpcomingEvents, usePastEvents, useCurrentEvents } from '../../src/hooks/useEvents';
import { SectionHeader } from '../../src/components/ui/SectionHeader';

export const EventsScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { data: allEvents = [], isLoading, refetch, isRefetching } = useEvents();
  const upcomingEvents = useUpcomingEvents();
  const pastEvents = usePastEvents();
  const currentEvents = useCurrentEvents();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('all');

  const onRefresh = async () => {
    await refetch();
  };

  const getDisplayEvents = () => {
    switch (activeTab) {
      case 'upcoming':
        return upcomingEvents;
      case 'past':
        return pastEvents;
      default:
        return allEvents.filter((e) => e.isActive);
    }
  };

  const displayEvents = getDisplayEvents();

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
          <Text style={styles.headerTitle}>Events & Gatherings</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Pressable
            style={[styles.tab, activeTab === 'all' && styles.tabActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              All Events
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
              Upcoming
            </Text>
            {upcomingEvents.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{upcomingEvents.length}</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'past' && styles.tabActive]}
            onPress={() => setActiveTab('past')}
          >
            <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
              Past
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        {isLoading && !allEvents.length ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.evergreen[500]} />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : displayEvents.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title={activeTab === 'upcoming' ? 'No upcoming events' : activeTab === 'past' ? 'No past events' : 'No events yet'}
            message={
              activeTab === 'upcoming'
                ? 'Check back later for upcoming events and gatherings.'
                : activeTab === 'past'
                ? 'No past events to display.'
                : 'Events and gatherings will appear here when they are added.'
            }
          />
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(160, insets.bottom + 140) },
            ]}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={onRefresh}
                tintColor={colors.evergreen[500]}
                colors={[colors.evergreen[500]]}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {/* Current Events */}
            {activeTab === 'all' && currentEvents.length > 0 && (
              <View style={styles.section}>
                <SectionHeader
                  title="Happening Now"
                  subtitle={`${currentEvents.length} event${currentEvents.length !== 1 ? 's' : ''} currently ongoing`}
                />
                {currentEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </View>
            )}

            {/* Upcoming Events */}
            {(activeTab === 'all' || activeTab === 'upcoming') && upcomingEvents.length > 0 && (
              <View style={styles.section}>
                <SectionHeader
                  title="Upcoming Events"
                  subtitle={`${upcomingEvents.length} event${upcomingEvents.length !== 1 ? 's' : ''} coming up`}
                />
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </View>
            )}

            {/* Past Events */}
            {(activeTab === 'all' || activeTab === 'past') && pastEvents.length > 0 && (
              <View style={styles.section}>
                <SectionHeader
                  title="Past Events"
                  subtitle={`${pastEvents.length} past event${pastEvents.length !== 1 ? 's' : ''}`}
                />
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </View>
            )}
          </ScrollView>
        )}
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
    fontSize: 20,
    color: colors.white,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.darkTeal[800],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  tabActive: {
    backgroundColor: colors.evergreen[500],
    borderColor: colors.evergreen[500],
  },
  tabText: {
    ...typography.bodyMd,
    fontSize: 13,
    color: colors.pineBlue[300],
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.darkTeal[950],
  },
  tabBadge: {
    backgroundColor: colors.darkTeal[950],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeText: {
    ...typography.bodySm,
    fontSize: 10,
    fontWeight: '700',
    color: colors.evergreen[500],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.bodyMd,
    color: colors.pineBlue[300],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
});

export default EventsScreen;

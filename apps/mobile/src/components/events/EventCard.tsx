import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, isToday, isTomorrow, isPast, isFuture } from 'date-fns';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../ui/GlassCard';
import type { Event } from '../../hooks/useEvents';

interface EventCardProps {
  event: Event;
  onPress?: () => void;
  compact?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress, compact = false }) => {
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;
  const now = new Date();

  const getDateLabel = () => {
    if (isToday(startDate)) return 'Today';
    if (isTomorrow(startDate)) return 'Tomorrow';
    if (isPast(startDate) && (!endDate || isFuture(endDate))) return 'Ongoing';
    return format(startDate, 'MMM d, yyyy');
  };

  const getTimeLabel = () => {
    return format(startDate, 'h:mm a');
  };

  const isUpcoming = isFuture(startDate);
  const isCurrent = startDate <= now && (!endDate || endDate >= now);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
        compact && styles.containerCompact,
      ]}
    >
      <GlassCard style={styles.card}>
        {event.imageUrl && !compact && (
          <Image source={{ uri: event.imageUrl }} style={styles.image} resizeMode="cover" />
        )}
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.dateContainer}>
              <View style={[styles.dateBadge, isCurrent && styles.dateBadgeCurrent]}>
                <Ionicons
                  name={isCurrent ? 'time' : isUpcoming ? 'calendar' : 'checkmark-circle'}
                  size={14}
                  color={isCurrent ? colors.evergreen[500] : colors.pineBlue[300]}
                />
                <Text style={[styles.dateLabel, isCurrent && styles.dateLabelCurrent]}>
                  {getDateLabel()}
                </Text>
              </View>
            </View>
            {isUpcoming && (
              <View style={styles.upcomingBadge}>
                <Text style={styles.upcomingText}>Upcoming</Text>
              </View>
            )}
            {isCurrent && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentText}>Now</Text>
              </View>
            )}
          </View>

          <Text style={styles.title} numberOfLines={compact ? 2 : 3}>
            {event.title}
          </Text>

          {!compact && event.description && (
            <Text style={styles.description} numberOfLines={2}>
              {event.description}
            </Text>
          )}

          <View style={styles.footer}>
            <View style={styles.footerItem}>
              <Ionicons name="time-outline" size={14} color={colors.pineBlue[300]} />
              <Text style={styles.footerText}>{getTimeLabel()}</Text>
            </View>
            {event.location && (
              <View style={styles.footerItem}>
                <Ionicons name="location-outline" size={14} color={colors.pineBlue[300]} />
                <Text style={styles.footerText} numberOfLines={1}>
                  {event.location}
                </Text>
              </View>
            )}
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  containerPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  containerCompact: {
    marginBottom: spacing.sm,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: colors.darkTeal[800],
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dateContainer: {
    flex: 1,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.darkTeal[800],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  dateBadgeCurrent: {
    backgroundColor: `${colors.evergreen[500]}15`,
    borderColor: `${colors.evergreen[500]}30`,
  },
  dateLabel: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
    fontWeight: '600',
  },
  dateLabelCurrent: {
    color: colors.evergreen[500],
  },
  upcomingBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: `${colors.evergreen[500]}15`,
    borderWidth: 1,
    borderColor: `${colors.evergreen[500]}30`,
  },
  upcomingText: {
    ...typography.bodySm,
    fontSize: 10,
    color: colors.evergreen[500],
    fontWeight: '600',
  },
  currentBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: `${colors.evergreen[500]}20`,
    borderWidth: 1,
    borderColor: colors.evergreen[500],
  },
  currentText: {
    ...typography.bodySm,
    fontSize: 10,
    color: colors.evergreen[500],
    fontWeight: '700',
  },
  title: {
    ...typography.headingMd,
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.bodyMd,
    fontSize: 13,
    color: colors.pineBlue[100],
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
  },
});

export default EventCard;


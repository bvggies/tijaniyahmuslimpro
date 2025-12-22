import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from './GlassCard';

interface ContentCardProps {
  id: string;
  title: string;
  summary: string;
  tags?: string[];
  onPress: () => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  title,
  summary,
  tags,
  onPress,
}) => {
  return (
    <Pressable onPress={onPress}>
      <GlassCard style={styles.card}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.summary} numberOfLines={3}>
          {summary}
        </Text>
        {tags && tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={styles.readButtonContainer}>
          <Pressable onPress={onPress} style={styles.readButton}>
            <Text style={styles.readButtonText}>Read</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.evergreen[500]} />
          </Pressable>
        </View>
      </GlassCard>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  title: {
    ...typography.headingLg,
    fontSize: 18,
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  summary: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    backgroundColor: colors.darkTeal[700],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tagText: {
    ...typography.bodySm,
    fontSize: 10,
    color: colors.pineBlue[300],
  },
  readButtonContainer: {
    alignItems: 'flex-end',
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.darkTeal[700],
    borderWidth: 1,
    borderColor: colors.evergreen[500],
  },
  readButtonText: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.evergreen[500],
    fontWeight: '600',
  },
});

export default ContentCard;


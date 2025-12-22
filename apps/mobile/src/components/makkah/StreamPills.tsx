import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../ui/GlassCard';

export interface StreamOption {
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

interface StreamPillsProps {
  streams: StreamOption[];
  selectedId: string;
  onSelect: (stream: StreamOption) => void;
}

export const StreamPills: React.FC<StreamPillsProps> = ({ streams, selectedId, onSelect }) => {
  return (
    <View style={styles.container}>
      {streams.map((stream) => {
        const isSelected = stream.id === selectedId;
        return (
          <Pressable
            key={stream.id}
            onPress={() => onSelect(stream)}
            style={({ pressed }) => [
              styles.pill,
              isSelected && styles.pillSelected,
              pressed && styles.pillPressed,
            ]}
          >
            <GlassCard style={[styles.pillCard, isSelected && styles.pillCardSelected]}>
              <View style={styles.pillContent}>
                <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                  <Ionicons
                    name="cube-outline"
                    size={18}
                    color={isSelected ? colors.darkTeal[950] : colors.pineBlue[300]}
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[styles.title, isSelected && styles.titleSelected]} numberOfLines={1}>
                    {stream.title}
                  </Text>
                  <Text style={[styles.subtitle, isSelected && styles.subtitleSelected]} numberOfLines={1}>
                    {stream.subtitle}
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  pill: {
    flex: 1,
  },
  pillPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  pillCard: {
    padding: spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(16, 80, 86, 0.6)',
  },
  pillCardSelected: {
    backgroundColor: 'rgba(8, 247, 116, 0.15)',
    borderColor: 'rgba(8, 247, 116, 0.4)',
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.darkTeal[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerSelected: {
    backgroundColor: colors.evergreen[500],
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.bodyMd,
    fontSize: 13,
    color: colors.white,
    fontWeight: '600',
    marginBottom: 2,
  },
  titleSelected: {
    color: colors.white,
  },
  subtitle: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
  },
  subtitleSelected: {
    color: colors.pineBlue[200],
  },
});

export default StreamPills;


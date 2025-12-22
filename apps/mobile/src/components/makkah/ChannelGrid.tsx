import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Linking } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../ui/GlassCard';

export interface Channel {
  id: string;
  title: string;
  description: string;
  tag: 'Quran' | 'Islamic' | 'Makkah' | 'Madinah';
  url: string;
}

interface ChannelGridProps {
  channels: Channel[];
}

const getTagColor = (tag: Channel['tag']) => {
  switch (tag) {
    case 'Quran':
      return colors.evergreen[500];
    case 'Islamic':
      return '#8B5CF6';
    case 'Makkah':
      return '#FBBF24';
    case 'Madinah':
      return '#06B6D4';
    default:
      return colors.pineBlue[300];
  }
};

export const ChannelGrid: React.FC<ChannelGridProps> = ({ channels }) => {
  const handlePress = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  return (
    <View style={styles.container}>
      {channels.map((channel) => {
        const tagColor = getTagColor(channel.tag);
        return (
          <Pressable
            key={channel.id}
            onPress={() => handlePress(channel.url)}
            style={({ pressed }) => [
              styles.channelCard,
              pressed && styles.channelCardPressed,
            ]}
          >
            <GlassCard style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: `${tagColor}15` }]}>
                  <Ionicons name="tv-outline" size={20} color={tagColor} />
                </View>
                <Pressable
                  onPress={() => handlePress(channel.url)}
                  style={styles.linkButton}
                >
                  <Ionicons name="open-outline" size={16} color={colors.pineBlue[300]} />
                </Pressable>
              </View>
              
              <Text style={styles.title} numberOfLines={2}>
                {channel.title}
              </Text>
              
              <Text style={styles.description} numberOfLines={2}>
                {channel.description}
              </Text>
              
              <View style={styles.footer}>
                <View style={[styles.tag, { backgroundColor: `${tagColor}15` }]}>
                  <Text style={[styles.tagText, { color: tagColor }]}>
                    {channel.tag}
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
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  channelCard: {
    width: '48%',
  },
  channelCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  card: {
    padding: spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    minHeight: 140,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkButton: {
    padding: spacing.xs,
  },
  title: {
    ...typography.headingMd,
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  description: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[100],
    lineHeight: 16,
    marginBottom: spacing.sm,
    flex: 1,
  },
  footer: {
    marginTop: 'auto',
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    ...typography.bodySm,
    fontSize: 10,
    fontWeight: '600',
  },
});

export default ChannelGrid;


import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { CardColor } from '../../data/tijaniyah/tariqaTijaniyyahContent';

interface InfoCardProps {
  title: string;
  body: string;
  color: CardColor;
  icon: string;
}

const getCardColors = (color: CardColor): string[] => {
  switch (color) {
    case 'teal':
      return ['rgba(14, 106, 106, 0.35)', 'rgba(14, 106, 106, 0.25)'];
    case 'green':
      return ['rgba(31, 106, 50, 0.35)', 'rgba(31, 106, 50, 0.25)'];
    case 'amber':
      return ['rgba(182, 122, 18, 0.35)', 'rgba(182, 122, 18, 0.25)'];
    case 'grey':
      return ['rgba(63, 106, 106, 0.3)', 'rgba(63, 106, 106, 0.2)'];
    default:
      return ['rgba(14, 106, 106, 0.35)', 'rgba(14, 106, 106, 0.25)'];
  }
};

// Determine if content is long enough to collapse (roughly 6-8 lines)
const isLongContent = (text: string): boolean => {
  const lineCount = text.split('\n').length;
  const charCount = text.length;
  // Rough estimate: ~60-70 chars per line, so 6-8 lines = ~400-560 chars
  return charCount > 400 || lineCount > 3;
};

export const InfoCard: React.FC<InfoCardProps> = ({ title, body, color, icon }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldCollapse = isLongContent(body);
  const displayBody = shouldCollapse && !isExpanded 
    ? body.substring(0, 400) + (body.length > 400 ? '...' : '')
    : body;

  const cardColors = getCardColors(color);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      <LinearGradient
        colors={cardColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.innerBorder} />
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconBadge}>
              <Ionicons name={icon as any} size={18} color={colors.evergreen[500]} />
            </View>
            <Text style={styles.title}>{title}</Text>
          </View>
          <View style={styles.bodyContainer}>
            <Text style={styles.body}>{displayBody}</Text>
          </View>
          {shouldCollapse && (
            <Pressable
              onPress={() => setIsExpanded(!isExpanded)}
              style={styles.expandButton}
            >
              <Text style={styles.expandText}>
                {isExpanded ? 'Show less' : 'Read more'}
              </Text>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.evergreen[500]}
              />
            </Pressable>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.95,
  },
  gradient: {
    borderRadius: 20,
    position: 'relative',
  },
  innerBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    pointerEvents: 'none',
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.darkTeal[800],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginTop: 2,
  },
  title: {
    ...typography.headingLg,
    fontSize: 18,
    color: colors.white,
    fontWeight: '600',
    flex: 1,
    lineHeight: 24,
  },
  bodyContainer: {
    maxWidth: '93%',
  },
  body: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    lineHeight: 22,
    fontSize: 14,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  expandText: {
    ...typography.bodySm,
    fontSize: 13,
    color: colors.evergreen[500],
    fontWeight: '600',
  },
});

export default InfoCard;

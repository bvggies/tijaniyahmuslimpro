import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface SectionHeaderProps {
  title: string;
  icon: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name={icon as any} size={24} color={colors.evergreen[500]} />
        <Text style={styles.title}>{title}</Text>
        {/* Optional watermark */}
        <View style={styles.watermark}>
          <Ionicons name="star" size={16} color={colors.evergreen[500]} style={styles.watermarkIcon} />
        </View>
      </View>
      {/* Divider line */}
      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    position: 'relative',
  },
  title: {
    ...typography.headingLg,
    fontSize: 22,
    color: colors.white,
    fontWeight: '700',
    flex: 1,
  },
  watermark: {
    position: 'absolute',
    right: 0,
    opacity: 0.05,
  },
  watermarkIcon: {
    opacity: 0.05,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginTop: spacing.sm,
  },
});

export default SectionHeader;

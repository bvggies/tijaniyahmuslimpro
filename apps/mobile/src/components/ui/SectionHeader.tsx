import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  onPressSeeAll?: () => void;
};

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  onPressSeeAll,
}) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {onPressSeeAll ? (
        <Pressable onPress={onPressSeeAll} hitSlop={8}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.bodyMd,
    fontSize: 16,
    fontWeight: '700',
    color: colors.white, // Headings
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.pineBlue[100], // Body text
  },
  seeAll: {
    ...typography.bodySm,
    color: colors.pineBlue[100], // Body text
  },
});

export default SectionHeader;



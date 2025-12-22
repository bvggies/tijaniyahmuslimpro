import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type ChipProps = {
  label: string;
  icon?: string;
  selected?: boolean;
  onPress?: () => void;
};

export const Chip: React.FC<ChipProps> = ({ label, icon, selected = false, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.chipContent}>
        {icon && (
          <Ionicons
            name={icon as any}
            size={14}
            color={selected ? colors.darkTeal[950] : colors.pineBlue[300]}
            style={styles.icon}
          />
        )}
        <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: colors.darkTeal[800],
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  icon: {
    marginRight: -2,
  },
  chipSelected: {
    backgroundColor: colors.evergreen[500],
    borderColor: colors.evergreen[500],
  },
  text: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
  },
  textSelected: {
    color: colors.darkTeal[950],
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
});

export default Chip;


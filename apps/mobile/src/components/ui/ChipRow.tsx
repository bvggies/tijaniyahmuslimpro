import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Chip } from './Chip';
import { spacing } from '../../theme/spacing';

interface ChipRowProps {
  chips: string[];
  selectedChip?: string;
  onChipPress: (chip: string) => void;
}

export const ChipRow: React.FC<ChipRowProps> = ({
  chips,
  selectedChip,
  onChipPress,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {chips.map((chip) => (
        <Chip
          key={chip}
          label={chip}
          selected={selectedChip === chip}
          onPress={() => onChipPress(chip)}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingRight: spacing.xl,
  },
});

export default ChipRow;


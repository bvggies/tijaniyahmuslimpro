import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface AZChipsProps {
  availableLetters: string[];
  selectedLetter: string | null;
  onLetterPress: (letter: string) => void;
}

const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const AZChips: React.FC<AZChipsProps> = ({
  availableLetters,
  selectedLetter,
  onLetterPress,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {ALL_LETTERS.map((letter) => {
          const isAvailable = availableLetters.includes(letter);
          const isSelected = selectedLetter === letter;

          return (
            <Pressable
              key={letter}
              onPress={() => isAvailable && onLetterPress(letter)}
              disabled={!isAvailable}
              style={[
                styles.chip,
                !isAvailable && styles.chipDisabled,
                isSelected && styles.chipActive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  !isAvailable && styles.chipTextDisabled,
                  isSelected && styles.chipTextActive,
                ]}
              >
                {letter}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.darkTeal[900],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  content: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  chip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.darkTeal[800],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipDisabled: {
    opacity: 0.3,
  },
  chipActive: {
    backgroundColor: colors.evergreen[500],
    borderColor: colors.evergreen[500],
  },
  chipText: {
    ...typography.bodySm,
    fontSize: 13,
    color: colors.pineBlue[300],
    fontWeight: '600',
  },
  chipTextDisabled: {
    color: colors.pineBlue[500],
  },
  chipTextActive: {
    color: colors.darkTeal[950],
  },
});

export default AZChips;


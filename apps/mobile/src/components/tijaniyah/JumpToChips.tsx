import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface JumpToChipsProps {
  sections: Array<{ id: string; label: string }>;
  selectedSection: string | null;
  onSectionPress: (sectionId: string) => void;
  onToggle: () => void;
  isExpanded: boolean;
}

export const JumpToChips: React.FC<JumpToChipsProps> = ({
  sections,
  selectedSection,
  onSectionPress,
  onToggle,
  isExpanded,
}) => {
  if (!isExpanded) {
    return (
      <Pressable onPress={onToggle} style={styles.collapsedContainer}>
        <Ionicons name="chevron-down" size={18} color={colors.pineBlue[300]} />
        <Text style={styles.collapsedText}>Jump to section</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {sections.map((section) => (
          <Pressable
            key={section.id}
            onPress={() => onSectionPress(section.id)}
            style={[
              styles.chip,
              selectedSection === section.id && styles.chipActive,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                selectedSection === section.id && styles.chipTextActive,
              ]}
            >
              {section.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <Pressable onPress={onToggle} style={styles.closeButton}>
        <Ionicons name="chevron-up" size={18} color={colors.pineBlue[300]} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.darkTeal[900],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  content: {
    flexDirection: 'row',
    gap: spacing.sm,
    flex: 1,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    backgroundColor: colors.darkTeal[800],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  chipActive: {
    backgroundColor: colors.evergreen[500],
    borderColor: colors.evergreen[500],
  },
  chipText: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
  },
  chipTextActive: {
    color: colors.darkTeal[950],
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  collapsedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    backgroundColor: colors.darkTeal[900],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  collapsedText: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
  },
});

export default JumpToChips;


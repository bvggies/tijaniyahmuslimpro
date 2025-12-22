import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { BottomSheet } from '../ui/BottomSheet';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { ReaderBlock } from '../../utils/readerParser';

interface SearchInPageModalProps {
  visible: boolean;
  onClose: () => void;
  blocks: ReaderBlock[];
  onMatchPress: (blockId: string) => void;
}

export const SearchInPageModal: React.FC<SearchInPageModalProps> = ({
  visible,
  onClose,
  blocks,
  onMatchPress,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const matches = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: Array<{ blockId: string; text: string; index: number }> = [];

    blocks.forEach((block) => {
      const text = block.text.toLowerCase();
      if (text.includes(query)) {
        const index = text.indexOf(query);
        results.push({
          blockId: block.id,
          text: block.text.substring(Math.max(0, index - 30), Math.min(block.text.length, index + query.length + 30)),
          index,
        });
      }
    });

    return results;
  }, [blocks, searchQuery]);

  const handleNext = () => {
    if (matches.length === 0) return;
    const nextIndex = (currentMatchIndex + 1) % matches.length;
    setCurrentMatchIndex(nextIndex);
    onMatchPress(matches[nextIndex].blockId);
  };

  const handlePrevious = () => {
    if (matches.length === 0) return;
    const prevIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
    setCurrentMatchIndex(prevIndex);
    onMatchPress(matches[prevIndex].blockId);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Search in Page">
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.pineBlue[300]} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Search..."
            placeholderTextColor={colors.pineBlue[500]}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setCurrentMatchIndex(0);
            }}
            autoFocus
          />
        </View>

        {searchQuery.trim() && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>
              {matches.length > 0
                ? `${currentMatchIndex + 1} of ${matches.length} matches`
                : 'No matches found'}
            </Text>

            {matches.length > 0 && (
              <View style={styles.navigation}>
                <Pressable onPress={handlePrevious} style={styles.navButton}>
                  <Ionicons name="chevron-up" size={20} color={colors.evergreen[500]} />
                  <Text style={styles.navButtonText}>Previous</Text>
                </Pressable>
                <Pressable onPress={handleNext} style={styles.navButton}>
                  <Text style={styles.navButtonText}>Next</Text>
                  <Ionicons name="chevron-down" size={20} color={colors.evergreen[500]} />
                </Pressable>
              </View>
            )}

            {matches.length > 0 && (
              <View style={styles.preview}>
                <Text style={styles.previewText} numberOfLines={3}>
                  ...{matches[currentMatchIndex]?.text}...
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkTeal[800],
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.bodyMd,
    fontSize: 15,
    color: colors.white,
    paddingVertical: spacing.md,
  },
  resultsContainer: {
    gap: spacing.md,
  },
  resultsText: {
    ...typography.bodySm,
    fontSize: 13,
    color: colors.pineBlue[300],
    textAlign: 'center',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    backgroundColor: colors.darkTeal[800],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  navButtonText: {
    ...typography.bodySm,
    fontSize: 13,
    color: colors.evergreen[500],
    fontWeight: '600',
  },
  preview: {
    backgroundColor: colors.darkTeal[800],
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  previewText: {
    ...typography.bodyMd,
    fontSize: 14,
    color: colors.pineBlue[100],
    lineHeight: 20,
  },
});

export default SearchInPageModal;


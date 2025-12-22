import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { IslamicPattern } from '../../components/ui/IslamicPattern';
import { SearchBar } from '../../components/ui/SearchBar';
import { GlassCard } from '../../components/ui/GlassCard';
import { beginnersBookmarksService, BeginnersBookmark } from '../../services/beginnersBookmarks';

export const BeginnersBookmarksScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [bookmarks, setBookmarks] = useState<BeginnersBookmark[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadBookmarks = async () => {
      const allBookmarks = await beginnersBookmarksService.getAllBookmarks();
      setBookmarks(allBookmarks.sort((a, b) => b.timestamp - a.timestamp));
    };
    void loadBookmarks();
  }, []);

  const filteredBookmarks = useMemo(() => {
    if (!searchQuery.trim()) return bookmarks;

    const query = searchQuery.toLowerCase();
    return bookmarks.filter(
      (bookmark) =>
        bookmark.term.toLowerCase().includes(query) ||
        bookmark.alt?.toLowerCase().includes(query) ||
        bookmark.definition.toLowerCase().includes(query)
    );
  }, [bookmarks, searchQuery]);

  const handleItemPress = (bookmark: BeginnersBookmark) => {
    (navigation as any).navigate('BeginnersTermDetail', {
      item: {
        id: bookmark.id,
        term: bookmark.term,
        alt: bookmark.alt,
        definition: bookmark.definition,
        type: bookmark.type,
      },
    });
  };

  const handleRemoveBookmark = async (bookmark: BeginnersBookmark) => {
    await beginnersBookmarksService.removeBookmark(bookmark.id, bookmark.type);
    const updated = await beginnersBookmarksService.getAllBookmarks();
    setBookmarks(updated.sort((a, b) => b.timestamp - a.timestamp));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={[colors.darkTeal[950], colors.darkTeal[900]]}
        style={styles.gradient}
      >
        <IslamicPattern />

        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.pineBlue[100]} />
          </Pressable>
          <Text style={styles.headerTitle}>Bookmarks</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search bookmarks..."
          />
        </View>

        {/* List */}
        {filteredBookmarks.length > 0 ? (
          <FlatList
            data={filteredBookmarks}
            keyExtractor={(item) => `${item.type}-${item.id}-${item.timestamp}`}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleItemPress(item)}
                style={({ pressed }) => [
                  styles.itemCard,
                  pressed && styles.itemCardPressed,
                ]}
              >
                <View style={styles.itemIcon}>
                  <Ionicons
                    name={item.type === 'phrase' ? 'chatbubble' : 'book'}
                    size={20}
                    color={colors.evergreen[500]}
                  />
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemTerm}>{item.term}</Text>
                  {item.alt && (
                    <Text style={styles.itemAlt}>{item.alt}</Text>
                  )}
                  <Text style={styles.itemPreview} numberOfLines={2}>
                    {item.definition}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleRemoveBookmark(item)}
                  style={styles.removeButton}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.pineBlue[500]} />
                </Pressable>
              </Pressable>
            )}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: Math.max(140, insets.bottom + 120) },
            ]}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <GlassCard style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <Ionicons name="bookmark-outline" size={48} color={colors.pineBlue[300]} />
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No matching bookmarks' : 'No bookmarks yet'}
              </Text>
              <Text style={styles.emptyMessage}>
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Bookmark terms and phrases to access them quickly'}
              </Text>
            </View>
          </GlassCard>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.darkTeal[950],
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkTeal[800],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: {
    ...typography.headingLg,
    fontSize: 20,
    color: colors.white,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  listContent: {
    padding: spacing.lg,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkTeal[800],
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  itemCardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.95,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkTeal[700],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  itemContent: {
    flex: 1,
  },
  itemTerm: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.white,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemAlt: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.evergreen[500],
    marginBottom: 4,
  },
  itemPreview: {
    ...typography.bodySm,
    fontSize: 13,
    color: colors.pineBlue[300],
    lineHeight: 18,
  },
  removeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  emptyCard: {
    padding: spacing['2xl'],
    margin: spacing.lg,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.headingLg,
    fontSize: 20,
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.bodyMd,
    color: colors.pineBlue[300],
    textAlign: 'center',
  },
});

export default BeginnersBookmarksScreen;


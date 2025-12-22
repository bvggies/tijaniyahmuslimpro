import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SectionList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { IslamicPattern } from '../../components/ui/IslamicPattern';
import { SearchBar } from '../../components/ui/SearchBar';
import { SegmentedTabs } from '../../components/ui/SegmentedTabs';
import { AZChips } from '../../components/ui/AZChips';
import { GlassCard } from '../../components/ui/GlassCard';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { beginnersPhrasesSections, BeginnersPhrase } from '../../data/tijaniyah/beginnersPhrases';
import { beginnersTermsSections, BeginnersTerm } from '../../data/tijaniyah/beginnersTerms';
import { beginnersBookmarksService } from '../../services/beginnersBookmarks';

type TabType = 'Phrases' | 'Terms';

interface GlossaryItem {
  id: string;
  term: string;
  alt?: string;
  definition: string;
  type: 'phrase' | 'term';
}

const heroText = `To better understand Islam it is necessary to know the meaning of certain key words and phrases used by Muslims in everyday conversation. Most of them are in the Arabic language, and there is often no equivalent in English or in other tongues.`;

export const BeginnersResourcesScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const sectionListRef = useRef<SectionList>(null);
  const [activeTab, setActiveTab] = useState<TabType>('Phrases');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isHeroExpanded, setIsHeroExpanded] = useState(false);
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Convert data to unified format
  const phrasesData: GlossaryItem[] = useMemo(() => {
    return beginnersPhrasesSections.flatMap((section) =>
      section.items.map((item) => ({
        id: item.id,
        term: item.term,
        alt: item.alt,
        definition: item.definition,
        type: 'phrase' as const,
      }))
    );
  }, []);

  const termsData: GlossaryItem[] = useMemo(() => {
    return beginnersTermsSections.flatMap((section) =>
      section.items.map((item) => ({
        id: item.id,
        term: item.term,
        definition: item.definition,
        type: 'term' as const,
      }))
    );
  }, []);

  const currentData = activeTab === 'Phrases' ? phrasesData : termsData;

  // Get available letters for current tab
  const availableLetters = useMemo(() => {
    const sections = activeTab === 'Phrases' ? beginnersPhrasesSections : beginnersTermsSections;
    return sections.map((s) => s.letter);
  }, [activeTab]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return currentData;

    const query = searchQuery.toLowerCase();
    return currentData.filter(
      (item) =>
        item.term.toLowerCase().includes(query) ||
        item.alt?.toLowerCase().includes(query) ||
        item.definition.toLowerCase().includes(query)
    );
  }, [currentData, searchQuery]);

  // Group filtered data by letter
  const sections = useMemo(() => {
    const grouped: { [key: string]: GlossaryItem[] } = {};

    filteredData.forEach((item) => {
      const firstLetter = item.term.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(item);
    });

    return Object.keys(grouped)
      .sort()
      .map((letter) => ({
        letter,
        data: grouped[letter],
      }));
  }, [filteredData]);

  // Load bookmarks
  useEffect(() => {
    const loadBookmarks = async () => {
      const bookmarks = await beginnersBookmarksService.getAllBookmarks();
      const ids = new Set(bookmarks.map((b) => `${b.type}-${b.id}`));
      setBookmarkedIds(ids);
    };
    void loadBookmarks();
  }, []);

  const handleLetterPress = (letter: string) => {
    setSelectedLetter(letter);
    const sectionIndex = sections.findIndex((s) => s.letter === letter);
    if (sectionIndex >= 0 && sectionListRef.current) {
      sectionListRef.current.scrollToLocation({
        sectionIndex,
        itemIndex: 0,
        viewOffset: 100,
        animated: true,
      });
    }
  };

  const handleItemPress = (item: GlossaryItem) => {
    (navigation as any).navigate('BeginnersTermDetail', { item });
  };

  const handleBookmarkToggle = async (item: GlossaryItem) => {
    const newState = await beginnersBookmarksService.toggleBookmark({
      id: item.id,
      type: item.type,
      term: item.term,
      alt: item.alt,
      definition: item.definition,
    });
    const bookmarkKey = `${item.type}-${item.id}`;
    if (newState) {
      setBookmarkedIds(new Set([...bookmarkedIds, bookmarkKey]));
    } else {
      const newSet = new Set(bookmarkedIds);
      newSet.delete(bookmarkKey);
      setBookmarkedIds(newSet);
    }
  };

  const handleBookmarksPress = () => {
    (navigation as any).navigate('BeginnersBookmarks');
  };

  const isLongHero = heroText.length > 300;
  const displayHeroText = isLongHero && !isHeroExpanded
    ? heroText.substring(0, 300) + '...'
    : heroText;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={[colors.darkTeal[950], colors.darkTeal[900]]}
        style={styles.gradient}
      >
        <IslamicPattern />

        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.pineBlue[100]} />
          </Pressable>
          <Text style={styles.headerTitle}>Resources for Beginners</Text>
          <View style={styles.headerActions}>
            <Pressable onPress={handleBookmarksPress} style={styles.headerActionButton}>
              <Ionicons name="bookmark" size={20} color={colors.pineBlue[300]} />
            </Pressable>
            <Pressable onPress={() => setShowInfoSheet(true)} style={styles.headerActionButton}>
              <Ionicons name="information-circle-outline" size={20} color={colors.pineBlue[300]} />
            </Pressable>
          </View>
        </View>

        {/* Hero Card */}
        <GlassCard style={styles.heroCard}>
          <Text style={styles.heroTitle}>RESOURCES FOR BEGINNERS</Text>
          <Text style={styles.heroBody}>{displayHeroText}</Text>
          {isLongHero && (
            <Pressable
              onPress={() => setIsHeroExpanded(!isHeroExpanded)}
              style={styles.expandButton}
            >
              <Text style={styles.expandText}>
                {isHeroExpanded ? 'Show less' : 'Read more'}
              </Text>
              <Ionicons
                name={isHeroExpanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.evergreen[500]}
              />
            </Pressable>
          )}
        </GlassCard>

        {/* Tabs */}
        <SegmentedTabs
          tabs={['Phrases', 'Terms']}
          selectedTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab as TabType);
            setSelectedLetter(null);
            setSearchQuery('');
          }}
        />

        {/* Search */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search terms (e.g., Bismillah, Wudu, Jannah)"
          />
        </View>

        {/* A-Z Index */}
        <AZChips
          availableLetters={availableLetters}
          selectedLetter={selectedLetter}
          onLetterPress={handleLetterPress}
        />

        {/* SectionList */}
        <SectionList
          ref={sectionListRef}
          sections={sections}
          keyExtractor={(item) => `${item.type}-${item.id}`}
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
                <Text style={styles.itemPreview} numberOfLines={1}>
                  {item.definition}
                </Text>
              </View>
              <View style={styles.itemActions}>
                <Pressable
                  onPress={() => handleBookmarkToggle(item)}
                  style={styles.bookmarkButton}
                >
                  <Ionicons
                    name={bookmarkedIds.has(`${item.type}-${item.id}`) ? 'bookmark' : 'bookmark-outline'}
                    size={20}
                    color={bookmarkedIds.has(`${item.type}-${item.id}`) ? colors.evergreen[500] : colors.pineBlue[300]}
                  />
                </Pressable>
                <Ionicons name="chevron-forward" size={20} color={colors.pineBlue[300]} />
              </View>
            </Pressable>
          )}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{section.letter}</Text>
            </View>
          )}
          ListEmptyComponent={
            <GlassCard style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <Ionicons name="search-outline" size={48} color={colors.pineBlue[300]} />
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptyMessage}>
                  Try adjusting your search query
                </Text>
              </View>
            </GlassCard>
          }
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(140, insets.bottom + 120) },
          ]}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
        />

        {/* Info Bottom Sheet */}
        <BottomSheet
          visible={showInfoSheet}
          onClose={() => setShowInfoSheet(false)}
          title="How to use glossary"
        >
          <Text style={styles.infoText}>
            • Use the tabs to switch between Phrases and Terms{'\n'}
            • Search by term name, abbreviation, or definition{'\n'}
            • Tap A-Z chips to jump to a letter section{'\n'}
            • Tap any item to view full definition{'\n'}
            • Bookmark items for quick access later
          </Text>
        </BottomSheet>
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
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkTeal[800],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  heroTitle: {
    ...typography.headingLg,
    fontSize: 20,
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  heroBody: {
    ...typography.bodyMd,
    fontSize: 14,
    color: colors.pineBlue[100],
    lineHeight: 22,
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
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    paddingVertical: spacing.sm,
    paddingTop: spacing.md,
    backgroundColor: colors.darkTeal[950],
  },
  sectionHeaderText: {
    ...typography.headingLg,
    fontSize: 18,
    color: colors.evergreen[500],
    fontWeight: '700',
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
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bookmarkButton: {
    padding: spacing.xs,
  },
  emptyCard: {
    padding: spacing['2xl'],
    marginTop: spacing.xl,
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
  infoText: {
    ...typography.bodyMd,
    fontSize: 14,
    color: colors.pineBlue[100],
    lineHeight: 24,
  },
});

export default BeginnersResourcesScreen;

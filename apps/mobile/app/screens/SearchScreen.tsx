import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { IslamicPattern } from '../../src/components/ui/IslamicPattern';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { EnhancedSearchBar } from '../../src/components/ui/EnhancedSearchBar';
import { useSearch, SearchCategory, SearchResult } from '../../src/hooks/useSearch';
import { Chip } from '../../src/components/ui/Chip';
import { CommonActions } from '@react-navigation/native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://tijaniyahmuslimpro-admin-mu.vercel.app';

const CATEGORIES: { id: SearchCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: 'grid-outline' },
  { id: 'quran', label: 'Quran', icon: 'book-outline' },
  { id: 'duas', label: 'Duas', icon: 'hands-outline' },
  { id: 'scholars', label: 'Scholars', icon: 'person-outline' },
  { id: 'tijaniyah', label: 'Tijaniyah', icon: 'flame-outline' },
  { id: 'features', label: 'Features', icon: 'apps-outline' },
  { id: 'community', label: 'Community', icon: 'chatbubbles-outline' },
  { id: 'events', label: 'Events', icon: 'calendar-outline' },
  { id: 'journal', label: 'Journal', icon: 'journal-outline' },
];

const getResultIcon = (type: SearchResult['type']) => {
  switch (type) {
    case 'quran':
      return 'book';
    case 'dua':
      return 'hands';
    case 'scholar':
    case 'scholar-content':
      return 'person';
    case 'tijaniyah':
      return 'flame';
    case 'community':
      return 'chatbubbles';
    case 'event':
      return 'calendar';
    case 'feature':
      return 'apps';
    case 'journal':
      return 'journal';
    default:
      return 'document';
  }
};

const getResultColor = (type: SearchResult['type']) => {
  switch (type) {
    case 'quran':
      return colors.evergreen[500];
    case 'dua':
      return '#FBBF24';
    case 'scholar':
    case 'scholar-content':
      return colors.pineBlue[300];
    case 'tijaniyah':
      return '#EF4444';
    case 'community':
      return '#8B5CF6';
    case 'event':
      return '#06B6D4';
    case 'feature':
      return '#10B981';
    case 'journal':
      return '#F59E0B';
    default:
      return colors.pineBlue[300];
  }
};

const SearchResultCard: React.FC<{
  result: SearchResult;
  onPress: () => void;
}> = ({ result, onPress }) => {
  const iconName = getResultIcon(result.type);
  const iconColor = getResultColor(result.type);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.resultCard,
        pressed && styles.resultCardPressed,
      ]}
    >
      <GlassCard style={styles.resultCardContent}>
        <View style={styles.resultHeader}>
          <View style={[styles.resultIconContainer, { backgroundColor: `${iconColor}15` }]}>
            <Ionicons name={iconName as any} size={22} color={iconColor} />
          </View>
          <View style={styles.resultTextContainer}>
            <Text style={styles.resultTitle} numberOfLines={1}>
              {result.title}
            </Text>
            {result.subtitle && (
              <Text style={styles.resultSubtitle} numberOfLines={1}>
                {result.subtitle}
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.pineBlue[300]} />
        </View>
        {result.description && (
          <Text style={styles.resultDescription} numberOfLines={2}>
            {result.description}
          </Text>
        )}
      </GlassCard>
    </Pressable>
  );
};

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SearchCategory>('all');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiAnswer, setShowAiAnswer] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { results, hasResults, count } = useSearch(query, category);
  const minQueryLength = 2;

  useEffect(() => {
    // Reset AI answer when query changes
    setShowAiAnswer(false);
    setAiAnswer(null);
  }, [query]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Wait a bit for visual feedback
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleSearch = async () => {
    if (!query.trim() || query.trim().length < minQueryLength) return;

    // If no results found, try AI Noor
    if (!hasResults && query.trim().length >= 3) {
      setAiLoading(true);
      setShowAiAnswer(true);
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        const res = await fetch(`${API_BASE_URL}/api/ai-noor`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ prompt: query }),
        });
        const json = await res.json();
        if (res.ok && json.answer) {
          setAiAnswer(json.answer);
        } else {
          setAiAnswer('I couldn\'t find an answer to your question. Please try rephrasing or check back later.');
        }
      } catch (error) {
        setAiAnswer('AI Noor is currently unavailable. Please try again later.');
      } finally {
        setAiLoading(false);
      }
    }
  };

  const handleResultPress = (result: SearchResult) => {
    switch (result.type) {
      case 'quran':
        navigation.getParent()?.getParent()?.dispatch(
          CommonActions.navigate('QuranTab', {
            screen: 'SurahReader',
            params: { surahNumber: result.metadata?.surahNumber },
          })
        );
        break;
      case 'dua':
        if (result.metadata?.route) {
          navigation.navigate(result.metadata.route as never);
        } else {
          navigation.navigate('TijaniyahDuas' as never);
        }
        break;
      case 'scholar':
        navigation.navigate('Scholars' as never, {
          screen: 'ScholarDetail',
          params: { scholarId: result.metadata?.scholarId },
        });
        break;
      case 'scholar-content':
        navigation.navigate('Scholars' as never, {
          screen: 'ScholarDetail',
          params: { 
            scholarId: result.metadata?.scholarId,
            contentId: result.metadata?.contentId,
          },
        });
        break;
      case 'tijaniyah':
        if (result.metadata?.screen) {
          navigation.navigate(result.metadata.screen as never);
        }
        break;
      case 'community':
        // Navigate to CommunityTab using parent navigator
        navigation.getParent()?.getParent()?.dispatch(
          CommonActions.navigate('CommunityTab', {
            screen: 'PostDetails',
            params: { postId: result.metadata?.postId },
          })
        );
        break;
      case 'event':
        navigation.navigate('Events' as never, {
          screen: 'EventDetail',
          params: { eventId: result.metadata?.eventId },
        });
        break;
      case 'feature':
        if (result.metadata?.route === 'QuranTab') {
          navigation.getParent()?.getParent()?.dispatch(
            CommonActions.navigate('QuranTab')
          );
        } else {
          navigation.navigate(result.metadata?.route as never);
        }
        break;
      case 'journal':
        navigation.navigate('Journal' as never);
        break;
    }
  };

  const groupedResults = results.reduce((acc, result) => {
    const type = result.type === 'scholar-content' ? 'scholar' : result.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'quran': return 'Quran';
      case 'dua': return 'Duas';
      case 'scholar': return 'Scholars';
      case 'tijaniyah': return 'Tijaniyah';
      case 'community': return 'Community';
      case 'event': return 'Events';
      case 'feature': return 'Features';
      case 'journal': return 'Journal';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
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
          <Text style={styles.headerTitle}>Search</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar - Larger and more visible */}
        <View style={styles.searchContainer}>
          <EnhancedSearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search everything: Quran, Duas, Scholars, Features, Events..."
            onSubmit={handleSearch}
            autoFocus={true}
          />
        </View>

        {/* Category Chips */}
        {query.length >= minQueryLength && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {CATEGORIES.map((cat) => (
              <Chip
                key={cat.id}
                label={cat.label}
                icon={cat.icon}
                selected={category === cat.id}
                onPress={() => setCategory(cat.id)}
              />
            ))}
          </ScrollView>
        )}

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(160, insets.bottom + 140) },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.evergreen[500]}
            />
          }
        >
          {query.length < minQueryLength ? (
            <EmptyState
              icon="search-outline"
              title="Search the app"
              message="Search for Quran surahs, duas, scholars, features, events, journal entries, and more. Everything in the app is searchable!"
            />
          ) : hasResults ? (
            <>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsCount}>
                  {count} result{count !== 1 ? 's' : ''} found
                </Text>
              </View>

              {Object.entries(groupedResults).map(([type, typeResults]) => (
                <View key={type} style={styles.resultGroup}>
                  <View style={styles.resultGroupHeader}>
                    <Text style={styles.resultGroupTitle}>
                      {getTypeLabel(type)}
                    </Text>
                    <Text style={styles.resultGroupCount}>
                      {typeResults.length}
                    </Text>
                  </View>
                  {typeResults.map((result) => (
                    <SearchResultCard
                      key={result.id}
                      result={result}
                      onPress={() => handleResultPress(result)}
                    />
                  ))}
                </View>
              ))}
            </>
          ) : showAiAnswer ? (
            <View style={styles.aiContainer}>
              <GlassCard style={styles.aiCard}>
                <View style={styles.aiHeader}>
                  <Ionicons name="sparkles" size={24} color={colors.evergreen[500]} />
                  <Text style={styles.aiTitle}>AI Noor Response</Text>
                </View>
                {aiLoading ? (
                  <View style={styles.aiLoading}>
                    <ActivityIndicator size="large" color={colors.evergreen[500]} />
                    <Text style={styles.aiLoadingText}>AI Noor is thinking...</Text>
                  </View>
                ) : aiAnswer ? (
                  <>
                    <Text style={styles.aiAnswer}>{aiAnswer}</Text>
                    <View style={styles.aiDisclaimer}>
                      <Ionicons name="information-circle" size={16} color={colors.pineBlue[300]} />
                      <Text style={styles.aiDisclaimerText}>
                        This response is generated by AI and should be verified with qualified scholars.
                      </Text>
                    </View>
                  </>
                ) : null}
              </GlassCard>
            </View>
          ) : (
            <EmptyState
              icon="search-outline"
              title="No results found"
              message="Try a different search term or ask AI Noor for help."
              actionLabel="Ask AI Noor"
              onAction={handleSearch}
            />
          )}
        </ScrollView>
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
    fontSize: 22,
    color: colors.white,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  categoriesContainer: {
    maxHeight: 60,
    marginBottom: spacing.md,
  },
  categoriesContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  resultsHeader: {
    marginBottom: spacing.lg,
  },
  resultsCount: {
    ...typography.headingMd,
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
  resultGroup: {
    marginBottom: spacing.xl,
  },
  resultGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  resultGroupTitle: {
    ...typography.headingMd,
    fontSize: 18,
    color: colors.white,
    fontWeight: '700',
  },
  resultGroupCount: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
    backgroundColor: colors.darkTeal[800],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  resultCard: {
    marginBottom: spacing.sm,
  },
  resultCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  resultCardContent: {
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  resultIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    ...typography.headingMd,
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
    marginBottom: 2,
  },
  resultSubtitle: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
  },
  resultDescription: {
    ...typography.bodyMd,
    fontSize: 13,
    color: colors.pineBlue[100],
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  aiContainer: {
    marginTop: spacing.lg,
  },
  aiCard: {
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  aiTitle: {
    ...typography.headingLg,
    fontSize: 18,
    color: colors.white,
    fontWeight: '700',
  },
  aiLoading: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  aiLoadingText: {
    ...typography.bodyMd,
    color: colors.pineBlue[300],
  },
  aiAnswer: {
    ...typography.bodyMd,
    fontSize: 15,
    color: colors.pineBlue[100],
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  aiDisclaimer: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.darkTeal[800],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  aiDisclaimerText: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
    flex: 1,
    lineHeight: 18,
  },
});

export default SearchScreen;

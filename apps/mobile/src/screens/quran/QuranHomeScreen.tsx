import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSurahs, useLastRead, useBookmarks } from '../../hooks/useQuran';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../components/ui/GlassCard';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Toast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';

export const QuranHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { data: surahs, isLoading } = useSurahs();
  const { data: lastRead } = useLastRead();
  const { data: bookmarks } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'meccan' | 'medinan' | 'short'>('all');
  const [showToast, setShowToast] = useState(false);
  const searchGlowAnim = useRef(new Animated.Value(0)).current;

  // Animate search glow on focus
  React.useEffect(() => {
    if (searchFocused) {
      Animated.timing(searchGlowAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(searchGlowAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [searchFocused, searchGlowAnim]);

  const filteredSurahs = React.useMemo(() => {
    let filtered = surahs || [];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.number.toString().includes(searchQuery),
      );
    }
    
    // Apply type filter
    if (filterType === 'meccan') {
      filtered = filtered.filter((s) => s.revelationType === 'Meccan');
    } else if (filterType === 'medinan') {
      filtered = filtered.filter((s) => s.revelationType === 'Medinan');
    } else if (filterType === 'short') {
      filtered = filtered.filter((s) => s.numberOfAyahs <= 50);
    }
    
    return filtered;
  }, [surahs, searchQuery, filterType]);

  const handleBookmarkPress = () => {
    navigation.navigate('Bookmarks' as never);
    // Show toast when navigating to bookmarks
    setShowToast(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={[colors.darkTeal[950], colors.darkTeal[900]]}
        style={styles.gradient}
      >
        <Toast
          visible={showToast}
          message="Saved to bookmarks"
          icon="bookmark"
          onHide={() => setShowToast(false)}
        />
        
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Quran</Text>
            <TouchableOpacity
              onPress={handleBookmarkPress}
              style={styles.bookmarkButton}
            >
              <Ionicons name="bookmark" size={24} color={colors.evergreen[500]} />
              {bookmarks && bookmarks.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{bookmarks.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Continue Reading - Above Search */}
          {lastRead && (
            <View style={styles.continueReadingContainer}>
              <GlassCard style={styles.lastReadCard}>
                <View style={styles.lastReadContent}>
                  <View style={styles.lastReadInfo}>
                    <Text style={styles.lastReadLabel}>Continue Reading</Text>
                    <Text style={styles.lastReadValue}>
                      {lastRead.surahName} • Ayah {lastRead.ayahNumber}
                    </Text>
                  </View>
                  <Button
                    label="Resume"
                    onPress={() =>
                      navigation.navigate('SurahReader' as never, {
                        surahNumber: lastRead.surahNumber,
                        ayahNumber: lastRead.ayahNumber,
                      } as never)
                    }
                    variant="primary"
                    style={styles.resumeButton}
                  />
                </View>
              </GlassCard>
            </View>
          )}

          {/* Search */}
          <View style={styles.searchContainer}>
            <Animated.View
              style={[
                styles.searchWrapper,
                {
                  borderColor: searchGlowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['rgba(255,255,255,0.12)', `rgba(8, 247, 116, 0.3)`],
                  }),
                  shadowColor: colors.evergreen[500],
                  shadowOpacity: searchGlowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.1],
                  }),
                  shadowRadius: 8,
                },
              ]}
            >
              <View style={styles.searchInputInner}>
                <Ionicons
                  name="search-outline"
                  size={20}
                  color={colors.pineBlue[300]}
                  style={styles.searchIcon}
                />
                <TextInput
                  placeholder="Search by surah name or number"
                  placeholderTextColor={colors.pineBlue[300]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  style={styles.searchTextInput}
                />
              </View>
            </Animated.View>
            
            {/* Filter Chips */}
            <View style={styles.filterChips}>
              <TouchableOpacity
                onPress={() => setFilterType('all')}
                style={[
                  styles.filterChip,
                  filterType === 'all' && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterType === 'all' && styles.filterChipTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilterType('meccan')}
                style={[
                  styles.filterChip,
                  filterType === 'meccan' && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterType === 'meccan' && styles.filterChipTextActive,
                  ]}
                >
                  Meccan
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilterType('medinan')}
                style={[
                  styles.filterChip,
                  filterType === 'medinan' && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterType === 'medinan' && styles.filterChipTextActive,
                  ]}
                >
                  Medinan
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilterType('short')}
                style={[
                  styles.filterChip,
                  filterType === 'short' && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterType === 'short' && styles.filterChipTextActive,
                  ]}
                >
                  Short
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Surahs List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Surahs</Text>
            {isLoading ? (
              <View>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} width="100%" height={72} style={{ marginBottom: spacing.md }} />
                ))}
              </View>
            ) : filteredSurahs.length > 0 ? (
              filteredSurahs.map((surah, index) => (
                <View key={surah.number}>
                  {index > 0 && <View style={styles.cardDivider} />}
                  <GlassCard style={styles.surahCard}>
                    <LinearGradient
                      colors={[colors.darkTeal[800], colors.darkTeal[700]]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.surahCardGradient}
                    >
                      {/* Evergreen accent line */}
                      <View style={styles.surahAccentLine} />
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate('SurahReader' as never, { surahNumber: surah.number } as never)
                        }
                        style={styles.surahTouchable}
                      >
                        <View style={styles.surahRow}>
                          <View style={styles.surahNumber}>
                            <Text style={styles.surahNumberText}>{surah.number}</Text>
                          </View>
                          <View style={styles.surahInfo}>
                            <Text style={styles.surahName}>{surah.englishName}</Text>
                            <Text style={styles.surahArabic}>{surah.name}</Text>
                            <Text style={styles.surahMeta}>
                              {surah.numberOfAyahs} ayahs • {surah.revelationType}
                            </Text>
                          </View>
                          <Ionicons 
                            name="chevron-forward" 
                            size={20} 
                            color={colors.pineBlue[300]} 
                            style={styles.chevronIcon}
                          />
                        </View>
                      </TouchableOpacity>
                    </LinearGradient>
                  </GlassCard>
                </View>
              ))
            ) : (
              <EmptyState
                icon="book-outline"
                title="No surahs found"
                message={searchQuery || filterType !== 'all' ? 'Try a different search term or filter' : 'Loading surahs...'}
              />
            )}
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Space for FAB (64) + bottom nav (56) + padding
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.headingLg,
    fontSize: 28,
    color: colors.white,
    fontWeight: '700',
  },
  bookmarkButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.evergreen[500],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    ...typography.bodySm,
    fontSize: 10,
    color: colors.darkTeal[950],
    fontWeight: '700',
  },
  continueReadingContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  lastReadCard: {
    padding: spacing.lg,
  },
  lastReadContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastReadInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  lastReadLabel: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    marginBottom: 4,
  },
  lastReadValue: {
    ...typography.bodyMd,
    color: colors.white,
    fontWeight: '600',
  },
  resumeButton: {
    minWidth: 100,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  searchWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.sm,
    backgroundColor: colors.darkTeal[800],
    minHeight: 56,
  },
  searchInputInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    flex: 1,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchTextInput: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    paddingVertical: spacing.sm,
  },
  filterChips: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.darkTeal[800],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterChipActive: {
    backgroundColor: `rgba(8, 247, 116, 0.15)`,
    borderColor: `rgba(8, 247, 116, 0.3)`,
  },
  filterChipText: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.evergreen[500],
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.headingMd,
    color: colors.white,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginVertical: spacing.sm,
  },
  surahCard: {
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  surahCardGradient: {
    position: 'relative',
    padding: spacing.lg,
    paddingLeft: spacing.lg + 3, // Extra padding for accent line
  },
  surahAccentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.evergreen[500],
  },
  surahTouchable: {
    flex: 1,
  },
  surahRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  surahNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.evergreen[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  surahNumberText: {
    ...typography.headingMd,
    fontSize: 18,
    color: colors.darkTeal[950],
    fontWeight: '700',
  },
  surahInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  surahName: {
    ...typography.headingMd,
    fontSize: 18,
    color: colors.white,
    marginBottom: 4,
  },
  surahArabic: {
    ...typography.bodyMd,
    fontSize: 18,
    color: colors.pineBlue[100],
    marginBottom: 4,
    fontWeight: '500',
  },
  surahMeta: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
  },
  chevronIcon: {
    opacity: 0.5,
  },
});

export default QuranHomeScreen;


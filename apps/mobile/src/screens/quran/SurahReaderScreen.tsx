import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useSurah,
  useAddBookmark,
  useDeleteBookmark,
  useSaveLastRead,
  useBookmarks,
} from '../../hooks/useQuran';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Animated Ayah Card Component
const AnimatedAyahCard: React.FC<{
  ayah: any;
  index: number;
  surahNumber: number;
  fontSize: number;
  showTranslation: boolean;
  isBookmarked: boolean;
  onBookmark: (ayah: any) => void;
  onRef: (ref: View | null, ayahNum: number) => void;
}> = ({
  ayah,
  index,
  surahNumber,
  fontSize,
  showTranslation,
  isBookmarked,
  onBookmark,
  onRef,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 30,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        delay: index * 30,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      ref={(ref) => onRef(ref, ayah.numberInSurah)}
      style={{
        opacity: fadeAnim,
        transform: [{ translateY }],
      }}
    >
      <GlassCard style={styles.ayahCard}>
        <View style={styles.ayahHeader}>
          <View style={styles.ayahNumberBadge}>
            <Text style={styles.ayahNumberText}>{ayah.numberInSurah}</Text>
          </View>
          {ayah.sajda && (
            <View style={styles.sajdaBadge}>
              <Ionicons name="moon" size={14} color={colors.evergreen[500]} />
              <Text style={styles.sajdaText}>Sajda</Text>
            </View>
          )}
          <TouchableOpacity onPress={() => onBookmark(ayah)} style={styles.bookmarkIcon}>
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isBookmarked ? colors.evergreen[500] : colors.pineBlue[300]}
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.ayahArabic, { fontSize }]}>{ayah.text}</Text>

        {showTranslation && ayah.translation && (
          <View style={styles.translationContainer}>
            <Text style={styles.translationLabel}>Translation</Text>
            <Text style={styles.ayahTranslation}>{ayah.translation}</Text>
          </View>
        )}

        {ayah.juz && (
          <Text style={styles.ayahMeta}>
            Juz {ayah.juz} • Page {ayah.page}
          </Text>
        )}
      </GlassCard>
    </Animated.View>
  );
};

export const SurahReaderScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { surahNumber, ayahNumber } = (route.params as any) || { surahNumber: 1, ayahNumber: 1 };
  const { data, isLoading } = useSurah(surahNumber);
  const { data: bookmarks } = useBookmarks();
  const addBookmark = useAddBookmark();
  const deleteBookmark = useDeleteBookmark();
  const saveLastRead = useSaveLastRead();
  const scrollViewRef = useRef<ScrollView>(null);
  const ayahRefs = useRef<{ [key: number]: View | null }>({});

  const [fontSize, setFontSize] = useState(20);
  const [showTranslation, setShowTranslation] = useState(true);
  const [currentAyah, setCurrentAyah] = useState(ayahNumber || 1);

  // Helper to check if ayah is bookmarked
  const isAyahBookmarked = (ayahNum: number) => {
    return bookmarks?.some(
      (b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNum,
    ) || false;
  };

  // Scroll to initial ayah on load
  useEffect(() => {
    if (data?.ayahs && ayahNumber && scrollViewRef.current) {
      setTimeout(() => {
        ayahRefs.current[ayahNumber]?.measureLayout(
          scrollViewRef.current as any,
          (x, y) => {
            scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 100), animated: true });
          },
          () => {},
        );
      }, 500);
    }
  }, [data, ayahNumber]);

  const handleBookmarkAyah = async (ayah: any) => {
    const isBookmarked = isAyahBookmarked(ayah.numberInSurah);
    
    if (isBookmarked) {
      // Find and delete bookmark
      const bookmark = bookmarks?.find(
        (b) => b.surahNumber === surahNumber && b.ayahNumber === ayah.numberInSurah,
      );
      if (bookmark) {
        deleteBookmark.mutate(bookmark.id);
      }
    } else {
      // Add bookmark
      addBookmark.mutate({
        surahNumber: surahNumber,
        ayahNumber: ayah.numberInSurah,
        surahName: data?.surah?.englishName || `Surah ${surahNumber}`,
        ayahText: ayah.text.substring(0, 100) + (ayah.text.length > 100 ? '...' : ''),
      });
    }
  };

  const handleSaveLastRead = () => {
    if (data?.surah) {
      saveLastRead.mutate({
        surahNumber: data.surah.number,
        ayahNumber: currentAyah,
        surahName: data.surah.englishName,
      });
    }
  };

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    // Find which ayah is currently visible (simplified - could be improved)
    if (data?.ayahs) {
      const visibleIndex = Math.floor(scrollY / 200);
      if (visibleIndex >= 0 && visibleIndex < data.ayahs.length) {
        setCurrentAyah(data.ayahs[visibleIndex].numberInSurah);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={[colors.darkTeal[950], colors.darkTeal[900]]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.pineBlue[100]} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {data?.surah?.englishName || `Surah ${surahNumber}`}
            </Text>
            {data?.surah && (
              <Text style={styles.headerSubtitle}>
                {data.surah.numberOfAyahs} ayahs • {data.surah.revelationType}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Bookmarks' as never)}
            style={styles.bookmarkButton}
          >
            <Ionicons name="bookmark" size={24} color={colors.evergreen[500]} />
          </TouchableOpacity>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={() => setFontSize(Math.max(16, fontSize - 2))}
            style={styles.controlButton}
          >
            <Ionicons name="remove" size={20} color={colors.pineBlue[100]} />
          </TouchableOpacity>
          <Text style={styles.fontSizeText}>{fontSize}</Text>
          <TouchableOpacity
            onPress={() => setFontSize(Math.min(32, fontSize + 2))}
            style={styles.controlButton}
          >
            <Ionicons name="add" size={20} color={colors.pineBlue[100]} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowTranslation(!showTranslation)}
            style={styles.controlButton}
          >
            <Ionicons
              name={showTranslation ? 'eye' : 'eye-off'}
              size={20}
              color={colors.pineBlue[100]}
            />
          </TouchableOpacity>
        </View>

        {/* Content - Scrolling list of ayahs */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Skeleton width="100%" height={200} style={{ marginBottom: spacing.md }} />
              <Skeleton width="100%" height={200} style={{ marginBottom: spacing.md }} />
              <Skeleton width="100%" height={200} />
            </View>
          ) : data?.ayahs && data.ayahs.length > 0 ? (
            <View style={styles.content}>
              {/* Bismillah for all surahs except Al-Fatiha and At-Tawbah */}
              {surahNumber !== 1 && surahNumber !== 9 && (
                <GlassCard style={styles.bismillahCard}>
                  <Text style={[styles.bismillah, { fontSize: fontSize + 4 }]}>
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </Text>
                  {showTranslation && (
                    <Text style={styles.bismillahTranslation}>
                      In the name of Allah, the Most Gracious, the Most Merciful.
                    </Text>
                  )}
                </GlassCard>
              )}

              {/* List of ayahs */}
              {data.ayahs.map((ayah, index) => (
                <AnimatedAyahCard
                  key={ayah.number}
                  ayah={ayah}
                  index={index}
                  surahNumber={surahNumber}
                  fontSize={fontSize}
                  showTranslation={showTranslation}
                  isBookmarked={isAyahBookmarked(ayah.numberInSurah)}
                  onBookmark={handleBookmarkAyah}
                  onRef={(ref, ayahNum) => {
                    ayahRefs.current[ayahNum] = ref;
                  }}
                />
              ))}

              {/* Save Last Read Button */}
              <Button
                label={`Save Last Read (Ayah ${currentAyah})`}
                onPress={handleSaveLastRead}
                variant="secondary"
                style={styles.saveButton}
              />
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>No ayahs found</Text>
            </View>
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
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkTeal[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  headerTitle: {
    ...typography.headingLg,
    fontSize: 20,
    color: colors.white,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
    marginTop: 2,
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkTeal[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkTeal[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontSizeText: {
    ...typography.bodyMd,
    color: colors.white,
    minWidth: 40,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  loadingText: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  bismillahCard: {
    padding: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  bismillah: {
    ...typography.headingLg,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: spacing.md,
  },
  bismillahTranslation: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    textAlign: 'center',
    fontStyle: 'italic',
  },
  ayahCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  ayahHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  ayahNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.evergreen[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  ayahNumberText: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.darkTeal[950],
    fontWeight: '700',
  },
  sajdaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(8, 247, 116, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(8, 247, 116, 0.3)',
    gap: 4,
  },
  sajdaText: {
    ...typography.bodySm,
    fontSize: 10,
    color: colors.evergreen[500],
    fontWeight: '600',
  },
  bookmarkIcon: {
    marginLeft: 'auto',
    padding: spacing.xs,
  },
  ayahArabic: {
    ...typography.headingLg,
    color: colors.white,
    textAlign: 'right',
    lineHeight: 48,
    marginBottom: spacing.md,
  },
  translationContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  translationLabel: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ayahTranslation: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    lineHeight: 24,
  },
  ayahMeta: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
    marginTop: spacing.sm,
  },
  saveButton: {
    marginTop: spacing.xl,
  },
});

export default SurahReaderScreen;

import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useBookmarks, useDeleteBookmark } from '../../hooks/useQuran';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../components/ui/GlassCard';
import { EmptyState } from '../../components/ui/EmptyState';

export const BookmarksScreen: React.FC = () => {
  const navigation = useNavigation();
  const { data: bookmarks, isLoading } = useBookmarks();
  const deleteBookmark = useDeleteBookmark();

  const handleDelete = (id: string) => {
    deleteBookmark.mutate(id);
  };

  const handleNavigate = (bookmark: any) => {
    navigation.navigate('SurahReader' as never, {
      surahNumber: bookmark.surahNumber,
      ayahNumber: bookmark.ayahNumber,
    } as never);
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
          <Text style={styles.headerTitle}>Bookmarks</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading bookmarks...</Text>
            </View>
          ) : bookmarks && bookmarks.length > 0 ? (
            <View style={styles.content}>
              {bookmarks.map((bookmark) => (
                <GlassCard key={bookmark.id} style={styles.bookmarkCard}>
                  <TouchableOpacity onPress={() => handleNavigate(bookmark)}>
                    <View style={styles.bookmarkRow}>
                      <View style={styles.bookmarkInfo}>
                        <Text style={styles.bookmarkSurah}>{bookmark.surahName}</Text>
                        <Text style={styles.bookmarkAyah}>Ayah {bookmark.ayahNumber}</Text>
                        <Text style={styles.bookmarkText} numberOfLines={2}>
                          {bookmark.ayahText}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDelete(bookmark.id)}
                        style={styles.deleteButton}
                      >
                        <Ionicons name="trash-outline" size={20} color={colors.pineBlue[300]} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </GlassCard>
              ))}
            </View>
          ) : (
            <EmptyState
              icon="bookmark-outline"
              title="No bookmarks yet"
              message="Bookmark ayahs while reading to access them here"
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
  },
  bookmarkCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  bookmarkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bookmarkInfo: {
    flex: 1,
  },
  bookmarkSurah: {
    ...typography.headingMd,
    fontSize: 18,
    color: colors.white,
    marginBottom: 2,
  },
  bookmarkAyah: {
    ...typography.bodySm,
    color: colors.evergreen[500],
    marginBottom: spacing.xs,
  },
  bookmarkText: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    lineHeight: 20,
  },
  deleteButton: {
    marginLeft: spacing.md,
    padding: spacing.xs,
  },
});

export default BookmarksScreen;


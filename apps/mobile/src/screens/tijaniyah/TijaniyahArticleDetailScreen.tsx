import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Share,
  Alert,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../components/ui/GlassCard';
import { IslamicPattern } from '../../components/ui/IslamicPattern';
import { Toast } from '../../components/ui/Toast';

interface ArticleContent {
  heading: string;
  body: string;
}

interface Article {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  content: ArticleContent[];
  references?: string[];
}

const BOOKMARKS_KEY = 'tijaniyah_article_bookmarks';

export const TijaniyahArticleDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { article } = (route.params as any) || {};
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    checkBookmark();
  }, [article?.id]);

  const checkBookmark = async () => {
    try {
      const bookmarks = await SecureStore.getItemAsync(BOOKMARKS_KEY);
      if (bookmarks) {
        const parsed = JSON.parse(bookmarks);
        setIsBookmarked(parsed.includes(article?.id));
      }
    } catch (error) {
      console.error('Error checking bookmark:', error);
    }
  };

  const toggleBookmark = async () => {
    try {
      const bookmarks = await SecureStore.getItemAsync(BOOKMARKS_KEY);
      let parsed: string[] = bookmarks ? JSON.parse(bookmarks) : [];

      if (isBookmarked) {
        parsed = parsed.filter((id) => id !== article.id);
        setIsBookmarked(false);
      } else {
        parsed.push(article.id);
        setIsBookmarked(true);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      }

      await SecureStore.setItemAsync(BOOKMARKS_KEY, JSON.stringify(parsed));
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      Alert.alert('Error', 'Failed to update bookmark');
    }
  };

  const handleShare = async () => {
    try {
      const shareText = `${article.title}\n\n${article.summary}\n\nRead more in Tijaniyah Muslim Pro`;
      await Share.share({
        message: shareText,
        title: article.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopy = (text: string) => {
    try {
      Clipboard.setString(text);
      Alert.alert('Copied', 'Text copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy text');
    }
  };

  const getFontSizeValue = () => {
    switch (fontSize) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  if (!article) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LinearGradient
          colors={[colors.darkTeal[950], colors.darkTeal[900]]}
          style={styles.gradient}
        >
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Article not found</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

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
          <View style={styles.headerActions}>
            <Pressable onPress={toggleBookmark} style={styles.iconButton}>
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={24}
                color={isBookmarked ? colors.evergreen[500] : colors.pineBlue[100]}
              />
            </Pressable>
            <Pressable onPress={handleShare} style={styles.iconButton}>
              <Ionicons name="share-outline" size={24} color={colors.pineBlue[100]} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={styles.title}>{article.title}</Text>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {article.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Font Size Controls */}
          <View style={styles.fontControls}>
            <Text style={styles.fontLabel}>Font Size:</Text>
            {(['small', 'medium', 'large'] as const).map((size) => (
              <Pressable
                key={size}
                onPress={() => setFontSize(size)}
                style={[
                  styles.fontButton,
                  fontSize === size && styles.fontButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.fontButtonText,
                    fontSize === size && styles.fontButtonTextActive,
                  ]}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Content Sections */}
          {article.content.map((section, index) => (
            <GlassCard key={index} style={styles.contentSection}>
              <Text style={styles.sectionHeading}>{section.heading}</Text>
              <Pressable
                onLongPress={() => handleCopy(section.body)}
                style={styles.bodyContainer}
              >
                <Text style={[styles.sectionBody, { fontSize: getFontSizeValue() }]}>
                  {section.body}
                </Text>
              </Pressable>
              <Text style={styles.copyHint}>Long press to copy</Text>
            </GlassCard>
          ))}

          {/* References */}
          {article.references && article.references.length > 0 && (
            <GlassCard style={styles.referencesCard}>
              <Text style={styles.referencesTitle}>References</Text>
              {article.references.map((ref, index) => (
                <Text key={index} style={styles.reference}>
                  • {ref}
                </Text>
              ))}
            </GlassCard>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>

        {showToast && (
          <Toast
            message="Saved to bookmarks"
            icon="bookmark"
            visible={showToast}
            onHide={() => setShowToast(false)}
          />
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
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkTeal[800],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  title: {
    ...typography.headingLg,
    fontSize: 24,
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.md,
    lineHeight: 32,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    backgroundColor: colors.darkTeal[800],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tagText: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
  },
  fontControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.darkTeal[800],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  fontLabel: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    marginRight: spacing.sm,
  },
  fontButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    backgroundColor: colors.darkTeal[700],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  fontButtonActive: {
    backgroundColor: colors.evergreen[500],
    borderColor: colors.evergreen[500],
  },
  fontButtonText: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
  },
  fontButtonTextActive: {
    color: colors.darkTeal[950],
    fontWeight: '600',
  },
  contentSection: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  sectionHeading: {
    ...typography.headingLg,
    fontSize: 20,
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  bodyContainer: {
    marginBottom: spacing.xs,
  },
  sectionBody: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    lineHeight: 26,
  },
  copyHint: {
    ...typography.bodySm,
    fontSize: 10,
    color: colors.pineBlue[300],
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  referencesCard: {
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  referencesTitle: {
    ...typography.headingLg,
    fontSize: 18,
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  reference: {
    ...typography.bodySm,
    color: colors.pineBlue[100],
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.headingLg,
    color: colors.white,
  },
  bottomPadding: {
    height: 100,
  },
});

export default TijaniyahArticleDetailScreen;


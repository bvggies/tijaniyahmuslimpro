import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Clipboard } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { IslamicPattern } from '../../components/ui/IslamicPattern';
import { GlassCard } from '../../components/ui/GlassCard';
import { Toast } from '../../components/ui/Toast';
import { beginnersBookmarksService, BeginnersBookmark } from '../../services/beginnersBookmarks';

type FontSize = 'small' | 'medium' | 'large';

interface RouteParams {
  item: {
    id: string;
    term: string;
    alt?: string;
    definition: string;
    type: 'phrase' | 'term';
  };
}

export const BeginnersTermDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { item } = (route.params as RouteParams) || {};

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const checkBookmark = async () => {
      if (item) {
        const bookmarked = await beginnersBookmarksService.isBookmarked(item.id, item.type);
        setIsBookmarked(bookmarked);
      }
    };
    void checkBookmark();
  }, [item]);

  if (!item) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LinearGradient
          colors={[colors.darkTeal[950], colors.darkTeal[900]]}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.pineBlue[100]} />
            </Pressable>
            <Text style={styles.headerTitle}>Term Detail</Text>
            <View style={styles.headerSpacer} />
          </View>
          <GlassCard style={styles.errorCard}>
            <Text style={styles.errorText}>Item not found</Text>
          </GlassCard>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const handleCopy = async () => {
    try {
      const text = `${item.term}${item.alt ? ` (${item.alt})` : ''}\n\n${item.definition}`;
      await Clipboard.setString(text);
      setToastMessage('Copied');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  const handleShare = async () => {
    try {
      const text = `${item.term}${item.alt ? ` (${item.alt})` : ''}\n\n${item.definition}`;
      await Share.share({
        message: text,
        title: item.term,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleBookmark = async () => {
    const newState = await beginnersBookmarksService.toggleBookmark({
      id: item.id,
      type: item.type,
      term: item.term,
      alt: item.alt,
      definition: item.definition,
    });
    setIsBookmarked(newState);
    setToastMessage(newState ? 'Saved to bookmarks' : 'Removed from bookmarks');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const fontSizeMap = {
    small: 13,
    medium: 15,
    large: 17,
  };

  const lineHeightMap = {
    small: 20,
    medium: 24,
    large: 28,
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
          <Text style={styles.headerTitle}>Term Detail</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(140, insets.bottom + 120) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Term Card */}
          <GlassCard style={styles.termCard}>
            <Text style={styles.termTitle}>{item.term}</Text>
            {item.alt && (
              <Text style={styles.termAlt}>{item.alt}</Text>
            )}
            <Text
              style={[
                styles.termDefinition,
                {
                  fontSize: fontSizeMap[fontSize],
                  lineHeight: lineHeightMap[fontSize],
                },
              ]}
            >
              {item.definition}
            </Text>
          </GlassCard>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <Pressable onPress={handleCopy} style={styles.actionButton}>
              <Ionicons name="copy-outline" size={20} color={colors.pineBlue[300]} />
              <Text style={styles.actionText}>Copy</Text>
            </Pressable>
            <Pressable onPress={handleBookmark} style={styles.actionButton}>
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={isBookmarked ? colors.evergreen[500] : colors.pineBlue[300]}
              />
              <Text style={[styles.actionText, isBookmarked && styles.actionTextActive]}>
                {isBookmarked ? 'Saved' : 'Bookmark'}
              </Text>
            </Pressable>
            <Pressable onPress={handleShare} style={styles.actionButton}>
              <Ionicons name="share-outline" size={20} color={colors.pineBlue[300]} />
              <Text style={styles.actionText}>Share</Text>
            </Pressable>
          </View>

          {/* Font Size Controls */}
          <GlassCard style={styles.fontSizeCard}>
            <Text style={styles.fontSizeLabel}>Font Size</Text>
            <View style={styles.fontSizeButtons}>
              <Pressable
                onPress={() => setFontSize('small')}
                style={[
                  styles.fontSizeButton,
                  fontSize === 'small' && styles.fontSizeButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.fontSizeButtonText,
                    fontSize === 'small' && styles.fontSizeButtonTextActive,
                  ]}
                >
                  A-
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setFontSize('medium')}
                style={[
                  styles.fontSizeButton,
                  fontSize === 'medium' && styles.fontSizeButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.fontSizeButtonText,
                    fontSize === 'medium' && styles.fontSizeButtonTextActive,
                  ]}
                >
                  A
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setFontSize('large')}
                style={[
                  styles.fontSizeButton,
                  fontSize === 'large' && styles.fontSizeButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.fontSizeButtonText,
                    fontSize === 'large' && styles.fontSizeButtonTextActive,
                  ]}
                >
                  A+
                </Text>
              </Pressable>
            </View>
          </GlassCard>
        </ScrollView>

        <Toast visible={showToast} message={toastMessage} icon="checkmark-circle" />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  termCard: {
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  termTitle: {
    fontSize: 24,
    lineHeight: 30,
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  termAlt: {
    ...typography.bodyMd,
    fontSize: 14,
    color: colors.evergreen[500],
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  termDefinition: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    lineHeight: 24,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionButton: {
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
  actionText: {
    ...typography.bodySm,
    fontSize: 13,
    color: colors.pineBlue[300],
    fontWeight: '500',
  },
  actionTextActive: {
    color: colors.evergreen[500],
  },
  fontSizeCard: {
    padding: spacing.lg,
  },
  fontSizeLabel: {
    ...typography.bodyMd,
    fontSize: 14,
    color: colors.pineBlue[300],
    marginBottom: spacing.md,
  },
  fontSizeButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  fontSizeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    backgroundColor: colors.darkTeal[700],
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  fontSizeButtonActive: {
    backgroundColor: colors.evergreen[500],
    borderColor: colors.evergreen[500],
  },
  fontSizeButtonText: {
    fontSize: 18,
    lineHeight: 24,
    color: colors.pineBlue[300],
    fontWeight: '600',
  },
  fontSizeButtonTextActive: {
    color: colors.darkTeal[950],
  },
  errorCard: {
    padding: spacing.xl,
    margin: spacing.lg,
  },
  errorText: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    textAlign: 'center',
  },
});

export default BeginnersTermDetailScreen;


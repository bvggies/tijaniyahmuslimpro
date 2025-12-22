import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Share,
  LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Clipboard } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { IslamicPattern } from '../../components/ui/IslamicPattern';
import { GlassCard } from '../../components/ui/GlassCard';
import { Toast } from '../../components/ui/Toast';
import { ReaderToolbar } from '../../components/reader/ReaderToolbar';
import { TOCModal } from '../../components/reader/TOCModal';
import { SearchInPageModal } from '../../components/reader/SearchInPageModal';
import { tasawwufPart1Data } from '../../data/tijaniyah/tasawwuf_part1';
import { parseReaderContent, ReaderBlock, TOCItem } from '../../utils/readerParser';
import { readerStorage, Highlight } from '../../services/readerStorage';

type FontSize = 'small' | 'medium' | 'large';

export const ProofOfTasawwufPart1Screen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const blockRefs = useRef<{ [key: string]: View | null }>({});
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [readingProgress, setReadingProgress] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [hasRestoredPosition, setHasRestoredPosition] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { blocks, toc } = useMemo(() => parseReaderContent(tasawwufPart1Data.raw), []);

  useEffect(() => {
    const loadData = async () => {
      const bookmarked = await readerStorage.isBookmarked();
      setIsBookmarked(bookmarked);
      const savedHighlights = await readerStorage.getHighlights();
      setHighlights(savedHighlights);
      const progress = await readerStorage.getProgress();
      setReadingProgress(progress);
    };
    void loadData();
    
    // Cleanup timeout on unmount
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Restore scroll position only once on mount when content is ready
    if (!hasRestoredPosition && readingProgress > 0 && contentHeight > 0 && !isUserScrolling) {
      const targetY = (contentHeight * readingProgress) / 100;
      // Only restore if progress is reasonable (not 100% or near 100%)
      if (readingProgress < 95) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: targetY, animated: false });
          setHasRestoredPosition(true);
        }, 200);
      } else {
        // If progress is 95%+, just mark as restored without scrolling
        setHasRestoredPosition(true);
      }
    }
  }, [readingProgress, contentHeight, hasRestoredPosition, isUserScrolling]);

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollY = contentOffset.y;
    const contentH = contentSize.height;
    const layoutH = layoutMeasurement.height;
    
    // Prevent division by zero or invalid calculations
    if (contentH <= layoutH || contentH <= 0) {
      return;
    }
    
    const maxScroll = contentH - layoutH;
    if (maxScroll <= 0) {
      return;
    }
    
    const progress = Math.min(100, Math.max(0, (scrollY / maxScroll) * 100));
    
    setScrollPosition(scrollY);
    setReadingProgress(progress);
    setIsUserScrolling(true);
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Mark as not scrolling after user stops scrolling for 500ms
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 500);
    
    // Debounce progress saving to avoid too many writes
    void readerStorage.setProgress(progress);
  };

  const handleBookmark = async () => {
    const newState = !isBookmarked;
    await readerStorage.setBookmark(newState);
    setIsBookmarked(newState);
    setToastMessage(newState ? 'Article bookmarked' : 'Bookmark removed');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${tasawwufPart1Data.title}\n\n${tasawwufPart1Data.subtitle}`,
        title: tasawwufPart1Data.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopy = async () => {
    try {
      // Copy currently visible paragraph or selected block
      const visibleBlock = blocks[Math.floor(blocks.length / 2)]; // Simplified: copy middle block
      await Clipboard.setString(visibleBlock.text);
      setToastMessage('Copied');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  const handleTOCItemPress = (item: TOCItem) => {
    const blockRef = blockRefs.current[item.id];
    if (blockRef && scrollViewRef.current) {
      blockRef.measureLayout(
        scrollViewRef.current as any,
        (x, y) => {
          scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 100), animated: true });
        },
        () => {
          blockRef.measureInWindow((x, y, width, height) => {
            scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 100), animated: true });
          });
        }
      );
    }
  };

  const handleSearchMatchPress = (blockId: string) => {
    const blockRef = blockRefs.current[blockId];
    if (blockRef && scrollViewRef.current) {
      blockRef.measureLayout(
        scrollViewRef.current as any,
        (x, y) => {
          scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 100), animated: true });
        },
        () => {
          blockRef.measureInWindow((x, y, width, height) => {
            scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 100), animated: true });
          });
        }
      );
    }
  };

  const handleLongPress = async (block: ReaderBlock) => {
    // Show action sheet for highlight/copy
    const isHighlighted = highlights.some((h) => h.blockId === block.id);
    if (isHighlighted) {
      await readerStorage.removeHighlight(block.id);
      const updated = await readerStorage.getHighlights();
      setHighlights(updated);
      setToastMessage('Highlight removed');
    } else {
      await readerStorage.addHighlight({ blockId: block.id, text: block.text });
      const updated = await readerStorage.getHighlights();
      setHighlights(updated);
      setToastMessage('Highlighted');
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const fontSizeMap = {
    small: 14,
    medium: 15,
    large: 17,
  };

  const lineHeightMap = {
    small: 22,
    medium: 24,
    large: 26,
  };

  const renderBlock = (block: ReaderBlock) => {
    const isHighlighted = highlights.some((h) => h.blockId === block.id);

    switch (block.type) {
      case 'heading':
        const headingSizes = { 1: 28, 2: 22, 3: 18 };
        const headingLineHeights = { 1: 34, 2: 28, 3: 24 };
        return (
          <View
            key={block.id}
            ref={(ref) => {
              blockRefs.current[block.id] = ref;
            }}
            style={styles.block}
          >
            <Text
              style={[
                styles.heading,
                {
                  fontSize: headingSizes[block.level || 1],
                  lineHeight: headingLineHeights[block.level || 1],
                },
              ]}
            >
              {block.text}
            </Text>
          </View>
        );

      case 'quote':
        return (
          <Pressable
            key={block.id}
            ref={(ref) => {
              blockRefs.current[block.id] = ref;
            }}
            onLongPress={() => handleLongPress(block)}
            style={[styles.block, styles.quoteBlock, isHighlighted && styles.highlightedBlock]}
          >
            <Text
              style={[
                styles.quote,
                {
                  fontSize: fontSizeMap[fontSize],
                  lineHeight: lineHeightMap[fontSize],
                },
              ]}
            >
              {block.text}
            </Text>
          </Pressable>
        );

      case 'list':
        return (
          <View
            key={block.id}
            ref={(ref) => {
              blockRefs.current[block.id] = ref;
            }}
            style={[styles.block, isHighlighted && styles.highlightedBlock]}
          >
            {block.items?.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text
                  style={[
                    styles.listText,
                    {
                      fontSize: fontSizeMap[fontSize],
                      lineHeight: lineHeightMap[fontSize],
                    },
                  ]}
                >
                  {item}
                </Text>
              </View>
            ))}
          </View>
        );

      default:
        return (
          <Pressable
            key={block.id}
            ref={(ref) => {
              blockRefs.current[block.id] = ref;
            }}
            onLongPress={() => handleLongPress(block)}
            style={[styles.block, isHighlighted && styles.highlightedBlock]}
          >
            <Text
              style={[
                styles.paragraph,
                {
                  fontSize: fontSizeMap[fontSize],
                  lineHeight: lineHeightMap[fontSize],
                },
              ]}
            >
              {block.text}
            </Text>
          </Pressable>
        );
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
          <Text style={styles.headerTitle}>Proof of Tasawwuf (Part 1)</Text>
          <View style={styles.headerActions}>
            <Pressable onPress={handleBookmark} style={styles.headerActionButton}>
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={isBookmarked ? colors.evergreen[500] : colors.pineBlue[300]}
              />
            </Pressable>
            <Pressable onPress={handleShare} style={styles.headerActionButton}>
              <Ionicons name="share-outline" size={20} color={colors.pineBlue[300]} />
            </Pressable>
          </View>
        </View>

        {/* Main Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>{tasawwufPart1Data.subtitle}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${readingProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(readingProgress)}%</Text>
        </View>

        {/* Content */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(160, insets.bottom + 140) },
          ]}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={(width, height) => {
            if (height > 0) {
              setContentHeight(height);
            }
          }}
          onScrollBeginDrag={() => setIsUserScrolling(true)}
          onScrollEndDrag={() => {
            // Keep isUserScrolling true briefly, then clear after timeout
            if (scrollTimeoutRef.current) {
              clearTimeout(scrollTimeoutRef.current);
            }
            scrollTimeoutRef.current = setTimeout(() => {
              setIsUserScrolling(false);
            }, 300);
          }}
          onMomentumScrollEnd={() => {
            // Clear scrolling flag when momentum scrolling ends
            if (scrollTimeoutRef.current) {
              clearTimeout(scrollTimeoutRef.current);
            }
            scrollTimeoutRef.current = setTimeout(() => {
              setIsUserScrolling(false);
            }, 200);
          }}
          showsVerticalScrollIndicator={false}
          bounces={true}
          scrollEnabled={true}
        >
          {blocks.map((block) => renderBlock(block))}
        </ScrollView>

        {/* Reader Toolbar */}
        <ReaderToolbar
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          onSearchPress={() => setShowSearch(true)}
          onTOCPress={() => setShowTOC(true)}
          onCopyPress={handleCopy}
        />

        {/* Modals */}
        <TOCModal
          visible={showTOC}
          onClose={() => setShowTOC(false)}
          toc={toc}
          onItemPress={handleTOCItemPress}
        />

        <SearchInPageModal
          visible={showSearch}
          onClose={() => setShowSearch(false)}
          blocks={blocks}
          onMatchPress={handleSearchMatchPress}
        />

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
    paddingBottom: spacing.md,
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
    fontSize: 18,
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
  titleContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  mainTitle: {
    fontSize: 24,
    lineHeight: 32,
    color: colors.white,
    fontWeight: '700',
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.darkTeal[800],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.evergreen[500],
  },
  progressText: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
    minWidth: 40,
    textAlign: 'right',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  block: {
    marginBottom: spacing.lg,
  },
  heading: {
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  paragraph: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    maxWidth: '93%',
  },
  quoteBlock: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.evergreen[500],
    marginVertical: spacing.md,
  },
  quote: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    fontStyle: 'italic',
    maxWidth: '93%',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  bullet: {
    ...typography.bodyMd,
    fontSize: 16,
    color: colors.evergreen[500],
    marginTop: 4,
  },
  listText: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    flex: 1,
    maxWidth: '92%',
  },
  highlightedBlock: {
    backgroundColor: 'rgba(8, 247, 116, 0.15)',
    borderRadius: 8,
    padding: spacing.sm,
  },
});

export default ProofOfTasawwufPart1Screen;

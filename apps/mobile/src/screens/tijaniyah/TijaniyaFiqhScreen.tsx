import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
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
import { SectionHeader } from '../../components/tijaniyah/SectionHeader';
import { FiqhCard } from '../../components/tijaniyah/FiqhCard';
import { JumpToChips } from '../../components/tijaniyah/JumpToChips';
import { Toast } from '../../components/ui/Toast';
import { GlassCard } from '../../components/ui/GlassCard';
import { tijaniyaFiqhContent, heroText } from '../../data/tijaniyah/tijaniyaFiqhContent';
import { bookmarksService } from '../../services/bookmarks';

const SECTION_IDS = [
  'overview',
  'lazim',
  'time-of-wird',
  'waziifa',
  'time-of-waziifa',
  'haylala',
];

const SECTION_LABELS = [
  'Conditions',
  'Lazim',
  'Time of Wird',
  'Waziifa',
  'Time of Waziifa',
  'Haylala',
];

export const TijaniyaFiqhScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<{ [key: string]: View | null }>({});
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showJumpTo, setShowJumpTo] = useState(true);
  const [isScreenBookmarked, setIsScreenBookmarked] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  React.useEffect(() => {
    const checkBookmark = async () => {
      const bookmarked = await bookmarksService.isBookmarked('tijaniya-fiqh-screen');
      setIsScreenBookmarked(bookmarked);
    };
    void checkBookmark();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const sectionRef = sectionRefs.current[sectionId];
    if (sectionRef && scrollViewRef.current) {
      sectionRef.measureLayout(
        scrollViewRef.current as any,
        (x, y) => {
          scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 20), animated: true });
        },
        () => {
          sectionRef.measureInWindow((x, y, width, height) => {
            scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 100), animated: true });
          });
        }
      );
      setSelectedSection(sectionId);
      setTimeout(() => setSelectedSection(null), 1000);
    }
  };

  const handleCopyAll = async () => {
    try {
      const allText = tijaniyaFiqhContent
        .map((section) => {
          const sectionText = section.cards
            .map((card) => `${card.title}\n\n${card.body}`)
            .join('\n\n---\n\n');
          return `${section.title}\n\n${sectionText}`;
        })
        .join('\n\n==========\n\n');
      
      await Clipboard.setString(allText);
      setToastMessage('All content copied');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error('Error copying all text:', error);
    }
  };

  const handleBookmarkScreen = async () => {
    const newState = await bookmarksService.toggleBookmark({
      id: 'tijaniya-fiqh-screen',
      type: 'screen',
      screenId: 'tijaniya-fiqh',
      title: 'Tijaniya Fiqh',
    });
    setIsScreenBookmarked(newState);
    setToastMessage(newState ? 'Screen bookmarked' : 'Bookmark removed');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
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
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.pineBlue[100]} />
          </Pressable>
          <Text style={styles.headerTitle}>Tijaniya Fiqh</Text>
          <View style={styles.headerActions}>
            <Pressable onPress={handleCopyAll} style={styles.headerActionButton}>
              <Ionicons name="copy-outline" size={20} color={colors.pineBlue[300]} />
            </Pressable>
            <Pressable onPress={handleBookmarkScreen} style={styles.headerActionButton}>
              <Ionicons
                name={isScreenBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={isScreenBookmarked ? colors.evergreen[500] : colors.pineBlue[300]}
              />
            </Pressable>
          </View>
        </View>

        {/* Jump to Section Bar */}
        <JumpToChips
          sections={SECTION_IDS.map((id, index) => ({ id, label: SECTION_LABELS[index] }))}
          selectedSection={selectedSection}
          onSectionPress={scrollToSection}
          onToggle={() => setShowJumpTo(!showJumpTo)}
          isExpanded={showJumpTo}
        />

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(140, insets.bottom + 120) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Card */}
          <GlassCard style={styles.heroCard}>
            <Text style={styles.heroTitle}>{heroText.title}</Text>
            <Text style={styles.heroSubtitle}>{heroText.subtitle}</Text>
          </GlassCard>

          {/* Sections */}
          {tijaniyaFiqhContent.map((section) => (
            <View
              key={section.id}
              style={styles.section}
              ref={(ref) => {
                sectionRefs.current[section.id] = ref;
              }}
            >
              <SectionHeader title={section.title} icon={section.icon} />
              {section.cards.map((card) => (
                <FiqhCard
                  key={card.id}
                  id={card.id}
                  title={card.title}
                  body={card.body}
                  color={card.color}
                  icon={card.icon}
                  isCollapsible={card.isCollapsible}
                  listStyle={card.listStyle}
                  listItems={card.listItems}
                />
              ))}
            </View>
          ))}

          {/* Optional Quote */}
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteText}>
              "May Allah accept our dhikr and make it easy for us."
            </Text>
          </View>
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
    fontSize: 22,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  heroCard: {
    padding: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  heroTitle: {
    ...typography.headingLg,
    fontSize: 24,
    color: colors.white,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    ...typography.bodyMd,
    fontSize: 15,
    color: colors.pineBlue[100],
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: spacing.lg,
  },
  quoteContainer: {
    alignItems: 'center',
    marginTop: spacing['2xl'],
    marginBottom: spacing.xl,
    paddingVertical: spacing.xl,
  },
  quoteText: {
    ...typography.bodyMd,
    fontSize: 16,
    color: colors.pineBlue[300],
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '92%',
  },
});

export default TijaniyaFiqhScreen;

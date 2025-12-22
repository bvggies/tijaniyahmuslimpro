import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { IslamicPattern } from '../../components/ui/IslamicPattern';
import { SectionHeader } from '../../components/tijaniyah/SectionHeader';
import { InfoCard } from '../../components/tijaniyah/InfoCard';
import { tariqaTijaniyyahContent, quoteText, quoteAttribution } from '../../data/tijaniyah/tariqaTijaniyyahContent';

const SECTION_IDS = [
  'introduction',
  'foundation',
  'expansion',
  'jihad-states',
  'practices',
];

const SECTION_LABELS = [
  'Introduction',
  'Foundation',
  'Expansion',
  'Jihad States',
  'Practices',
];

export const TariqaTijaniyyahScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<{ [key: string]: View | null }>({});
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showJumpTo, setShowJumpTo] = useState(true);

  const scrollToSection = (sectionId: string) => {
    const sectionRef = sectionRefs.current[sectionId];
    if (sectionRef && scrollViewRef.current) {
      sectionRef.measureLayout(
        scrollViewRef.current as any,
        (x, y) => {
          scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 20), animated: true });
        },
        () => {
          // Fallback: try measureInWindow
          sectionRef.measureInWindow((x, y, width, height) => {
            // Get scroll position and calculate offset
            scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 100), animated: true });
          });
        }
      );
      setSelectedSection(sectionId);
      setTimeout(() => setSelectedSection(null), 1000);
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
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.pineBlue[100]} />
          </Pressable>
          <Text style={styles.headerTitle}>Tariqa Tijaniyyah</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Jump to Section Bar */}
        {showJumpTo && (
          <View style={styles.jumpToContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.jumpToContent}
            >
              {SECTION_IDS.map((sectionId, index) => (
                <Pressable
                  key={sectionId}
                  onPress={() => scrollToSection(sectionId)}
                  style={[
                    styles.jumpToChip,
                    selectedSection === sectionId && styles.jumpToChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.jumpToChipText,
                      selectedSection === sectionId && styles.jumpToChipTextActive,
                    ]}
                  >
                    {SECTION_LABELS[index]}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              onPress={() => setShowJumpTo(false)}
              style={styles.jumpToClose}
            >
              <Ionicons name="chevron-up" size={18} color={colors.pineBlue[300]} />
            </Pressable>
          </View>
        )}

        {!showJumpTo && (
          <Pressable
            onPress={() => setShowJumpTo(true)}
            style={styles.jumpToToggle}
          >
            <Ionicons name="chevron-down" size={18} color={colors.pineBlue[300]} />
            <Text style={styles.jumpToToggleText}>Jump to section</Text>
          </Pressable>
        )}

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(140, insets.bottom + 120) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {tariqaTijaniyyahContent.map((section) => (
            <View
              key={section.id}
              style={styles.section}
              ref={(ref) => {
                sectionRefs.current[section.id] = ref;
              }}
            >
              <SectionHeader title={section.title} icon={section.icon} />
              {section.cards.map((card) => (
                <InfoCard
                  key={card.id}
                  title={card.title}
                  body={card.body}
                  color={card.color}
                  icon={card.icon}
                />
              ))}
            </View>
          ))}

          {/* Quote Block */}
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteText}>"{quoteText}"</Text>
            <Text style={styles.quoteAttribution}>– {quoteAttribution}</Text>
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
  headerSpacer: {
    width: 40,
  },
  jumpToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.darkTeal[900],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  jumpToContent: {
    flexDirection: 'row',
    gap: spacing.sm,
    flex: 1,
  },
  jumpToChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    backgroundColor: colors.darkTeal[800],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  jumpToChipActive: {
    backgroundColor: colors.evergreen[500],
    borderColor: colors.evergreen[500],
  },
  jumpToChipText: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
  },
  jumpToChipTextActive: {
    color: colors.darkTeal[950],
    fontWeight: '600',
  },
  jumpToClose: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  jumpToToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    backgroundColor: colors.darkTeal[900],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  jumpToToggleText: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
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
    marginBottom: spacing.sm,
    lineHeight: 24,
    maxWidth: '92%',
  },
  quoteAttribution: {
    ...typography.bodySm,
    fontSize: 14,
    color: colors.pineBlue[300],
    textAlign: 'center',
  },
});

export default TariqaTijaniyyahScreen;

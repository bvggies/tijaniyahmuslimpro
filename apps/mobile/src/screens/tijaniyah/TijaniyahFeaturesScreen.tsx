import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../components/ui/GlassCard';
import { IslamicPattern } from '../../components/ui/IslamicPattern';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TILE_WIDTH = (SCREEN_WIDTH - spacing.xl * 3) / 2;

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  gradient: string[];
}

const TIJANIYAH_FEATURES: FeatureCard[] = [
  {
    id: 'tariqa',
    title: 'Tariqa Tijaniyyah',
    description: 'Learn about the Tijani path',
    icon: 'book',
    route: 'TariqaTijaniyyah',
    gradient: [colors.darkTeal[800], colors.darkTeal[700]],
  },
  {
    id: 'fiqh',
    title: 'Tijaniya Fiqh',
    description: 'Conditions of Tijaniya Fiqh',
    icon: 'document-text',
    route: 'TijaniyaFiqh',
    gradient: [colors.darkTeal[800], colors.darkTeal[700]],
  },
  {
    id: 'beginners',
    title: 'Resources for Beginners',
    description: 'Islamic terms & phrases',
    icon: 'school',
    route: 'BeginnersResources',
    gradient: [colors.darkTeal[800], colors.darkTeal[700]],
  },
  {
    id: 'tasawwuf',
    title: 'Proof of Tasawwuf Part 1',
    description: 'Dhikr is the greatest obligation',
    icon: 'sparkles',
    route: 'ProofOfTasawwufPart1',
    gradient: [colors.darkTeal[800], colors.darkTeal[700]],
  },
];

export const TijaniyahFeaturesScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleFeaturePress = (feature: FeatureCard) => {
    navigation.navigate(feature.route as never);
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
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="star" size={24} color={colors.evergreen[500]} />
            </View>
            <Text style={styles.headerTitle}>Tijaniyah Features</Text>
            <Text style={styles.headerSubtitle}>
              Authentic Tijaniyah Practices & Resources
            </Text>
          </View>

          {/* Features Grid */}
          <View style={styles.grid}>
            {TIJANIYAH_FEATURES.map((feature) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                onPress={() => handleFeaturePress(feature)}
              />
            ))}
          </View>

          {/* Inspirational Quote */}
          <GlassCard style={styles.quoteCard}>
            <Ionicons name="quote" size={24} color={colors.evergreen[500]} style={styles.quoteIcon} />
            <Text style={styles.quoteText}>
              "The best of people are those who benefit others"
            </Text>
            <Text style={styles.quoteAuthor}>– Prophet Muhammad (SAW)</Text>
          </GlassCard>

          {/* Bottom Padding for Navigation */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const FeatureCard: React.FC<{
  feature: FeatureCard;
  onPress: () => void;
}> = ({ feature, onPress }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.cardContainer}
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={feature.gradient}
          style={styles.cardGradient}
        >
          <View style={styles.iconBubble}>
            <Ionicons
              name={feature.icon as any}
              size={28}
              color={colors.evergreen[500]}
            />
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {feature.title}
          </Text>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {feature.description}
          </Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  headerSpacer: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.darkTeal[800],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: {
    ...typography.headingLg,
    fontSize: 28,
    color: colors.white,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.bodyMd,
    color: colors.pineBlue[300],
    textAlign: 'center',
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  cardContainer: {
    width: TILE_WIDTH,
    marginBottom: spacing.md,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardGradient: {
    padding: spacing.lg,
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  iconBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(8, 247, 116, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.headingMd,
    fontSize: 16,
    color: colors.white,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  cardDescription: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
    textAlign: 'center',
    lineHeight: 18,
  },
  quoteCard: {
    padding: spacing.lg,
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  quoteIcon: {
    marginBottom: spacing.md,
  },
  quoteText: {
    ...typography.bodyMd,
    fontSize: 16,
    color: colors.pineBlue[100],
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  quoteAuthor: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
    textAlign: 'center',
  },
  bottomPadding: {
    height: 100,
  },
});

export default TijaniyahFeaturesScreen;


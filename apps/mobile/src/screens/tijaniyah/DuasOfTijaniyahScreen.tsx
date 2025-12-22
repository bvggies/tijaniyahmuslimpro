import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
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
import { DUAS_OF_TIJANIYAH } from '../../data/tijaniyah/duasOfTijaniyah';

export const DuasOfTijaniyahScreen: React.FC = () => {
  const navigation = useNavigation();

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
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Duas of Tijaniyah</Text>
            <Text style={styles.headerSubtitle}>Core Supplications</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Info Card */}
          <GlassCard style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="leaf" size={24} color={colors.evergreen[500]} />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Tijaniyah Supplications</Text>
                <Text style={styles.infoDescription}>
                  Core duas of the Tijaniyah path. Recite with sincerity and presence of heart.
                  Each dua has its specific context and benefits.
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Duas List */}
          <View style={styles.duasList}>
            {DUAS_OF_TIJANIYAH.map((dua, index) => (
              <Pressable
                key={dua.id}
                onPress={() => navigation.navigate(dua.route as never)}
              >
                <GlassCard style={styles.duaCard}>
                  <View style={styles.duaHeader}>
                    <View style={styles.duaNumberBadge}>
                      <Text style={styles.duaNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.duaTitleContainer}>
                      <Text style={styles.duaTitle}>{dua.title}</Text>
                      {dua.reference && (
                        <Text style={styles.duaReference}>{dua.reference}</Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.pineBlue[300]} />
                  </View>

                  {/* Preview Arabic Text */}
                  <View style={styles.arabicPreview}>
                    <Text style={styles.arabicPreviewText} numberOfLines={2}>
                      {dua.arabic}
                    </Text>
                  </View>

                  {/* Context Preview */}
                  {dua.context && (
                    <Text style={styles.contextPreview} numberOfLines={2}>
                      {dua.context}
                    </Text>
                  )}
                </GlassCard>
              </Pressable>
            ))}
          </View>

          {/* Footer Spacing */}
          <View style={styles.footer} />
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.headingLg,
    fontSize: 22,
    color: colors.white,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  infoCard: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    ...typography.headingLg,
    fontSize: 18,
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  infoDescription: {
    ...typography.bodySm,
    color: colors.pineBlue[100],
    lineHeight: 20,
  },
  duasList: {
    gap: spacing.lg,
  },
  duaCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  duaHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  duaNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.evergreen[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  duaNumberText: {
    ...typography.buttonSm,
    color: colors.darkTeal[950],
    fontWeight: '700',
  },
  duaTitleContainer: {
    flex: 1,
  },
  duaTitle: {
    ...typography.headingLg,
    fontSize: 18,
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  duaReference: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
    fontStyle: 'italic',
  },
  arabicPreview: {
    marginBottom: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.darkTeal[800],
    borderRadius: 8,
  },
  arabicPreviewText: {
    fontSize: 16,
    color: colors.pineBlue[100],
    textAlign: 'right',
    lineHeight: 24,
  },
  contextPreview: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    height: spacing['2xl'],
  },
});


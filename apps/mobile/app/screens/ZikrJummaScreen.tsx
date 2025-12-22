import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { IslamicPattern } from '../../src/components/ui/IslamicPattern';

interface ZikrItem {
  id: string;
  title: string;
  arabic: string;
  translation: string;
  count?: number;
}

const ZIKR_ITEMS: ZikrItem[] = [
  {
    id: '1',
    title: 'Salat al-Fatih',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ الْفَاتِحِ لِمَا أُغْلِقَ',
    translation: 'O Allah, send blessings upon our master Muhammad, the opener of what was closed',
    count: 1,
  },
  {
    id: '2',
    title: 'Jawharat al-Kamal',
    arabic: 'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ',
    translation: 'Glory be to Allah, and praise be to Allah, and there is no god but Allah',
    count: 100,
  },
  {
    id: '3',
    title: 'Salat al-Ibrahimiyya',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ',
    translation: 'O Allah, send blessings upon Muhammad and upon the family of Muhammad',
    count: 1,
  },
];

export const ZikrJummaScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedZikr, setSelectedZikr] = useState<string | null>(null);

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
            <Text style={styles.headerTitle}>Zikr Jumma</Text>
            <Text style={styles.headerSubtitle}>Friday Dhikr</Text>
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
              <Ionicons name="radio" size={24} color={colors.evergreen[500]} />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Friday Dhikr</Text>
                <Text style={styles.infoDescription}>
                  Special dhikr and supplications for Jumu'ah (Friday). Recite with presence of heart and devotion.
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Zikr Items */}
          <View style={styles.zikrList}>
            {ZIKR_ITEMS.map((zikr) => (
              <Pressable
                key={zikr.id}
                onPress={() => setSelectedZikr(selectedZikr === zikr.id ? null : zikr.id)}
              >
                <GlassCard style={styles.zikrCard}>
                  <View style={styles.zikrHeader}>
                    <View style={styles.zikrNumberBadge}>
                      <Text style={styles.zikrNumberText}>{zikr.id}</Text>
                    </View>
                    <View style={styles.zikrTitleContainer}>
                      <Text style={styles.zikrTitle}>{zikr.title}</Text>
                      {zikr.count && (
                        <Text style={styles.zikrCount}>×{zikr.count}</Text>
                      )}
                    </View>
                    <Ionicons
                      name={selectedZikr === zikr.id ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.pineBlue[300]}
                    />
                  </View>

                  {selectedZikr === zikr.id && (
                    <View style={styles.zikrExpanded}>
                      {/* Arabic Text */}
                      <View style={styles.arabicContainer}>
                        <Text style={styles.arabicText}>{zikr.arabic}</Text>
                      </View>

                      {/* Translation */}
                      <View style={styles.translationContainer}>
                        <View style={styles.translationHeader}>
                          <Ionicons name="language" size={16} color={colors.pineBlue[300]} />
                          <Text style={styles.translationLabel}>Translation</Text>
                        </View>
                        <Text style={styles.translationText}>{zikr.translation}</Text>
                      </View>
                    </View>
                  )}
                </GlassCard>
              </Pressable>
            ))}
          </View>

          {/* Guidance Card */}
          <GlassCard style={styles.guidanceCard}>
            <View style={styles.guidanceRow}>
              <Ionicons name="information-circle" size={20} color={colors.pineBlue[300]} />
              <View style={styles.guidanceText}>
                <Text style={styles.guidanceTitle}>Guidance</Text>
                <Text style={styles.guidanceDescription}>
                  Recite these dhikr with sincerity and presence of heart. Friday is a blessed day in Islam, and these supplications carry special merit.
                </Text>
              </View>
            </View>
          </GlassCard>

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
  zikrList: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  zikrCard: {
    padding: spacing.lg,
  },
  zikrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  zikrNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.evergreen[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  zikrNumberText: {
    ...typography.buttonSm,
    color: colors.darkTeal[950],
    fontWeight: '700',
  },
  zikrTitleContainer: {
    flex: 1,
  },
  zikrTitle: {
    ...typography.headingLg,
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
  zikrCount: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
    marginTop: 2,
  },
  zikrExpanded: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  arabicContainer: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.darkTeal[800],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  arabicText: {
    fontSize: 20,
    color: colors.pineBlue[100],
    textAlign: 'right',
    lineHeight: 32,
    fontWeight: '500',
  },
  translationContainer: {
    marginTop: spacing.sm,
  },
  translationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  translationLabel: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  translationText: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    lineHeight: 22,
  },
  guidanceCard: {
    padding: spacing.lg,
  },
  guidanceRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  guidanceText: {
    flex: 1,
  },
  guidanceTitle: {
    ...typography.bodyMd,
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  guidanceDescription: {
    ...typography.bodySm,
    color: colors.pineBlue[100],
    lineHeight: 20,
  },
  footer: {
    height: spacing['2xl'],
  },
});

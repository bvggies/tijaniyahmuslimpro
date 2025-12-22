import { useQuery } from '@tanstack/react-query';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { IslamicPattern } from '../../src/components/ui/IslamicPattern';
import { Button } from '../../src/components/ui/Button';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://tijaniyahmuslimpro-admin-mu.vercel.app';

interface TijaniyahDuaDto {
  id: string;
  title: string;
  arabic: string;
  translation: string;
  reference?: string | null;
}

// Fallback local duas data
const FALLBACK_DUAS: TijaniyahDuaDto[] = [
  {
    id: 'fallback-1',
    title: 'Duʿā Khatmul Wazifa',
    arabic: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ بِجَاهِ سَيِّدِنَا مُحَمَّدٍ ﷺ وَبِسِرِّ الطَّرِيقَةِ التِّجَانِيَّةِ أَنْ تَتَقَبَّلَ مِنَّا هَذَا الْوِرْدَ، وَأَنْ تَجْعَلَهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ، وَأَنْ تَنَفَعَنَا بِهِ فِي الدُّنْيَا وَالْآخِرَةِ، آمِينَ.',
    translation: 'O Allah, we ask You by the rank of our master Muḥammad ﷺ and by the secret of the Tijani path to accept this Wazifa from us, to make it purely for Your noble Face, and to benefit us by it in this world and the next. Amīn.',
    reference: 'Tijaniyah',
  },
  {
    id: 'fallback-2',
    title: 'Duʿā Rābil ʿIbādi',
    arabic: 'رَبِّ الْعِبَادِ، يَا مَنْ بِيَدِهِ مَقَادِيرُ الْخَلَائِقِ، يَا مَنْ لَا يَعْجِزُهُ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، اقْضِ حَوَائِجَنَا، وَيَسِّرْ أُمُورَنَا، وَفَرِّجْ هُمُومَنَا، وَاغْفِرْ لَنَا وَلِوَالِدِينَا وَلِإِخْوَانِنَا فِي الطَّرِيقَةِ التِّجَانِيَّةِ، آمِينَ.',
    translation: 'Lord of the servants, O He in Whose hand are the destinies of all creation, O He Whom nothing in the earth or the heavens can incapacitate, fulfill our needs, ease our affairs, relieve our worries, and forgive us, our parents, and our brothers in the Tijani path. Amīn.',
    reference: 'Tijaniyah',
  },
  {
    id: 'fallback-3',
    title: 'Duʿā Ḥasbil Muhaiminu',
    arabic: 'حَسْبِيَ الْمُهَيْمِنُ الَّذِي لَا يُحِيطُ بِهِ مَكَانٌ، وَلَا يَشْغَلُهُ شَأْنٌ عَنْ شَأْنٍ، حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.',
    translation: 'Sufficient for me is al‑Muhaimīn, Whom no place encompasses and Whom no affair distracts from any other affair. Sufficient for me is Allah—there is no god except Him; in Him I place my trust, and He is the Lord of the Mighty Throne.',
    reference: 'Tijaniyah',
  },
];

export function TijaniyahDuasScreen() {
  const navigation = useNavigation();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tijaniyahDuas'],
    queryFn: async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        const res = await fetch(`${API_BASE_URL}/api/tijaniyah-duas`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) {
          // Return fallback data instead of throwing
          return { duas: FALLBACK_DUAS, isFallback: true };
        }
        const jsonData = await res.json();
        return { duas: jsonData.duas || FALLBACK_DUAS, isFallback: false };
      } catch (err) {
        // On network error, return fallback data
        return { duas: FALLBACK_DUAS, isFallback: true };
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  const duas = data?.duas || [];
  const isUsingFallback = data?.isFallback || false;

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
            <Text style={styles.headerTitle}>Tijaniyah Duas</Text>
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
                  Core duas of the Tijaniyah path, including Khatmul Wazifa and Rābil ʿIbādi.
                  Recite with sincerity and presence of heart.
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Loading State */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.evergreen[500]} />
              <Text style={styles.loadingText}>Loading duas...</Text>
            </View>
          )}

          {/* Error State with Retry */}
          {error && !isUsingFallback && (
            <GlassCard style={styles.errorCard}>
              <View style={styles.errorContent}>
                <Ionicons name="alert-circle" size={32} color={colors.pineBlue[300]} />
                <Text style={styles.errorTitle}>Unable to Load</Text>
                <Text style={styles.errorMessage}>
                  Failed to load duas from server. Showing offline content.
                </Text>
                <Button
                  label="Retry"
                  onPress={() => refetch()}
                  variant="secondary"
                  style={styles.retryButton}
                />
              </View>
            </GlassCard>
          )}

          {/* Fallback Notice - Only show if there's an error and we have fallback data */}
          {error && isUsingFallback && duas.length > 0 && (
            <GlassCard style={styles.fallbackNotice}>
              <View style={styles.fallbackContent}>
                <Ionicons name="cloud-offline" size={20} color={colors.pineBlue[300]} />
                <Text style={styles.fallbackText}>
                  Showing offline content. Tap to refresh.
                </Text>
                <Pressable onPress={() => refetch()} style={styles.refreshButton}>
                  <Ionicons name="refresh" size={18} color={colors.evergreen[500]} />
                </Pressable>
              </View>
            </GlassCard>
          )}

          {/* Quick Access to Individual Duas */}
          <GlassCard style={styles.quickAccessCard}>
            <Text style={styles.quickAccessTitle}>Individual Duas</Text>
            <Text style={styles.quickAccessSubtitle}>
              Access detailed pages for each Tijaniyah dua
            </Text>
            <View style={styles.quickAccessButtons}>
              <Pressable
                style={styles.quickAccessButton}
                onPress={() => navigation.navigate('DuasOfTijaniyah' as never)}
              >
                <Ionicons name="book-outline" size={18} color={colors.evergreen[500]} />
                <Text style={styles.quickAccessButtonText}>All Duas</Text>
              </Pressable>
              <Pressable
                style={styles.quickAccessButton}
                onPress={() => navigation.navigate('DuaKhatmulWazifa' as never)}
              >
                <Ionicons name="sparkles-outline" size={18} color={colors.evergreen[500]} />
                <Text style={styles.quickAccessButtonText}>Khatmul Wazifa</Text>
              </Pressable>
              <Pressable
                style={styles.quickAccessButton}
                onPress={() => navigation.navigate('DuaRabilIbadi' as never)}
              >
                <Ionicons name="heart-outline" size={18} color={colors.evergreen[500]} />
                <Text style={styles.quickAccessButtonText}>Rabil Ibadi</Text>
              </Pressable>
              <Pressable
                style={styles.quickAccessButton}
                onPress={() => navigation.navigate('DuaHasbilMuhaiminu' as never)}
              >
                <Ionicons name="shield-outline" size={18} color={colors.evergreen[500]} />
                <Text style={styles.quickAccessButtonText}>Hasbil Muhaiminu</Text>
              </Pressable>
            </View>
          </GlassCard>

          {/* Duas List */}
          {duas.length > 0 && (
            <View style={styles.duasList}>
              {duas.map((dua, index) => (
                <GlassCard key={dua.id} style={styles.duaCard}>
                  {/* Dua Header */}
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
                  </View>

                  {/* Arabic Text */}
                  <View style={styles.arabicContainer}>
                    <Text style={styles.arabicText}>{dua.arabic}</Text>
                  </View>

                  {/* Translation */}
                  <View style={styles.translationContainer}>
                    <View style={styles.translationHeader}>
                      <Ionicons name="language" size={16} color={colors.pineBlue[300]} />
                      <Text style={styles.translationLabel}>Translation</Text>
                    </View>
                    <Text style={styles.translationText}>{dua.translation}</Text>
                  </View>
                </GlassCard>
              ))}
            </View>
          )}

          {/* Empty State */}
          {!isLoading && !error && !isUsingFallback && duas.length === 0 && (
            <GlassCard style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <Ionicons name="book-outline" size={48} color={colors.pineBlue[300]} />
                <Text style={styles.emptyTitle}>No Duas Available</Text>
                <Text style={styles.emptyMessage}>
                  Duas will appear here once they are added to the system.
                </Text>
              </View>
            </GlassCard>
          )}

          {/* Footer Spacing */}
          <View style={styles.footer} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  loadingText: {
    ...typography.bodyMd,
    color: colors.pineBlue[300],
    marginTop: spacing.md,
  },
  errorCard: {
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  errorContent: {
    alignItems: 'center',
  },
  errorTitle: {
    ...typography.headingLg,
    fontSize: 18,
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    textAlign: 'center',
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
  emptyCard: {
    padding: spacing['2xl'],
    marginTop: spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.headingLg,
    fontSize: 20,
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.bodyMd,
    color: colors.pineBlue[300],
    textAlign: 'center',
  },
  footer: {
    height: spacing['2xl'],
  },
  retryButton: {
    marginTop: spacing.md,
    alignSelf: 'center',
  },
  fallbackNotice: {
    padding: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.darkTeal[800],
  },
  fallbackContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fallbackText: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
    flex: 1,
  },
  refreshButton: {
    padding: spacing.xs,
  },
  quickAccessCard: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
    backgroundColor: colors.darkTeal[800],
  },
  quickAccessTitle: {
    ...typography.headingMd,
    fontSize: 18,
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  quickAccessSubtitle: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    marginBottom: spacing.md,
    fontSize: 12,
  },
  quickAccessButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickAccessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.darkTeal[700],
    borderWidth: 1,
    borderColor: 'rgba(8, 247, 116, 0.2)',
  },
  quickAccessButtonText: {
    ...typography.bodySm,
    color: colors.evergreen[500],
    fontSize: 12,
    fontWeight: '600',
  },
});

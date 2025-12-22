import { useQuery } from '@tanstack/react-query';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { IslamicPattern } from '../../src/components/ui/IslamicPattern';
import { Button } from '../../src/components/ui/Button';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://tijaniyahmuslimpro-admin-mu.vercel.app';

interface CampaignDto {
  id: string;
  title: string;
  description: string;
  goalAmount?: number | null;
  currentAmount?: number | null;
  isActive: boolean;
}

export function DonateScreen() {
  const navigation = useNavigation();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/campaigns`);
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Campaigns API error:', res.status, errorText);
          // Return empty array instead of throwing to show empty state
          return { campaigns: [], isFallback: true };
        }
        const jsonData = await res.json();
        return { campaigns: jsonData.campaigns || [], isFallback: false };
      } catch (err) {
        console.error('Campaigns fetch error:', err);
        // Return empty array instead of throwing
        return { campaigns: [], isFallback: true };
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  const activeCampaigns = data?.campaigns?.filter(c => c.isActive) ?? [];
  const isFallback = data?.isFallback ?? false;

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
            <Text style={styles.headerTitle}>Donate</Text>
            <Text style={styles.headerSubtitle}>Support Tijaniyah</Text>
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
              <Ionicons name="heart" size={24} color={colors.evergreen[500]} />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Support Tijaniyah Projects</Text>
                <Text style={styles.infoDescription}>
                  Support Tijaniyah projects and campaigns with full transparency. Your contributions help
                  spread knowledge and support the community.
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Loading State */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.evergreen[500]} />
              <Text style={styles.loadingText}>Loading campaigns...</Text>
            </View>
          )}

          {/* Fallback Notice */}
          {isFallback && !isLoading && (
            <GlassCard style={styles.fallbackNotice}>
              <View style={styles.fallbackContent}>
                <Ionicons name="cloud-offline" size={20} color={colors.pineBlue[300]} />
                <Text style={styles.fallbackText}>
                  Unable to load campaigns. Showing offline mode.
                </Text>
                <Pressable onPress={() => refetch()} style={styles.refreshButton}>
                  <Ionicons name="refresh" size={18} color={colors.evergreen[500]} />
                </Pressable>
              </View>
            </GlassCard>
          )}

          {/* Error State */}
          {error && !isFallback && (
            <GlassCard style={styles.errorCard}>
              <View style={styles.errorContent}>
                <Ionicons name="alert-circle" size={32} color={colors.pineBlue[300]} />
                <Text style={styles.errorTitle}>Unable to Load</Text>
                <Text style={styles.errorMessage}>
                  Failed to load campaigns. Please check your connection and try again.
                </Text>
                <Button
                  label="Retry"
                  onPress={() => refetch()}
                  variant="outline"
                  style={styles.errorButton}
                />
              </View>
            </GlassCard>
          )}

          {/* Campaigns List */}
          {activeCampaigns.length > 0 && (
            <View style={styles.campaignsList}>
              {activeCampaigns.map((campaign) => {
                const progress = campaign.goalAmount && campaign.currentAmount
                  ? Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100)
                  : null;

                return (
                  <GlassCard key={campaign.id} style={styles.campaignCard}>
                    <View style={styles.campaignHeader}>
                      <View style={styles.campaignIconContainer}>
                        <Ionicons name="heart" size={24} color={colors.evergreen[500]} />
                      </View>
                      <View style={styles.campaignInfo}>
                        <Text style={styles.campaignTitle}>{campaign.title}</Text>
                        <Text style={styles.campaignDescription}>{campaign.description}</Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    {progress !== null && campaign.goalAmount && campaign.currentAmount && (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${progress}%` },
                            ]}
                          />
                        </View>
                        <View style={styles.progressTextRow}>
                          <Text style={styles.progressText}>
                            {campaign.currentAmount.toLocaleString()} / {campaign.goalAmount.toLocaleString()}
                          </Text>
                          <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
                        </View>
                      </View>
                    )}

                    {campaign.goalAmount && !campaign.currentAmount && (
                      <Text style={styles.goalText}>
                        Goal: {campaign.goalAmount.toLocaleString()} (local currency)
                      </Text>
                    )}

                    <Button
                      label="View Details"
                      onPress={() => {
                        // TODO: Navigate to campaign details
                      }}
                      variant="primary"
                      style={styles.donateButton}
                    />
                  </GlassCard>
                );
              })}
            </View>
          )}

          {/* Empty State */}
          {!isLoading && !error && !isFallback && activeCampaigns.length === 0 && (
            <GlassCard style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <Ionicons name="heart-outline" size={48} color={colors.pineBlue[300]} />
                <Text style={styles.emptyTitle}>No Active Campaigns</Text>
                <Text style={styles.emptyMessage}>
                  No active campaigns right now. Please check back soon for opportunities to support
                  Tijaniyah projects.
                </Text>
              </View>
            </GlassCard>
          )}

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
  campaignsList: {
    gap: spacing.lg,
  },
  campaignCard: {
    padding: spacing.lg,
  },
  campaignHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  campaignIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.darkTeal[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  campaignInfo: {
    flex: 1,
  },
  campaignTitle: {
    ...typography.headingLg,
    fontSize: 18,
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  campaignDescription: {
    ...typography.bodySm,
    color: colors.pineBlue[100],
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.darkTeal[700],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.evergreen[500],
    borderRadius: 4,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
  },
  progressPercent: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.evergreen[500],
    fontWeight: '600',
  },
  goalText: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
    marginBottom: spacing.md,
  },
  donateButton: {
    width: '100%',
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.darkTeal[700],
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorButton: {
    width: '100%',
    marginTop: spacing.md,
  },
});

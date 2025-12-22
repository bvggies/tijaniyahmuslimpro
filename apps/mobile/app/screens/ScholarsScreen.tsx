import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { IslamicPattern } from '../../src/components/ui/IslamicPattern';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://tijaniyahmuslimpro-admin-mu.vercel.app';

interface ScholarDto {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  imageUrl?: string;
}

export const ScholarsScreen: React.FC = () => {
  const navigation = useNavigation();

  // Fallback scholars data
  const FALLBACK_SCHOLARS: ScholarDto[] = [
    {
      id: 'fallback-1',
      name: 'Shaykh Ahmad al-Tijani',
      title: 'Founder of the Tijaniyah Order',
      bio: 'Shaykh Ahmad ibn Muhammad al-Tijani (1737-1815 CE) was born in Aïn Madhi, Algeria. He received direct spiritual authorization from the Prophet Muhammad (peace be upon him) and established the Tijaniyah path.',
    },
    {
      id: 'fallback-2',
      name: 'Al-Hajj Umar Tall',
      title: 'Khalifa of the Western Sudan',
      bio: 'A 19th-century Fulbe leader who was appointed Khalifa of Ahmed at-Tijani for all of the Western Sudan. He played a key role in spreading the Tijaniyah order in West Africa.',
    },
    {
      id: 'fallback-3',
      name: 'Ibrahima Niass',
      title: 'Baye Niass - The Faydah',
      bio: 'Al-Hadj Ibrahima Niass founded the largest and most visible Tijani branch in Medina Baye, Kaolack. His teaching emphasized that all disciples can attain direct mystical knowledge of God.',
    },
  ];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['scholars'],
    queryFn: async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        const res = await fetch(`${API_BASE_URL}/api/scholars`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) {
          return { scholars: FALLBACK_SCHOLARS, isFallback: true };
        }
        const jsonData = await res.json();
        return { scholars: jsonData.scholars || FALLBACK_SCHOLARS, isFallback: false };
      } catch {
        return { scholars: FALLBACK_SCHOLARS, isFallback: true };
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

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
            <Text style={styles.headerTitle}>Tijaniyah Scholars</Text>
            <Text style={styles.headerSubtitle}>Knowledge & Guidance</Text>
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
              <Ionicons name="school" size={24} color={colors.evergreen[500]} />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Tijaniyah Scholars</Text>
                <Text style={styles.infoDescription}>
                  Learn about the esteemed scholars of the Tijaniyah path, their contributions, and their teachings.
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Loading State */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.evergreen[500]} />
              <Text style={styles.loadingText}>Loading scholars...</Text>
            </View>
          )}

          {/* Fallback Notice - Only show if there's an error and we have fallback data */}
          {error && data?.isFallback && data?.scholars && data.scholars.length > 0 && (
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

          {/* Scholars List */}
          {(data?.scholars && data.scholars.length > 0) && (
            <View style={styles.scholarsList}>
              {data.scholars.map((scholar) => (
                <GlassCard key={scholar.id} style={styles.scholarCard}>
                  <View style={styles.scholarHeader}>
                    <View style={styles.scholarIconContainer}>
                      <Ionicons name="person" size={24} color={colors.evergreen[500]} />
                    </View>
                    <View style={styles.scholarInfo}>
                      <Text style={styles.scholarName}>{scholar.name}</Text>
                      {scholar.title && (
                        <Text style={styles.scholarTitle}>{scholar.title}</Text>
                      )}
                      {scholar.bio && (
                        <Text style={styles.scholarBio} numberOfLines={3}>
                          {scholar.bio}
                        </Text>
                      )}
                    </View>
                  </View>
                </GlassCard>
              ))}
            </View>
          )}

          {/* Empty State */}
          {!isLoading && !data?.isFallback && (!data?.scholars || data.scholars.length === 0) && (
            <GlassCard style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <Ionicons name="school-outline" size={48} color={colors.pineBlue[300]} />
                <Text style={styles.emptyTitle}>No Scholars Available</Text>
                <Text style={styles.emptyMessage}>
                  Scholar profiles will appear here once they are added to the system.
                </Text>
              </View>
            </GlassCard>
          )}

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
  scholarsList: {
    gap: spacing.md,
  },
  scholarCard: {
    padding: spacing.lg,
  },
  scholarHeader: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  scholarIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.darkTeal[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  scholarInfo: {
    flex: 1,
  },
  scholarName: {
    ...typography.headingLg,
    fontSize: 18,
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  scholarTitle: {
    ...typography.bodyMd,
    fontSize: 14,
    color: colors.evergreen[500],
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  scholarBio: {
    ...typography.bodySm,
    color: colors.pineBlue[100],
    lineHeight: 20,
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
    padding: spacing.xs,
  },
});

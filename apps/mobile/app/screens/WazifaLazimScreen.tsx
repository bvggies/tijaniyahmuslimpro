import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
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

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://tijaniyahmuslimpro-admin-mu.vercel.app';

interface WazifaDto {
  id: string;
  title: string;
  description?: string | null;
  target?: number | null;
  completed: boolean;
}

interface LazimDto {
  id: string;
  title: string;
  description?: string | null;
  frequency: string;
  completed: boolean;
}

export function WazifaLazimScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  // Fallback data
  const FALLBACK_WAZIFAS: WazifaDto[] = [
    {
      id: 'fallback-1',
      title: 'Daily Wazifa',
      description: 'Complete your daily Tijaniyah Wazifa',
      target: 1,
      completed: false,
    },
  ];

  const FALLBACK_LAZIMS: LazimDto[] = [
    {
      id: 'fallback-1',
      title: 'Daily Lazim',
      description: 'Complete your daily Lazim commitment',
      frequency: 'Daily',
      completed: false,
    },
  ];

  const { data: wazifaData, isLoading: wazifaLoading, error: wazifaError } = useQuery({
    queryKey: ['wazifa'],
    queryFn: async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        const res = await fetch(`${API_BASE_URL}/api/wazifa`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) {
          return { wazifas: FALLBACK_WAZIFAS, isFallback: true };
        }
        const jsonData = await res.json();
        return { wazifas: jsonData.wazifas || FALLBACK_WAZIFAS, isFallback: false };
      } catch {
        return { wazifas: FALLBACK_WAZIFAS, isFallback: true };
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  const { data: lazimData, isLoading: lazimLoading, error: lazimError } = useQuery({
    queryKey: ['lazim'],
    queryFn: async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        const res = await fetch(`${API_BASE_URL}/api/lazim`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) {
          return { lazims: FALLBACK_LAZIMS, isFallback: true };
        }
        const jsonData = await res.json();
        return { lazims: jsonData.lazims || FALLBACK_LAZIMS, isFallback: false };
      } catch {
        return { lazims: FALLBACK_LAZIMS, isFallback: true };
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  const toggleWazifa = useMutation({
    mutationFn: async (id: string) => {
      const token = await SecureStore.getItemAsync('accessToken');
      const current = wazifaData?.wazifas.find(w => w.id === id);
      if (!current) return;
      const res = await fetch(`${API_BASE_URL}/api/wazifa`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id, completed: !current.completed }),
      });
      if (!res.ok) throw new Error('Failed to update wazifa');
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['wazifa'] });
    },
  });

  const toggleLazim = useMutation({
    mutationFn: async (id: string) => {
      const token = await SecureStore.getItemAsync('accessToken');
      const current = lazimData?.lazims.find(l => l.id === id);
      if (!current) return;
      const res = await fetch(`${API_BASE_URL}/api/lazim`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id, completed: !current.completed }),
      });
      if (!res.ok) throw new Error('Failed to update lazim');
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['lazim'] });
    },
  });

  const wazifas = wazifaData?.wazifas ?? FALLBACK_WAZIFAS;
  const lazims = lazimData?.lazims ?? FALLBACK_LAZIMS;
  const wazifaCompleted = wazifas.filter(w => w.completed).length;
  const lazimCompleted = lazims.filter(l => l.completed).length;
  const wazifaProgress = wazifas.length > 0 ? (wazifaCompleted / wazifas.length) * 100 : 0;
  const lazimProgress = lazims.length > 0 ? (lazimCompleted / lazims.length) * 100 : 0;

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
            <Text style={styles.headerTitle}>Wazifa & Lazim</Text>
            <Text style={styles.headerSubtitle}>Tijaniyah Commitments</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <GlassCard style={styles.statCard}>
              <View style={styles.statContent}>
                <Ionicons name="sparkles" size={24} color={colors.evergreen[500]} />
                <Text style={styles.statValue}>{wazifaCompleted}/{wazifas.length}</Text>
                <Text style={styles.statLabel}>Wazifa</Text>
                <View style={styles.statProgressBar}>
                  <View
                    style={[
                      styles.statProgressFill,
                      { width: `${wazifaProgress}%` },
                    ]}
                  />
                </View>
              </View>
            </GlassCard>

            <GlassCard style={styles.statCard}>
              <View style={styles.statContent}>
                <Ionicons name="star" size={24} color={colors.evergreen[500]} />
                <Text style={styles.statValue}>{lazimCompleted}/{lazims.length}</Text>
                <Text style={styles.statLabel}>Lazim</Text>
                <View style={styles.statProgressBar}>
                  <View
                    style={[
                      styles.statProgressFill,
                      { width: `${lazimProgress}%` },
                    ]}
                  />
                </View>
              </View>
            </GlassCard>
          </View>

          {/* Wazifa Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="sparkles" size={20} color={colors.evergreen[500]} />
              <Text style={styles.sectionTitle}>Daily Wazifa</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Track your daily Tijaniyah Wazifa commitments
            </Text>

            {wazifaLoading ? (
              <GlassCard style={styles.loadingCard}>
                <Text style={styles.loadingText}>Loading wazifa...</Text>
              </GlassCard>
            ) : wazifas.length > 0 ? (
              <View style={styles.itemsList}>
                {wazifas.map((w) => (
                  <WazifaItem
                    key={w.id}
                    wazifa={w}
                    onToggle={() => toggleWazifa.mutate(w.id)}
                    isUpdating={toggleWazifa.isPending}
                  />
                ))}
              </View>
            ) : (
              <GlassCard style={styles.emptyCard}>
                <View style={styles.emptyContent}>
                  <Ionicons name="sparkles-outline" size={32} color={colors.pineBlue[300]} />
                  <Text style={styles.emptyText}>No wazifa entries yet</Text>
                  <Text style={styles.emptySubtext}>
                    Wazifa entries will appear here once created
                  </Text>
                </View>
              </GlassCard>
            )}
          </View>

          {/* Lazim Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star" size={20} color={colors.evergreen[500]} />
              <Text style={styles.sectionTitle}>Lazim</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Track your Lazim completion progress
            </Text>

            {lazimLoading ? (
              <GlassCard style={styles.loadingCard}>
                <Text style={styles.loadingText}>Loading lazim...</Text>
              </GlassCard>
            ) : lazims.length > 0 ? (
              <View style={styles.itemsList}>
                {lazims.map((l) => (
                  <LazimItem
                    key={l.id}
                    lazim={l}
                    onToggle={() => toggleLazim.mutate(l.id)}
                    isUpdating={toggleLazim.isPending}
                  />
                ))}
              </View>
            ) : (
              <GlassCard style={styles.emptyCard}>
                <View style={styles.emptyContent}>
                  <Ionicons name="star-outline" size={32} color={colors.pineBlue[300]} />
                  <Text style={styles.emptyText}>No lazim entries yet</Text>
                  <Text style={styles.emptySubtext}>
                    Lazim entries will appear here once created
                  </Text>
                </View>
              </GlassCard>
            )}
          </View>

          <View style={styles.footer} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

// Wazifa Item Component
const WazifaItem: React.FC<{
  wazifa: WazifaDto;
  onToggle: () => void;
  isUpdating: boolean;
}> = ({ wazifa, onToggle, isUpdating }) => {
  return (
    <Pressable onPress={onToggle} disabled={isUpdating}>
      <GlassCard style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>{wazifa.title}</Text>
            {wazifa.description && (
              <Text style={styles.itemDescription}>{wazifa.description}</Text>
            )}
            {wazifa.target && (
              <Text style={styles.itemTarget}>Target: {wazifa.target}</Text>
            )}
          </View>
          <View
            style={[
              styles.checkbox,
              wazifa.completed && styles.checkboxChecked,
            ]}
          >
            {wazifa.completed && (
              <Ionicons name="checkmark" size={20} color={colors.darkTeal[950]} />
            )}
          </View>
        </View>
        {wazifa.completed && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={colors.evergreen[500]} />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        )}
      </GlassCard>
    </Pressable>
  );
};

// Lazim Item Component
const LazimItem: React.FC<{
  lazim: LazimDto;
  onToggle: () => void;
  isUpdating: boolean;
}> = ({ lazim, onToggle, isUpdating }) => {
  return (
    <Pressable onPress={onToggle} disabled={isUpdating}>
      <GlassCard style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>{lazim.title}</Text>
            {lazim.description && (
              <Text style={styles.itemDescription}>{lazim.description}</Text>
            )}
            <View style={styles.frequencyContainer}>
              <Ionicons name="time" size={14} color={colors.pineBlue[300]} />
              <Text style={styles.frequencyText}>{lazim.frequency}</Text>
            </View>
          </View>
          <View
            style={[
              styles.checkbox,
              lazim.completed && styles.checkboxChecked,
            ]}
          >
            {lazim.completed && (
              <Ionicons name="checkmark" size={20} color={colors.darkTeal[950]} />
            )}
          </View>
        </View>
        {lazim.completed && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={colors.evergreen[500]} />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        )}
      </GlassCard>
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
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.headingLg,
    fontSize: 28,
    color: colors.white,
    fontWeight: '700',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
    marginBottom: spacing.sm,
  },
  statProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.darkTeal[700],
    borderRadius: 2,
    overflow: 'hidden',
  },
  statProgressFill: {
    height: '100%',
    backgroundColor: colors.evergreen[500],
    borderRadius: 2,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.headingLg,
    fontSize: 20,
    color: colors.white,
    fontWeight: '700',
  },
  sectionDescription: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    marginBottom: spacing.md,
  },
  itemsList: {
    gap: spacing.md,
  },
  itemCard: {
    padding: spacing.lg,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    ...typography.headingLg,
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  itemDescription: {
    ...typography.bodySm,
    color: colors.pineBlue[100],
    marginBottom: spacing.xs,
  },
  itemTarget: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
  },
  frequencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  frequencyText: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.pineBlue[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.evergreen[500],
    borderColor: colors.evergreen[500],
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    backgroundColor: colors.darkTeal[800],
  },
  completedText: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.evergreen[500],
    fontWeight: '600',
  },
  loadingCard: {
    padding: spacing.lg,
  },
  loadingText: {
    ...typography.bodyMd,
    color: colors.pineBlue[300],
    textAlign: 'center',
  },
  emptyCard: {
    padding: spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyText: {
    ...typography.headingLg,
    fontSize: 16,
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    textAlign: 'center',
  },
  footer: {
    height: spacing['2xl'],
  },
});

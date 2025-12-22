import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { colors } from '../src/theme/colors';
import { spacing } from '../src/theme/spacing';
import { typography } from '../src/theme/typography';
import { GlassCard } from '../src/components/ui/GlassCard';
import { IslamicPattern } from '../src/components/ui/IslamicPattern';
import { Button } from '../src/components/ui/Button';
// Haptics - optional, will gracefully degrade if not available
let Haptics: any = null;
try {
  Haptics = require('expo-haptics');
} catch {
  // Haptics not available, will use no-op functions
  Haptics = {
    impactAsync: () => {},
    notificationAsync: () => {},
  };
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://tijaniyahmuslimpro-admin-mu.vercel.app';

interface TasbihSessionDto {
  id: string;
  phrase: string;
  target?: number | null;
  count: number;
}

const DEFAULT_PHRASES = [
  { text: 'SubḥānAllāh', arabic: 'سُبْحَانَ اللَّهِ', meaning: 'Glory be to Allah' },
  { text: 'Alḥamdulillāh', arabic: 'الْحَمْدُ لِلَّهِ', meaning: 'Praise be to Allah' },
  { text: 'Allāhu Akbar', arabic: 'اللَّهُ أَكْبَرُ', meaning: 'Allah is the Greatest' },
  { text: 'Lā ilāha illā Allāh', arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', meaning: 'There is no god but Allah' },
  { text: 'Astaghfirullāh', arabic: 'أَسْتَغْفِرُ اللَّه', meaning: 'I seek forgiveness from Allah' },
  { text: 'Lā ḥawla wa lā quwwata illā billāh', arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', meaning: 'There is no power except with Allah' },
];

export function TasbihScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [selectedPhrase, setSelectedPhrase] = useState(DEFAULT_PHRASES[0].text);
  const [localCount, setLocalCount] = useState(0);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetInput, setTargetInput] = useState('');
  const queryClient = useQueryClient();
  
  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;

  // Fetch current session
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['tasbihSession', selectedPhrase],
    queryFn: async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        const res = await fetch(`${API_BASE_URL}/api/tasbih-session?phrase=${encodeURIComponent(selectedPhrase)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) {
          // If no session exists, return default
          return { session: { phrase: selectedPhrase, count: 0, target: null } };
        }
        const json = await res.json();
        return json as { session: TasbihSessionDto };
      } catch (error) {
        // On error, return default
        return { session: { phrase: selectedPhrase, count: 0, target: null } };
      }
    },
    retry: 1,
  });

  // Initialize local count from session
  useEffect(() => {
    if (data?.session) {
      const count = data.session.count || 0;
      setLocalCount(count);
    }
  }, [data?.session]);

  const session = data?.session;
  const currentCount = localCount || (session?.count ?? 0);
  const target = session?.target ? Number(session.target) : null;
  const progress = target && target > 0 ? Math.min((currentCount / target) * 100, 100) : 0;

  // Increment counter
  const increment = useMutation({
    mutationFn: async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/tasbih-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ phrase: selectedPhrase }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to increment');
      }
      return res.json();
    },
    onSuccess: (response) => {
      // Update local count immediately
      const newCount = response.session?.count ?? currentCount + 1;
      setLocalCount(newCount);
      
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Animate button press
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.92,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse animation
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Rotation animation
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        rotationAnim.setValue(0);
      });

      // Invalidate and refetch
      void queryClient.invalidateQueries({ queryKey: ['tasbihSession'] });
      
      // Check if target reached
      if (target && newCount >= target) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('🎉 Target Reached!', `You've completed ${target} dhikr! May Allah accept your efforts.`);
      }
    },
    onError: (error) => {
      // Even on error, increment locally for better UX
      setLocalCount(currentCount + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      console.error('Increment error:', error);
    },
  });

  // Reset counter
  const reset = useMutation({
    mutationFn: async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/tasbih-session/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ phrase: selectedPhrase }),
      });
      if (!res.ok) throw new Error('Failed to reset');
      return res.json();
    },
    onSuccess: () => {
      setLocalCount(0);
      void queryClient.invalidateQueries({ queryKey: ['tasbihSession'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Reset', 'Counter has been reset.');
    },
    onError: () => {
      // Reset locally even on error
      setLocalCount(0);
      Alert.alert('Reset', 'Counter has been reset locally.');
    },
  });

  // Set target
  const setTarget = useMutation({
    mutationFn: async (targetValue: number) => {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/tasbih-session`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ phrase: selectedPhrase, target: targetValue }),
      });
      if (!res.ok) throw new Error('Failed to set target');
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasbihSession'] });
      setShowTargetModal(false);
      setTargetInput('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Target has been set.');
    },
  });

  const handleSetTarget = () => {
    const targetValue = parseInt(targetInput, 10);
    if (isNaN(targetValue) || targetValue <= 0) {
      Alert.alert('Invalid Target', 'Please enter a valid number greater than 0.');
      return;
    }
    setTarget.mutate(targetValue);
  };

  const handlePhraseChange = (phrase: string) => {
    setSelectedPhrase(phrase);
    setLocalCount(0);
    void refetch();
  };

  const selectedPhraseData = DEFAULT_PHRASES.find((p) => p.text === selectedPhrase) || DEFAULT_PHRASES[0];
  const spin = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
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
          <Text style={styles.headerTitle}>Digital Tasbih</Text>
          <Pressable
            onPress={() => setShowTargetModal(true)}
            style={styles.targetButton}
          >
            <Ionicons name="flag-outline" size={20} color={colors.evergreen[500]} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(160, insets.bottom + 140) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Counter Card */}
          <GlassCard style={styles.mainCard}>
            {/* Phrase Selector */}
            <View style={styles.phraseSelector}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.phraseScrollContent}
              >
                {DEFAULT_PHRASES.map((phrase) => (
                  <Pressable
                    key={phrase.text}
                    onPress={() => handlePhraseChange(phrase.text)}
                    style={[
                      styles.phraseChip,
                      selectedPhrase === phrase.text && styles.phraseChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.phraseChipText,
                        selectedPhrase === phrase.text && styles.phraseChipTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {phrase.text}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Current Phrase Display */}
            <View style={styles.phraseDisplay}>
              <Text style={styles.arabicText}>{selectedPhraseData.arabic}</Text>
              <Text style={styles.phraseText}>{selectedPhraseData.text}</Text>
              <Text style={styles.meaningText}>{selectedPhraseData.meaning}</Text>
            </View>

            {/* Count Display */}
            <Animated.View
              style={[
                styles.countContainer,
                {
                  transform: [
                    { scale: pulseAnim },
                    { rotate: spin },
                  ],
                },
              ]}
            >
              <Text style={styles.countText}>
                {currentCount || 0}
              </Text>
            </Animated.View>

            {/* Target Progress */}
            {target && target > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        width: `${progress}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {currentCount || 0} / {target}
                </Text>
              </View>
            )}

            {/* Tap Button */}
            <Animated.View
              style={[
                styles.tapButtonContainer,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Pressable
                onPress={() => increment.mutate()}
                disabled={increment.isPending}
                style={styles.tapButton}
              >
                <LinearGradient
                  colors={[colors.evergreen[500], colors.evergreen[400]]}
                  style={styles.tapButtonGradient}
                >
                  <Ionicons name="hand-left" size={40} color={colors.darkTeal[950]} />
                  <Text style={styles.tapButtonText}>Tap to Count</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </GlassCard>

          {/* Stats Card */}
          <GlassCard style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: `${colors.evergreen[500]}20` }]}>
                  <Ionicons name="flame" size={24} color={colors.evergreen[500]} />
                </View>
                <Text style={styles.statLabel}>Today</Text>
                <Text style={styles.statValue}>{currentCount || 0}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: `${colors.pineBlue[300]}20` }]}>
                  <Ionicons name="calendar" size={24} color={colors.pineBlue[300]} />
                </View>
                <Text style={styles.statLabel}>Session</Text>
                <Text style={styles.statValue}>{currentCount || 0}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: `${colors.pineBlue[300]}20` }]}>
                  <Ionicons name="trophy" size={24} color={colors.pineBlue[300]} />
                </View>
                <Text style={styles.statLabel}>Target</Text>
                <Text style={styles.statValue}>{target || '—'}</Text>
              </View>
            </View>
          </GlassCard>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              onPress={() => reset.mutate()}
              disabled={reset.isPending || currentCount === 0}
              style={[
                styles.actionButton,
                (reset.isPending || currentCount === 0) && styles.actionButtonDisabled,
              ]}
            >
              <Ionicons
                name="refresh"
                size={20}
                color={currentCount === 0 ? colors.pineBlue[300] : colors.pineBlue[100]}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  currentCount === 0 && styles.actionButtonTextDisabled,
                ]}
              >
                Reset Counter
              </Text>
            </Pressable>
            
            <Pressable
              onPress={() => setShowTargetModal(true)}
              style={styles.actionButton}
            >
              <Ionicons name="flag" size={20} color={colors.evergreen[500]} />
              <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>
                {target ? 'Change Target' : 'Set Target'}
              </Text>
            </Pressable>
          </View>

          {/* Info Card */}
          <GlassCard style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="information-circle" size={24} color={colors.evergreen[500]} />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>How to Use</Text>
                <Text style={styles.infoDescription}>
                  Select a dhikr phrase, then tap the button to count. Your progress is automatically saved. Set a target to track your daily goals and stay motivated.
                </Text>
              </View>
            </View>
          </GlassCard>
        </ScrollView>

        {/* Target Modal */}
        <Modal
          visible={showTargetModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTargetModal(false)}
        >
          <View style={styles.modalOverlay}>
            <GlassCard style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Set Target</Text>
                <Pressable
                  onPress={() => setShowTargetModal(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color={colors.pineBlue[100]} />
                </Pressable>
              </View>
              
              <Text style={styles.modalDescription}>
                Set a daily target for your dhikr to stay motivated and track your progress.
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Enter target number"
                placeholderTextColor={colors.pineBlue[300]}
                value={targetInput}
                onChangeText={setTargetInput}
                keyboardType="number-pad"
                autoFocus
              />

              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setShowTargetModal(false)}
                  style={[styles.modalButton, styles.modalButtonCancel]}
                >
                  <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSetTarget}
                  disabled={setTarget.isPending}
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                >
                  {setTarget.isPending ? (
                    <ActivityIndicator color={colors.darkTeal[950]} />
                  ) : (
                    <Text style={styles.modalButtonTextPrimary}>Set Target</Text>
                  )}
                </Pressable>
              </View>
            </GlassCard>
          </View>
        </Modal>
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
  headerTitle: {
    ...typography.headingLg,
    fontSize: 22,
    color: colors.white,
    fontWeight: '700',
  },
  targetButton: {
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
    padding: spacing.lg,
  },
  mainCard: {
    marginBottom: spacing.xl,
    padding: spacing.xl,
    borderRadius: 24,
  },
  phraseSelector: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  phraseScrollContent: {
    gap: spacing.sm,
  },
  phraseChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.darkTeal[700],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginRight: spacing.sm,
  },
  phraseChipActive: {
    backgroundColor: colors.evergreen[500],
    borderColor: colors.evergreen[500],
  },
  phraseChipText: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
  },
  phraseChipTextActive: {
    color: colors.darkTeal[950],
    fontWeight: '700',
  },
  phraseDisplay: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  arabicText: {
    fontSize: 32,
    color: colors.evergreen[500],
    fontWeight: '700',
    marginBottom: spacing.sm,
    fontFamily: 'System',
  },
  phraseText: {
    ...typography.headingMd,
    fontSize: 20,
    color: colors.white,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  meaningText: {
    ...typography.bodySm,
    fontSize: 13,
    color: colors.pineBlue[300],
    fontStyle: 'italic',
  },
  countContainer: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  countText: {
    fontSize: 96,
    fontWeight: '800',
    color: colors.evergreen[500],
    textAlign: 'center',
    letterSpacing: -2,
  },
  progressContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
  },
  progressPercentage: {
    ...typography.headingMd,
    fontSize: 14,
    color: colors.evergreen[500],
    fontWeight: '700',
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: colors.darkTeal[700],
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.evergreen[500],
    borderRadius: 5,
  },
  progressText: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
    textAlign: 'center',
  },
  tapButtonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  tapButton: {
    width: 220,
    height: 220,
    borderRadius: 110,
    overflow: 'hidden',
    shadowColor: colors.evergreen[500],
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  tapButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tapButtonText: {
    ...typography.buttonLg,
    fontSize: 18,
    color: colors.darkTeal[950],
    fontWeight: '700',
  },
  statsCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statLabel: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.headingLg,
    fontSize: 24,
    color: colors.white,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 18,
    backgroundColor: colors.darkTeal[800],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    ...typography.buttonMd,
    color: colors.pineBlue[100],
    fontWeight: '600',
  },
  actionButtonTextPrimary: {
    color: colors.evergreen[500],
  },
  actionButtonTextDisabled: {
    color: colors.pineBlue[300],
  },
  infoCard: {
    padding: spacing.lg,
    borderRadius: 20,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    ...typography.bodyMd,
    fontSize: 15,
    color: colors.white,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  infoDescription: {
    ...typography.bodySm,
    color: colors.pineBlue[100],
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    padding: spacing.xl,
    borderRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.headingLg,
    fontSize: 22,
    color: colors.white,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  modalDescription: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  modalInput: {
    ...typography.bodyMd,
    fontSize: 18,
    color: colors.white,
    padding: spacing.md,
    backgroundColor: colors.darkTeal[800],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.darkTeal[800],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  modalButtonPrimary: {
    backgroundColor: colors.evergreen[500],
  },
  modalButtonTextCancel: {
    ...typography.buttonMd,
    color: colors.pineBlue[100],
    fontWeight: '600',
  },
  modalButtonTextPrimary: {
    ...typography.buttonMd,
    color: colors.darkTeal[950],
    fontWeight: '700',
  },
});

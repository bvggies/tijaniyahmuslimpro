import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
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

export function AiNoorScreen() {
  const navigation = useNavigation();
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setAnswer(null);
    setDisclaimer(null);
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/ai-noor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAnswer(json.error ?? 'AI Noor is currently unavailable.');
        return;
      }
      setAnswer(json.answer);
      setDisclaimer(json.disclaimer);
    } catch {
      setAnswer('AI Noor is currently unavailable. Please try again later.');
    } finally {
      setLoading(false);
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
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.pineBlue[100]} />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>AI Noor</Text>
            <Text style={styles.headerSubtitle}>Islamic Assistant</Text>
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
              <Ionicons name="sparkles" size={24} color={colors.evergreen[500]} />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>AI Noor</Text>
                <Text style={styles.infoDescription}>
                  An assistive tool for general Islamic questions. It does not replace qualified scholarship.
                  Always verify important matters with knowledgeable scholars.
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Input Card */}
          <GlassCard style={styles.inputCard}>
            <Text style={styles.inputLabel}>Ask Your Question</Text>
            <TextInput
              value={prompt}
              onChangeText={setPrompt}
              placeholder="Ask with adab, and verify with scholars…"
              placeholderTextColor={colors.pineBlue[300]}
              multiline
              style={styles.input}
              textAlignVertical="top"
            />
            <Button
              label={loading ? 'Asking...' : 'Ask AI Noor'}
              onPress={ask}
              variant="primary"
              disabled={loading || !prompt.trim()}
              icon={
                loading ? (
                  <ActivityIndicator size="small" color={colors.darkTeal[950]} />
                ) : (
                  <Ionicons name="send" size={18} color={colors.darkTeal[950]} />
                )
              }
              style={styles.askButton}
            />
          </GlassCard>

          {/* Answer Card */}
          {answer && (
            <GlassCard style={styles.answerCard}>
              <View style={styles.answerHeader}>
                <Ionicons name="bulb" size={20} color={colors.evergreen[500]} />
                <Text style={styles.answerTitle}>Response</Text>
              </View>
              <Text style={styles.answerText}>{answer}</Text>
              {disclaimer && (
                <View style={styles.disclaimerContainer}>
                  <Ionicons name="information-circle" size={16} color={colors.pineBlue[300]} />
                  <Text style={styles.disclaimerText}>{disclaimer}</Text>
                </View>
              )}
            </GlassCard>
          )}

          {/* Guidance Card */}
          <GlassCard style={styles.guidanceCard}>
            <View style={styles.guidanceRow}>
              <Ionicons name="information-circle" size={20} color={colors.pineBlue[300]} />
              <View style={styles.guidanceText}>
                <Text style={styles.guidanceTitle}>Important Reminder</Text>
                <Text style={styles.guidanceDescription}>
                  AI Noor is a helpful tool but should not replace consultation with qualified scholars
                  for matters of fiqh, aqidah, or personal guidance. Always verify important information.
                </Text>
              </View>
            </View>
          </GlassCard>

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
  inputCard: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  inputLabel: {
    ...typography.bodyMd,
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  input: {
    ...typography.bodyMd,
    color: colors.white,
    padding: spacing.md,
    backgroundColor: colors.darkTeal[800],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    minHeight: 100,
    marginBottom: spacing.md,
  },
  askButton: {
    width: '100%',
  },
  answerCard: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  answerTitle: {
    ...typography.headingLg,
    fontSize: 16,
    color: colors.white,
    fontWeight: '700',
  },
  answerText: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.darkTeal[800],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  disclaimerText: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
    flex: 1,
    lineHeight: 18,
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

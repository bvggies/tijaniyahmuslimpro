import React, { useState } from 'react';
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
import * as Clipboard from 'expo-clipboard';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../components/ui/GlassCard';
import { IslamicPattern } from '../../components/ui/IslamicPattern';
import { Toast } from '../../components/ui/Toast';

const DUA_DATA = {
  id: 'rabil-ibadi',
  title: 'Duʿā Rābil ʿIbādi',
  arabic: 'رَبِّ الْعِبَادِ، يَا مَنْ بِيَدِهِ مَقَادِيرُ الْخَلَائِقِ، يَا مَنْ لَا يَعْجِزُهُ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، اقْضِ حَوَائِجَنَا، وَيَسِّرْ أُمُورَنَا، وَفَرِّجْ هُمُومَنَا، وَاغْفِرْ لَنَا وَلِوَالِدِينَا وَلِإِخْوَانِنَا فِي الطَّرِيقَةِ التِّجَانِيَّةِ، آمِينَ.',
  translation: 'Lord of the servants, O He in Whose hand are the destinies of all creation, O He Whom nothing in the earth or the heavens can incapacitate, fulfill our needs, ease our affairs, relieve our worries, and forgive us, our parents, and our brothers in the Tijani path. Amīn.',
  transliteration: 'Rabbi al-\'ibādi, yā man bi-yadihi maqādīru al-khalā\'iq, yā man lā ya\'jizuhu shay\'un fī al-arḍi wa lā fī as-samā\', iqḍi ḥawā\'ijanā, wa yassir umūranā, wa farrij humūmanā, wa aghfir lanā wa li-wālidaynā wa li-ikhwāninā fī aṭ-ṭarīqati at-Tijāniyyah, āmīn.',
  context: 'This supplication is a comprehensive prayer seeking Allah\'s help in all matters of life. It asks for the fulfillment of needs, ease in affairs, relief from worries, and forgiveness for oneself, parents, and fellow Tijaniyah brothers and sisters. It can be recited at any time, especially after prayers or during times of difficulty.',
  benefits: [
    'Seeks fulfillment of all needs and desires',
    'Asks for ease in all affairs',
    'Requests relief from worries and difficulties',
    'Seeks forgiveness for oneself, parents, and Tijaniyah community',
    'Acknowledges Allah\'s absolute power over all creation',
  ],
  reference: 'Tijaniyah Path',
};

export const DuaRabilIbadiScreen: React.FC = () => {
  const navigation = useNavigation();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleCopy = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    setToastMessage(`${label} copied to clipboard`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleShare = async () => {
    const shareText = `${DUA_DATA.title}\n\n${DUA_DATA.arabic}\n\n${DUA_DATA.translation}`;
    await Clipboard.setStringAsync(shareText);
    setToastMessage('Dua copied to clipboard');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
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
            <Text style={styles.headerTitle}>{DUA_DATA.title}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={handleShare} style={styles.headerIcon}>
              <Ionicons name="share-outline" size={20} color={colors.pineBlue[100]} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Arabic Text */}
          <GlassCard style={styles.duaCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Arabic Text</Text>
              <Pressable
                onPress={() => handleCopy(DUA_DATA.arabic, 'Arabic text')}
                style={styles.copyButton}
              >
                <Ionicons name="copy-outline" size={18} color={colors.evergreen[500]} />
              </Pressable>
            </View>
            <View style={styles.arabicContainer}>
              <Text style={styles.arabicText}>{DUA_DATA.arabic}</Text>
            </View>
          </GlassCard>

          {/* Translation */}
          <GlassCard style={styles.duaCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Translation</Text>
              <Pressable
                onPress={() => handleCopy(DUA_DATA.translation, 'Translation')}
                style={styles.copyButton}
              >
                <Ionicons name="copy-outline" size={18} color={colors.evergreen[500]} />
              </Pressable>
            </View>
            <Text style={styles.translationText}>{DUA_DATA.translation}</Text>
          </GlassCard>

          {/* Transliteration */}
          {DUA_DATA.transliteration && (
            <GlassCard style={styles.duaCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Transliteration</Text>
                <Pressable
                  onPress={() => handleCopy(DUA_DATA.transliteration!, 'Transliteration')}
                  style={styles.copyButton}
                >
                  <Ionicons name="copy-outline" size={18} color={colors.evergreen[500]} />
                </Pressable>
              </View>
              <Text style={styles.transliterationText}>{DUA_DATA.transliteration}</Text>
            </GlassCard>
          )}

          {/* Context */}
          {DUA_DATA.context && (
            <GlassCard style={styles.duaCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="information-circle" size={20} color={colors.evergreen[500]} />
                <Text style={styles.cardTitle}>Context</Text>
              </View>
              <Text style={styles.contextText}>{DUA_DATA.context}</Text>
            </GlassCard>
          )}

          {/* Benefits */}
          {DUA_DATA.benefits && DUA_DATA.benefits.length > 0 && (
            <GlassCard style={styles.duaCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="star" size={20} color={colors.evergreen[500]} />
                <Text style={styles.cardTitle}>Benefits</Text>
              </View>
              {DUA_DATA.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <View style={styles.benefitBullet} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </GlassCard>
          )}

          {/* Reference */}
          {DUA_DATA.reference && (
            <View style={styles.referenceContainer}>
              <Text style={styles.referenceText}>Reference: {DUA_DATA.reference}</Text>
            </View>
          )}

          {/* Footer Spacing */}
          <View style={styles.footer} />
        </ScrollView>

        {showToast && <Toast message={toastMessage} icon="checkmark-circle" />}
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
    fontSize: 20,
    color: colors.white,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerIcon: {
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
    paddingBottom: spacing['2xl'],
  },
  duaCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: {
    ...typography.headingMd,
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
  copyButton: {
    padding: spacing.xs,
  },
  arabicContainer: {
    padding: spacing.md,
    backgroundColor: colors.darkTeal[800],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  arabicText: {
    fontSize: 22,
    color: colors.pineBlue[100],
    textAlign: 'right',
    lineHeight: 36,
    fontWeight: '500',
  },
  translationText: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    lineHeight: 24,
  },
  transliterationText: {
    ...typography.bodyMd,
    color: colors.pineBlue[200],
    lineHeight: 24,
    fontStyle: 'italic',
  },
  contextText: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    lineHeight: 22,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  benefitBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.evergreen[500],
    marginTop: 8,
  },
  benefitText: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    lineHeight: 22,
    flex: 1,
  },
  referenceContainer: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.darkTeal[800],
    borderRadius: 8,
  },
  referenceText: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  footer: {
    height: spacing['2xl'],
  },
});


import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TILE_WIDTH = (SCREEN_WIDTH - spacing.xl * 3) / 2;

type TijaniyahSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const TIJANIYAH_FEATURES = [
  {
    key: 'tariqaTijaniyyah',
    label: 'Tariqa Tijaniyyah',
    hint: 'Learn about the Tijani path',
    icon: 'book-outline',
    route: 'TariqaTijaniyyah',
  },
  {
    key: 'tijaniyaFiqh',
    label: 'Tijaniya Fiqh',
    hint: 'Conditions of Tijaniya Fiqh',
    icon: 'document-text-outline',
    route: 'TijaniyaFiqh',
  },
  {
    key: 'beginnersResources',
    label: 'Resources for Beginners',
    hint: 'Islamic terms & phrases',
    icon: 'library-outline',
    route: 'BeginnersResources',
  },
  {
    key: 'proofOfTasawwuf',
    label: 'Proof of Tasawwuf Part 1',
    hint: 'Dhikr is the greatest obligation',
    icon: 'star-outline',
    route: 'ProofOfTasawwufPart1',
  },
  {
    key: 'duasOfTijaniyah',
    label: "Duas of Tijaniyah",
    hint: 'Core supplications',
    icon: 'leaf-outline',
    route: 'DuasOfTijaniyah',
  },
  {
    key: 'duaKhatmulWazifa',
    label: 'Dua Khatmul Wazifa',
    hint: 'After Wazifa completion',
    icon: 'sparkles-outline',
    route: 'DuaKhatmulWazifa',
  },
  {
    key: 'duaRabilIbadi',
    label: 'Dua Rabil Ibadi',
    hint: 'Comprehensive prayer',
    icon: 'heart-outline',
    route: 'DuaRabilIbadi',
  },
  {
    key: 'duaHasbilMuhaiminu',
    label: 'Dua Hasbil Muhaiminu',
    hint: 'Trust and protection',
    icon: 'shield-outline',
    route: 'DuaHasbilMuhaiminu',
  },
  {
    key: 'scholars',
    label: 'Scholars',
    hint: 'Tijaniyah scholars',
    icon: 'school-outline',
    route: 'Scholars',
  },
];

export const TijaniyahSheet: React.FC<TijaniyahSheetProps> = ({ visible, onClose }) => {
  const navigation = useNavigation();

  const handleFeaturePress = (route: string) => {
    onClose();
    navigation.navigate(route as never);
  };

  const handleViewAll = () => {
    onClose();
    navigation.navigate('AllFeatures' as never);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()} style={styles.sheetContainer}>
          <BlurView intensity={40} tint="dark" style={styles.sheet}>
            {/* Handle bar */}
            <View style={styles.handle} />

            {/* Title */}
            <Text style={styles.title}>Tijaniyah Features</Text>

            {/* Features Grid */}
            <ScrollView
              contentContainerStyle={styles.grid}
              showsVerticalScrollIndicator={false}
            >
              {TIJANIYAH_FEATURES.map((feature) => (
                <Pressable
                  key={feature.key}
                  onPress={() => handleFeaturePress(feature.route)}
                  style={({ pressed }) => [
                    styles.tile,
                    pressed && styles.tilePressed,
                  ]}
                >
                  <View style={styles.tileContent}>
                    <View style={styles.tileIconWrapper}>
                      <Ionicons
                        name={feature.icon as any}
                        size={24}
                        color={colors.evergreen[500]}
                      />
                    </View>
                    <Text style={styles.tileLabel} numberOfLines={1}>
                      {feature.label}
                    </Text>
                    <Text style={styles.tileHint} numberOfLines={1}>
                      {feature.hint}
                    </Text>
                  </View>
                </Pressable>
              ))}

              {/* View All Features Button */}
              <Pressable
                onPress={handleViewAll}
                style={({ pressed }) => [
                  styles.viewAllButton,
                  pressed && styles.tilePressed,
                ]}
              >
                <Ionicons name="grid-outline" size={20} color={colors.evergreen[500]} />
                <Text style={styles.viewAllText}>View all features</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.pineBlue[300]} />
              </Pressable>
            </ScrollView>
          </BlurView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    maxHeight: '70%',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: 'rgba(6, 28, 30, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.white,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
  tile: {
    width: TILE_WIDTH,
    marginBottom: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.darkTeal[800],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  tilePressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  tileContent: {
    padding: spacing.md,
    alignItems: 'center',
  },
  tileIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(8, 247, 116, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tileLabel: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textAlign: 'center',
    fontSize: 13,
  },
  tileHint: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    textAlign: 'center',
    fontSize: 10,
  },
  viewAllButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.darkTeal[700],
    borderWidth: 1,
    borderColor: 'rgba(8, 247, 116, 0.3)',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  viewAllText: {
    ...typography.body,
    color: colors.evergreen[500],
    fontWeight: '600',
  },
});


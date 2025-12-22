import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export type QiblaTab = 'compass' | 'map' | 'info';

interface QiblaTabsProps {
  activeTab: QiblaTab;
  onTabChange: (tab: QiblaTab) => void;
}

export const QiblaTabs: React.FC<QiblaTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: QiblaTab; label: string }[] = [
    { id: 'compass', label: 'Compass' },
    { id: 'map', label: 'Map' },
    { id: 'info', label: 'Info' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            style={({ pressed }) => [
              styles.tab,
              isActive && styles.tabActive,
              pressed && styles.tabPressed,
            ]}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 80, 86, 0.4)',
    borderRadius: 18,
    padding: 4,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#12d6b0',
  },
  tabPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  tabText: {
    ...typography.bodyMd,
    fontSize: 14,
    color: colors.pineBlue[300],
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.darkTeal[950],
    fontWeight: '700',
  },
});

export default QiblaTabs;


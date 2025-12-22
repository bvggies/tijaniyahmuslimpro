import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface SegmentedTabsProps {
  tabs: string[];
  selectedTab: string;
  onTabChange: (tab: string) => void;
}

export const SegmentedTabs: React.FC<SegmentedTabsProps> = ({
  tabs,
  selectedTab,
  onTabChange,
}) => {
  return (
    <View style={styles.container}>
      <BlurView intensity={20} style={styles.blur}>
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => onTabChange(tab)}
              style={[
                styles.tab,
                selectedTab === tab && styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  blur: {
    backgroundColor: 'rgba(16, 80, 86, 0.6)',
  },
  tabsContainer: {
    flexDirection: 'row',
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: colors.evergreen[500],
  },
  tabText: {
    ...typography.bodyMd,
    fontSize: 14,
    color: colors.pineBlue[300],
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.darkTeal[950],
    fontWeight: '600',
  },
});

export default SegmentedTabs;


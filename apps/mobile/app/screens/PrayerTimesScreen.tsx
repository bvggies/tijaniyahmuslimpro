import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

export const PrayerTimesScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Prayer Times</Text>
        <Text style={styles.subtitle}>Placeholder screen for today’s prayer schedule.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.darkTeal[950],
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    ...typography.headingLg,
    color: colors.white, // Headings
    marginBottom: 8,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.pineBlue[100], // Body text
    textAlign: 'center',
  },
});

export default PrayerTimesScreen;



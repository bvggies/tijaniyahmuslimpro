import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type AuthStackParamList = {
  Privacy: undefined;
};

type Props = NativeStackScreenProps<AuthStackParamList, 'Privacy'>;

export const PrivacyScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inner}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.body}>
            Privacy policy content will be displayed here.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pineBlue[50],
  },
  content: {
    flexGrow: 1,
  },
  inner: {
    padding: spacing.xl,
  },
  title: {
    ...typography.headingLg,
    color: colors.darkTeal[900],
    marginBottom: spacing.lg,
  },
  body: {
    ...typography.bodyMd,
    color: colors.darkTeal[800],
    lineHeight: 24,
  },
});

export default PrivacyScreen;


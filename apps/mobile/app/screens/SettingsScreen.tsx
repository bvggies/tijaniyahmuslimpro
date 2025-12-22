import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Switch } from 'react-native';
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

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [locationEnabled, setLocationEnabled] = React.useState(true);

  const handleSignOut = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('guestMode');
    // Navigation will be handled by RootNavigator
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person-outline',
          label: 'Edit Profile',
          onPress: () => {
            // TODO: Navigate to edit profile
          },
          showArrow: true,
        },
        {
          icon: 'lock-closed-outline',
          label: 'Change Password',
          onPress: () => {
            // TODO: Navigate to change password
          },
          showArrow: true,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: 'notifications-outline',
          label: 'Notifications',
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
          type: 'switch',
        },
        {
          icon: 'location-outline',
          label: 'Location Services',
          value: locationEnabled,
          onToggle: setLocationEnabled,
          type: 'switch',
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'information-circle-outline',
          label: 'App Version',
          value: '1.0.0',
          showArrow: false,
        },
        {
          icon: 'document-text-outline',
          label: 'Terms of Service',
          onPress: () => {
            // TODO: Navigate to terms
          },
          showArrow: true,
        },
        {
          icon: 'shield-checkmark-outline',
          label: 'Privacy Policy',
          onPress: () => {
            // TODO: Navigate to privacy
          },
          showArrow: true,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle-outline',
          label: 'Help & Support',
          onPress: () => {
            // TODO: Navigate to support
          },
          showArrow: true,
        },
        {
          icon: 'mail-outline',
          label: 'Contact Us',
          onPress: () => {
            // TODO: Open contact form
          },
          showArrow: true,
        },
      ],
    },
  ];

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
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>Preferences & Account</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {settingsSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <GlassCard style={styles.sectionCard}>
                {section.items.map((item, itemIndex) => (
                  <Pressable
                    key={itemIndex}
                    onPress={item.onPress}
                    disabled={!item.onPress && item.type !== 'switch'}
                    style={[
                      styles.settingItem,
                      itemIndex < section.items.length - 1 && styles.settingItemBorder,
                    ]}
                  >
                    <View style={styles.settingItemLeft}>
                      <Ionicons
                        name={item.icon as any}
                        size={22}
                        color={colors.pineBlue[100]}
                      />
                      <Text style={styles.settingItemLabel}>{item.label}</Text>
                    </View>
                    <View style={styles.settingItemRight}>
                      {item.type === 'switch' ? (
                        <Switch
                          value={item.value as boolean}
                          onValueChange={item.onToggle}
                          trackColor={{
                            false: colors.darkTeal[700],
                            true: colors.evergreen[500],
                          }}
                          thumbColor={colors.white}
                        />
                      ) : item.value ? (
                        <Text style={styles.settingItemValue}>{item.value}</Text>
                      ) : item.showArrow ? (
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color={colors.pineBlue[300]}
                        />
                      ) : null}
                    </View>
                  </Pressable>
                ))}
              </GlassCard>
            </View>
          ))}

          {/* Sign Out Button */}
          <Pressable onPress={handleSignOut} style={styles.signOutButton}>
            <LinearGradient
              colors={[colors.darkTeal[800], colors.darkTeal[700]]}
              style={styles.signOutGradient}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.pineBlue[100]} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </LinearGradient>
          </Pressable>

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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.headingLg,
    fontSize: 16,
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  settingItemLabel: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
  },
  settingItemRight: {
    alignItems: 'center',
  },
  settingItemValue: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
  },
  signOutButton: {
    marginTop: spacing.xl,
    borderRadius: 18,
    overflow: 'hidden',
  },
  signOutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  signOutText: {
    ...typography.buttonMd,
    color: colors.pineBlue[100],
    fontWeight: '600',
  },
  footer: {
    height: spacing['2xl'],
  },
});

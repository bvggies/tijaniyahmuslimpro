import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  Image,
  RefreshControl,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCurrentUser } from '../../hooks/useAuth';
import { useIsGuest } from '../../hooks/useGuest';
import { useWazifas, useLazims } from '../../hooks/useTrackers';
import { useJournalEntries } from '../../hooks/useJournal';
import { useBookmarks } from '../../hooks/useQuran';
import { authService } from '../../services/authService';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { navigateToAuth } from '../../utils/navigation';
import { useQueryClient } from '@tanstack/react-query';

// Animated counter component for stats
const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 800 }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Reset to 0 when value changes
    animatedValue.setValue(0);
    setDisplayValue(0);

    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();

    const listener = animatedValue.addListener(({ value: v }) => {
      setDisplayValue(Math.round(v));
    });

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [value, animatedValue, duration]);

  return <Text style={styles.statValue}>{displayValue}</Text>;
};

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { data: currentUser, isLoading: userLoading, refetch: refetchUser } = useCurrentUser();
  const { data: isGuest = false } = useIsGuest();
  const { data: wazifas = [] } = useWazifas();
  const { data: lazims = [] } = useLazims();
  const { data: journalEntries = [] } = useJournalEntries();
  const { data: bookmarks = [] } = useBookmarks();
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Calculate stats
  const wazifaCompleted = wazifas.filter((w) => w.completed).length;
  const wazifaTotal = wazifas.length;
  const wazifaProgress = wazifaTotal > 0 ? (wazifaCompleted / wazifaTotal) * 100 : 0;
  const lazimStreak = lazims.filter((l) => l.completed).length;
  const journalCount = journalEntries.length;
  const bookmarkCount = bookmarks.length;

  // Get display name - prefer name, fallback to email username, then "User"
  const displayName = currentUser?.name || 
    (currentUser?.email ? currentUser.email.split('@')[0] : null) || 
    'User';

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh user data and other queries
    await refetchUser();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      setShowLogoutModal(false);
      // Clear all queries and cache
      queryClient.clear();
      // Logout and clear tokens
      await authService.logout();
      // Navigate to auth screen
      navigateToAuth(navigation);
    } catch (error) {
      console.error('Logout error:', error);
      // Still try to navigate even if there's an error
      navigateToAuth(navigation);
    }
  };

  const handleSignIn = () => {
    navigateToAuth(navigation);
  };

  const profileSections = [
    {
      title: 'Quick Actions',
      items: [
        {
          icon: 'sparkles-outline',
          label: 'Wazifa & Lazim',
          description: 'Daily focus • Track your Tijaniyah practices',
          route: 'WazifaLazim',
          color: colors.evergreen[500],
        },
        {
          icon: 'journal-outline',
          label: 'Islamic Journal',
          description: 'Reflect on your spiritual journey',
          route: 'Journal',
          color: colors.evergreen[500],
        },
        {
          icon: 'bookmark-outline',
          label: 'Quran Bookmarks',
          description: `${bookmarkCount} bookmarked ayahs`,
          route: 'Bookmarks',
          color: colors.evergreen[500],
        },
        {
          icon: 'settings-outline',
          label: 'Settings',
          description: 'App preferences & privacy',
          route: 'Settings',
          color: colors.pineBlue[300],
        },
      ],
    },
    {
      title: 'Support & Community',
      items: [
        {
          icon: 'heart-outline',
          label: 'Donate',
          description: 'Support Islamic causes',
          route: 'Donate',
          color: colors.evergreen[500],
        },
        {
          icon: 'help-circle-outline',
          label: 'Get Help',
          description: 'Support & report issues',
          route: 'SupportTickets',
          color: colors.pineBlue[300],
        },
        {
          icon: 'people-outline',
          label: 'Ummah Community',
          description: 'Connect with believers',
          route: null,
          color: colors.evergreen[500],
          onPress: () => {
            navigation.getParent()?.getParent()?.dispatch(
              CommonActions.navigate('CommunityTab')
            );
          },
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'document-text-outline',
          label: 'Terms of Service',
          description: 'Read our terms',
          route: 'Terms',
          color: colors.pineBlue[300],
        },
        {
          icon: 'shield-checkmark-outline',
          label: 'Privacy Policy',
          description: 'How we protect your data',
          route: 'Privacy',
          color: colors.pineBlue[300],
        },
        {
          icon: 'information-circle-outline',
          label: 'About Tijaniyah Muslim Pro',
          description: '',
          route: null,
          color: colors.pineBlue[300],
          version: '1.0.0',
          onPress: () => {
            Alert.alert(
              'Tijaniyah Muslim Pro',
              'Version 1.0.0\n\nYour companion for Salah, Quran, Zikr, and the Tijaniyah path.',
              [{ text: 'OK' }],
            );
          },
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.evergreen[500]}
            />
          }
        >
          {/* Profile Header */}
          <View style={styles.header}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                {userLoading ? (
                  <Skeleton width={80} height={80} borderRadius={40} />
                ) : (
                  <>
                    {/* Subtle evergreen halo glow behind avatar */}
                    <View style={styles.avatarHalo} />
                    <View style={styles.avatar}>
                      <Ionicons name="person" size={40} color={colors.evergreen[500]} />
                    </View>
                  </>
                )}
                {!isGuest && (
                  <Pressable
                    style={styles.editAvatarButton}
                    onPress={() => {
                      navigation.navigate('EditProfile' as never);
                    }}
                  >
                    <Ionicons name="camera" size={16} color={colors.white} />
                  </Pressable>
                )}
              </View>
              {userLoading ? (
                <View style={styles.userInfoSkeleton}>
                  <Skeleton width={150} height={20} borderRadius={4} style={{ marginBottom: 8 }} />
                  <Skeleton width={200} height={16} borderRadius={4} />
                </View>
              ) : isGuest ? (
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>Guest User</Text>
                  <Text style={styles.userEmail}>Limited access mode</Text>
                  <Button
                    label="Sign In"
                    onPress={handleSignIn}
                    variant="primary"
                    style={styles.signInButton}
                  />
                </View>
              ) : (
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{displayName}</Text>
                  <Text style={styles.userGreeting}>May Allah accept your efforts</Text>
                  {currentUser?.email && (
                    <Text style={styles.userEmail}>{currentUser.email}</Text>
                  )}
                  <Pressable
                    style={styles.editProfileButton}
                    onPress={() => {
                      navigation.navigate('EditProfile' as never);
                    }}
                  >
                    <Text style={styles.editProfileText}>Edit Profile</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.evergreen[500]} />
                  </Pressable>
                </View>
              )}
            </View>
          </View>

          {/* Stats Cards */}
          {!isGuest && (
            <View style={styles.statsSection}>
              <View style={styles.statsGrid}>
                <GlassCard style={styles.statCard}>
                  <View style={styles.statIconWrapper}>
                    <Ionicons name="sparkles" size={24} color={colors.evergreen[500]} />
                  </View>
                  <Text style={styles.statValue}>{wazifaCompleted}/{wazifaTotal}</Text>
                  <Text style={styles.statLabel}>Wazifa</Text>
                  <Text style={styles.statMicroSubtitle}>Begin today</Text>
                  <View style={styles.statProgressBar}>
                    <View
                      style={[
                        styles.statProgressFill,
                        { width: `${Math.min(wazifaProgress, 100)}%` },
                      ]}
                    />
                  </View>
                </GlassCard>

                <GlassCard style={styles.statCard}>
                  <View style={styles.statIconWrapper}>
                    <Ionicons name="star" size={24} color={colors.evergreen[500]} />
                  </View>
                  <AnimatedCounter value={lazimStreak} />
                  <Text style={styles.statLabel}>Lazim Streak</Text>
                  <Text style={styles.statMicroSubtitle}>Consistency matters</Text>
                </GlassCard>

                <GlassCard style={styles.statCard}>
                  <View style={styles.statIconWrapper}>
                    <Ionicons name="journal" size={24} color={colors.evergreen[500]} />
                  </View>
                  <AnimatedCounter value={journalCount} />
                  <Text style={styles.statLabel}>Journal Entries</Text>
                  <Text style={styles.statMicroSubtitle}>Reflect & grow</Text>
                </GlassCard>

                <GlassCard style={styles.statCard}>
                  <View style={styles.statIconWrapper}>
                    <Ionicons name="bookmark" size={24} color={colors.evergreen[500]} />
                  </View>
                  <AnimatedCounter value={bookmarkCount} />
                  <Text style={styles.statLabel}>Bookmarks</Text>
                  <Text style={styles.statMicroSubtitle}>Your saved verses</Text>
                </GlassCard>
              </View>
            </View>
          )}

          {/* Profile Sections */}
          {profileSections.map((section, sectionIndex) => (
            <View key={sectionIndex}>
              {sectionIndex > 0 && <View style={styles.sectionDivider} />}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.items.map((item, itemIndex) => (
                <Pressable
                  key={itemIndex}
                  onPress={() => {
                    if (item.onPress) {
                      item.onPress();
                    } else if (item.route) {
                      // Handle tab navigation - CommunityTab needs parent navigation
                      if (item.route === 'CommunityTab') {
                        navigation.getParent()?.getParent()?.dispatch(
                          CommonActions.navigate('CommunityTab')
                        );
                      } else {
                        navigation.navigate(item.route as never);
                      }
                    }
                  }}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && styles.menuItemPressed,
                  ]}
                >
                  <GlassCard style={styles.menuCard}>
                    <View style={styles.menuItemContent}>
                      <View style={[styles.menuIconWrapper, { backgroundColor: `${item.color}15` }]}>
                        <Ionicons name={item.icon as any} size={22} color={item.color} />
                      </View>
                      <View style={styles.menuItemText}>
                        <View style={styles.menuItemLabelRow}>
                          <Text style={[
                            styles.menuItemLabel,
                            section.title === 'About' && styles.menuItemLabelLight,
                          ]}>
                            {item.label}
                          </Text>
                          {item.version && (
                            <Text style={styles.menuItemVersion}>{item.version}</Text>
                          )}
                        </View>
                        {item.description && (
                          <Text style={[
                            styles.menuItemDescription,
                            section.title === 'About' && styles.menuItemDescriptionLight,
                          ]}>
                            {item.description}
                          </Text>
                        )}
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={section.title === 'About' ? colors.pineBlue[300] : colors.pineBlue[300]}
                        style={{ opacity: section.title === 'About' ? 0.5 : 1 }}
                      />
                    </View>
                  </GlassCard>
                </Pressable>
              ))}
              </View>
            </View>
          ))}

          {/* Logout Button */}
          {!isGuest && (
            <View style={styles.logoutSection}>
              <Button
                label="Sign Out"
                onPress={handleLogout}
                variant="outline"
                style={styles.logoutButton}
                icon={<Ionicons name="log-out-outline" size={20} color={colors.pineBlue[100]} />}
              />
            </View>
          )}

          {/* Logout Confirmation Modal */}
          <Modal visible={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
            <View style={styles.logoutModalContent}>
              <Ionicons name="log-out-outline" size={48} color={colors.evergreen[500]} />
              <Text style={styles.logoutModalTitle}>Sign Out</Text>
              <Text style={styles.logoutModalText}>
                Are you sure you want to sign out? You'll need to sign in again to access your data.
              </Text>
              <View style={styles.logoutModalActions}>
                <Button
                  label="Cancel"
                  onPress={() => setShowLogoutModal(false)}
                  variant="outline"
                  style={styles.logoutModalCancelButton}
                />
                <Button
                  label="Sign Out"
                  onPress={confirmLogout}
                  variant="primary"
                  style={styles.logoutModalConfirmButton}
                />
              </View>
            </View>
          </Modal>

          {/* Guest Mode Info */}
          {isGuest && (
            <View style={styles.guestInfoSection}>
              <GlassCard style={styles.guestInfoCard}>
                <Ionicons name="information-circle" size={24} color={colors.evergreen[500]} />
                <Text style={styles.guestInfoTitle}>Guest Mode</Text>
                <Text style={styles.guestInfoText}>
                  Sign in to access all features including trackers, journal, bookmarks, and
                  community features.
                </Text>
                <Button
                  label="Sign In to Continue"
                  onPress={handleSignIn}
                  variant="primary"
                  style={styles.guestSignInButton}
                />
              </GlassCard>
            </View>
          )}

          <View style={styles.bottomSpacer} />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 200 : 190, // Space for tab bar (74) + bottom spacing (20/14) + FAB (60) + extra padding
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatarHalo: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.evergreen[500],
    opacity: 0.09,
    top: -8,
    left: -8,
    zIndex: -1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.darkTeal[800],
    borderWidth: 3,
    borderColor: colors.evergreen[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.evergreen[500],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.darkTeal[950],
  },
  userInfoSkeleton: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  userInfo: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  userName: {
    ...typography.headingLg,
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  userGreeting: {
    ...typography.bodySm,
    color: colors.pineBlue[100],
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  userJoinYear: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    fontSize: 11,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.bodyMd,
    color: colors.pineBlue[300],
    marginBottom: spacing.md,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  editProfileText: {
    ...typography.bodySm,
    color: colors.evergreen[500],
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  signInButton: {
    marginTop: spacing.md,
    minWidth: 120,
  },
  statsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  statCard: {
    width: '48%',
    padding: spacing.md,
    alignItems: 'center',
  },
  statIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(8, 247, 116, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.headingLg,
    fontSize: 24,
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  statSubtext: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    fontSize: 10,
  },
  statMicroSubtitle: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    fontSize: 9,
    fontStyle: 'italic',
    marginTop: spacing.xs / 2,
    textAlign: 'center',
  },
  statProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.darkTeal[700],
    borderRadius: 2,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  statProgressFill: {
    height: '100%',
    backgroundColor: colors.evergreen[500],
    borderRadius: 2,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.headingSm,
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  menuItem: {
    marginBottom: spacing.sm,
  },
  menuItemPressed: {
    opacity: 0.8,
  },
  menuCard: {
    padding: spacing.sm + 2,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs / 2,
  },
  menuItemLabel: {
    ...typography.bodyMd,
    color: colors.white,
    fontWeight: '600',
    flex: 1,
  },
  menuItemLabelLight: {
    fontWeight: '500',
    color: colors.pineBlue[100],
  },
  menuItemVersion: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    fontSize: 10,
    marginLeft: spacing.sm,
  },
  menuItemDescription: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    fontSize: 11,
  },
  menuItemDescriptionLight: {
    color: colors.pineBlue[300],
    opacity: 0.7,
  },
  logoutSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  logoutButton: {
    borderColor: 'rgba(255,255,255,0.2)',
  },
  guestInfoSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  guestInfoCard: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  guestInfoTitle: {
    ...typography.headingSm,
    color: colors.white,
    fontWeight: '600',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  guestInfoText: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  guestSignInButton: {
    width: '100%',
  },
  bottomSpacer: {
    height: spacing['2xl'],
  },
  logoutModalContent: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  logoutModalTitle: {
    ...typography.headingMd,
    color: colors.white,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  logoutModalText: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  logoutModalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  logoutModalCancelButton: {
    flex: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoutModalConfirmButton: {
    flex: 1,
    backgroundColor: '#ef4444',
  },
});

export default ProfileScreen;


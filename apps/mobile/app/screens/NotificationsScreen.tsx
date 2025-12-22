import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDistanceToNow } from 'date-fns';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { IslamicPattern } from '../../src/components/ui/IslamicPattern';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Toast } from '../../src/components/ui/Toast';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, Notification } from '../../src/hooks/useNotifications';

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'checkmark-circle';
    case 'warning':
      return 'warning';
    case 'error':
      return 'alert-circle';
    default:
      return 'information-circle';
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return colors.evergreen[500];
    case 'warning':
      return '#FBBF24';
    case 'error':
      return '#EF4444';
    default:
      return colors.pineBlue[300];
  }
};

const NotificationCard: React.FC<{
  notification: Notification;
  onPress: () => void;
}> = ({ notification, onPress }) => {
  const iconName = getNotificationIcon(notification.type);
  const iconColor = getNotificationColor(notification.type);
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.notificationCard,
        pressed && styles.notificationCardPressed,
        !notification.isRead && styles.unreadCard,
      ]}
    >
      <GlassCard style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
            <Ionicons name={iconName as any} size={20} color={iconColor} />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {notification.title}
            </Text>
            <Text style={styles.cardTime}>{timeAgo}</Text>
          </View>
          {!notification.isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.cardMessage} numberOfLines={3}>
          {notification.message}
        </Text>
      </GlassCard>
    </Pressable>
  );
};

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { data: notifications = [], isLoading, refetch, isRefetching } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const hasUnread = unreadCount > 0;

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead.mutateAsync(notification.id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!hasUnread) return;
    
    try {
      await markAllAsRead.mutateAsync();
      setToastMessage('All notifications marked as read');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      setToastMessage('Failed to mark all as read');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const onRefresh = async () => {
    await refetch();
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
            <Text style={styles.headerTitle}>Notifications</Text>
            {hasUnread && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          {hasUnread && (
            <Pressable onPress={handleMarkAllAsRead} style={styles.markAllButton}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </Pressable>
          )}
          {!hasUnread && <View style={styles.placeholder} />}
        </View>

        {/* Content */}
        {isLoading && !notifications.length ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.evergreen[500]} />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon="notifications-outline"
            title="No notifications yet"
            message="You'll see important updates and reminders here when they arrive."
          />
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(160, insets.bottom + 140) },
            ]}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={onRefresh}
                tintColor={colors.evergreen[500]}
                colors={[colors.evergreen[500]]}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onPress={() => handleNotificationPress(notification)}
              />
            ))}
          </ScrollView>
        )}

        <Toast visible={showToast} message={toastMessage} icon="checkmark-circle" />
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
    paddingBottom: spacing.md,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.headingLg,
    fontSize: 20,
    color: colors.white,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: colors.evergreen[500],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    ...typography.bodySm,
    fontSize: 11,
    fontWeight: '700',
    color: colors.darkTeal[950],
  },
  markAllButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.darkTeal[800],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  markAllText: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.evergreen[500],
    fontWeight: '600',
  },
  placeholder: {
    width: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.bodyMd,
    color: colors.pineBlue[300],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  notificationCard: {
    marginBottom: spacing.sm,
  },
  notificationCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  unreadCard: {
    opacity: 1,
  },
  cardContent: {
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    ...typography.headingMd,
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardTime: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.evergreen[500],
  },
  cardMessage: {
    ...typography.bodyMd,
    fontSize: 14,
    lineHeight: 20,
    color: colors.pineBlue[100],
    marginTop: spacing.xs,
  },
});

export default NotificationsScreen;

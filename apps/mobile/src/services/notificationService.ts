import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface PrayerNotification {
  prayerName: string;
  time: Date;
  enabled: boolean;
}

const NOTIFICATION_IDS_KEY = 'prayer_notification_ids';

export const notificationService = {
  async requestPermission(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  async schedulePrayerNotification(prayer: PrayerNotification): Promise<string | null> {
    if (!prayer.enabled) {
      return null;
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${prayer.prayerName} Prayer Time`,
        body: `It's time for ${prayer.prayerName}`,
        sound: true,
      },
      trigger: {
        date: prayer.time,
      },
    });

    // Store notification IDs
    const ids = await this.getNotificationIds();
    ids.push(notificationId);
    await SecureStore.setItemAsync(NOTIFICATION_IDS_KEY, JSON.stringify(ids));

    return notificationId;
  },

  async cancelPrayerNotifications(): Promise<void> {
    const ids = await this.getNotificationIds();
    await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
    await SecureStore.deleteItemAsync(NOTIFICATION_IDS_KEY);
  },

  async getNotificationIds(): Promise<string[]> {
    try {
      const stored = await SecureStore.getItemAsync(NOTIFICATION_IDS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },
};


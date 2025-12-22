export type FeatureRouteKey =
  | 'prayerTimes'
  | 'qibla'
  | 'quranReader'
  | 'duas'
  | 'tasbih'
  | 'wazifaTracker'
  | 'lazimTracker'
  | 'zikrJumma'
  | 'journal'
  | 'scholars'
  | 'communityFeed'
  | 'chat'
  | 'mosqueLocator'
  | 'makkahLive'
  | 'aiNoor'
  | 'donate'
  | 'settings'
  | 'supportTickets';

export type FeatureRouteConfig = {
  key: FeatureRouteKey;
  label: string;
  description: string;
  route: string;
  icon: string;
  category: 'Worship' | 'Tijaniyah' | 'Quran' | 'Community' | 'Tools';
};

export const FEATURE_ROUTES: FeatureRouteConfig[] = [
  {
    key: 'prayerTimes',
    label: 'Prayer Times',
    description: "Today's Salah schedule",
    route: 'PrayerTimes',
    icon: 'time-outline',
    category: 'Worship',
  },
  {
    key: 'qibla',
    label: 'Qibla Compass',
    description: 'Direction of the Kaaba',
    route: 'QiblaCompass',
    icon: 'compass-outline',
    category: 'Worship',
  },
  {
    key: 'quranReader',
    label: 'Quran Reader',
    description: 'Read and reflect',
    route: 'QuranTab',
    icon: 'book-outline',
    category: 'Quran',
  },
  {
    key: 'duas',
    label: 'Duas',
    description: 'Supplications and adhkar',
    route: 'TijaniyahDuas',
    icon: 'leaf-outline',
    category: 'Worship',
  },
  {
    key: 'tasbih',
    label: 'Digital Tasbih',
    description: 'Dhikr counter',
    route: 'Tasbih',
    icon: 'infinite-outline',
    category: 'Worship',
  },
  {
    key: 'wazifaTracker',
    label: 'Wazifa Tracker',
    description: 'Daily Tijaniyah wird',
    route: 'WazifaLazim',
    icon: 'sparkles-outline',
    category: 'Tijaniyah',
  },
  {
    key: 'lazimTracker',
    label: 'Lazim Tracker',
    description: 'Lazim completion',
    route: 'WazifaLazim',
    icon: 'star-outline',
    category: 'Tijaniyah',
  },
  {
    key: 'zikrJumma',
    label: 'Zikr Jumma',
    description: 'Friday dhikr',
    route: 'ZikrJumma',
    icon: 'radio-outline',
    category: 'Tijaniyah',
  },
  {
    key: 'journal',
    label: 'Islamic Journal',
    description: 'Capture reflections',
    route: 'Journal',
    icon: 'journal-outline',
    category: 'Tools',
  },
  {
    key: 'scholars',
    label: 'Scholars',
    description: 'Tijaniyah scholars',
    route: 'Scholars',
    icon: 'school-outline',
    category: 'Tijaniyah',
  },
  {
    key: 'communityFeed',
    label: 'Community Feed',
    description: 'Ummah discussions',
    route: 'CommunityTab',
    icon: 'people-outline',
    category: 'Community',
  },
  {
    key: 'chat',
    label: 'Chat',
    description: 'Rooms & messages',
    route: 'ChatRooms',
    icon: 'chatbubble-ellipses-outline',
    category: 'Community',
  },
  {
    key: 'mosqueLocator',
    label: 'Mosque Locator',
    description: 'Nearby masajid',
    route: 'Mosques',
    icon: 'navigate-outline',
    category: 'Worship',
  },
  {
    key: 'makkahLive',
    label: 'Makkah Live',
    description: 'Live stream',
    route: 'MakkahLive',
    icon: 'radio-outline',
    category: 'Worship',
  },
  {
    key: 'aiNoor',
    label: 'AI Noor',
    description: 'Ask with adab',
    route: 'AiNoor',
    icon: 'sparkles-outline',
    category: 'Tools',
  },
  {
    key: 'donate',
    label: 'Donate',
    description: 'Support causes',
    route: 'Donate',
    icon: 'heart-outline',
    category: 'Tools',
  },
  {
    key: 'settings',
    label: 'Settings',
    description: 'App preferences',
    route: 'Settings',
    icon: 'settings-outline',
    category: 'Tools',
  },
  {
    key: 'supportTickets',
    label: 'Support Tickets',
    description: 'Get help',
    route: 'SupportTickets',
    icon: 'help-circle-outline',
    category: 'Tools',
  },
];


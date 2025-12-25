import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthStack } from './auth-stack';
import { AiNoorScreen } from './screens/AiNoorScreen';
import { DonateScreen } from './screens/DonateScreen';
import { JournalScreen } from './screens/JournalScreen';
import { MosqueLocatorScreen } from './screens/MosqueLocatorScreen';
import { ChatRoomsScreen } from './screens/ChatRoomsScreen';
import { ChatRoomScreen } from './screens/ChatRoomScreen';
import { UserSearchScreen } from '../src/screens/chat/UserSearchScreen';
import { PostDetailsScreen } from '../src/screens/community/PostDetailsScreen';
import { TijaniyahDuasScreen } from './screens/TijaniyahDuasScreen';
import { WazifaLazimScreen } from './screens/WazifaLazimScreen';
import { ScholarsScreen } from './screens/ScholarsScreen';
import { EventsScreen } from './screens/EventsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { SupportTicketsScreen } from './screens/SupportTicketsScreen';
import { MakkahLiveScreen } from './screens/MakkahLiveScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { SearchScreen } from './screens/SearchScreen';
import { ZikrJummaScreen } from './screens/ZikrJummaScreen';
import { PrayerTimesScreen } from '../src/screens/prayer/PrayerTimesScreen';
import { QiblaCompassScreen } from '../src/screens/prayer/QiblaCompassScreen';
import { PrayerSettingsScreen } from '../src/screens/prayer/PrayerSettingsScreen';
import { SurahReaderScreen } from '../src/screens/quran/SurahReaderScreen';
import { BookmarksScreen } from '../src/screens/quran/BookmarksScreen';
import { AllFeaturesScreen } from '../src/screens/features/AllFeaturesScreen';
import { TijaniyahFeaturesScreen } from '../src/screens/tijaniyah/TijaniyahFeaturesScreen';
import { TariqaTijaniyyahScreen } from '../src/screens/tijaniyah/TariqaTijaniyyahScreen';
import { TijaniyaFiqhScreen } from '../src/screens/tijaniyah/TijaniyaFiqhScreen';
import { BeginnersResourcesScreen } from '../src/screens/tijaniyah/BeginnersResourcesScreen';
import { BeginnersTermDetailScreen } from '../src/screens/tijaniyah/BeginnersTermDetailScreen';
import { BeginnersBookmarksScreen } from '../src/screens/tijaniyah/BeginnersBookmarksScreen';
import { ProofOfTasawwufPart1Screen } from '../src/screens/tijaniyah/ProofOfTasawwufPart1Screen';
import { TijaniyahArticleDetailScreen } from '../src/screens/tijaniyah/TijaniyahArticleDetailScreen';
import { DuasOfTijaniyahScreen } from '../src/screens/tijaniyah/DuasOfTijaniyahScreen';
import { DuaKhatmulWazifaScreen } from '../src/screens/tijaniyah/DuaKhatmulWazifaScreen';
import { DuaRabilIbadiScreen } from '../src/screens/tijaniyah/DuaRabilIbadiScreen';
import { DuaHasbilMuhaiminuScreen } from '../src/screens/tijaniyah/DuaHasbilMuhaiminuScreen';
import { useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { View, AppState, AppStateStatus } from 'react-native';
import { I18nProvider } from './i18n';
import TabsNavigator from '../src/navigation/Tabs';
import { TasbihScreen } from './tasbih';
import { SplashScreen } from '../src/screens/auth/SplashScreen';

const RootStack = createNativeStackNavigator();
const queryClient = new QueryClient();

function RootNavigator() {
  const [checking, setChecking] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      const guestMode = await SecureStore.getItemAsync('guestMode');
      
      // If guest mode is explicitly set, use that
      if (guestMode === 'true') {
        setIsGuest(true);
        setAuthed(false);
        setChecking(false);
        return;
      }

      // If we have both tokens, user is authenticated
      // The apiClient will automatically refresh expired tokens when making API calls
      if (token && refreshToken) {
        setAuthed(true);
        setIsGuest(false);
      } else {
        // No tokens, user is not authenticated
        setAuthed(false);
        setIsGuest(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthed(false);
      setIsGuest(false);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    // Initial auth check on app startup
    void checkAuth();
  }, []);

  // Show splash screen for minimum 2.5 seconds, then navigate based on auth state
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); // Show splash for minimum 2.5 seconds

    return () => clearTimeout(splashTimer);
  }, []);

  // Check auth state when app comes to foreground (not continuously)
  // This prevents unnecessary checks and token refresh loops
  useEffect(() => {
    if (showSplash || checking) return; // Don't check during splash or initial check
    
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground, check auth state
        void checkAuth();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [showSplash, checking, checkAuth]);

  // Show splash screen while checking or during splash delay
  if (checking || showSplash) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={!authed && !isGuest ? 'AuthStack' : 'MainTabs'}
      >
        {/* Always register both stacks so navigation works reliably */}
        <RootStack.Screen name="AuthStack" component={AuthStack} />
        <RootStack.Screen name="MainTabs" component={TabsNavigator} />
        <RootStack.Screen name="AiNoor" component={AiNoorScreen} />
        <RootStack.Screen name="Donate" component={DonateScreen} />
        <RootStack.Screen name="Journal" component={JournalScreen} />
        <RootStack.Screen name="Mosques" component={MosqueLocatorScreen} />
        <RootStack.Screen name="ChatRooms" component={ChatRoomsScreen} />
        <RootStack.Screen name="ChatRoom" component={ChatRoomScreen} />
        <RootStack.Screen name="UserSearch" component={UserSearchScreen} />
        <RootStack.Screen name="PostDetails" component={PostDetailsScreen} />
        <RootStack.Screen name="TijaniyahDuas" component={TijaniyahDuasScreen} />
        <RootStack.Screen name="WazifaLazim" component={WazifaLazimScreen} />
        <RootStack.Screen name="Tasbih" component={TasbihScreen} />
        <RootStack.Screen name="PrayerTimes" component={PrayerTimesScreen} />
        <RootStack.Screen name="QiblaCompass" component={QiblaCompassScreen} />
        <RootStack.Screen name="PrayerSettings" component={PrayerSettingsScreen} />
        <RootStack.Screen name="SurahReader" component={SurahReaderScreen} />
        <RootStack.Screen name="Bookmarks" component={BookmarksScreen} />
        <RootStack.Screen name="AllFeatures" component={AllFeaturesScreen} />
        <RootStack.Screen name="Scholars" component={ScholarsScreen} />
        <RootStack.Screen name="Events" component={EventsScreen} />
        <RootStack.Screen name="Settings" component={SettingsScreen} />
        <RootStack.Screen name="SupportTickets" component={SupportTicketsScreen} />
        <RootStack.Screen name="MakkahLive" component={MakkahLiveScreen} />
        <RootStack.Screen name="Notifications" component={NotificationsScreen} />
        <RootStack.Screen name="Search" component={SearchScreen} />
        <RootStack.Screen name="ZikrJumma" component={ZikrJummaScreen} />
        <RootStack.Screen name="TijaniyahFeatures" component={TijaniyahFeaturesScreen} />
        <RootStack.Screen name="TariqaTijaniyyah" component={TariqaTijaniyyahScreen} />
        <RootStack.Screen name="TijaniyaFiqh" component={TijaniyaFiqhScreen} />
        <RootStack.Screen name="BeginnersResources" component={BeginnersResourcesScreen} />
        <RootStack.Screen name="BeginnersTermDetail" component={BeginnersTermDetailScreen} />
        <RootStack.Screen name="BeginnersBookmarks" component={BeginnersBookmarksScreen} />
        <RootStack.Screen name="ProofOfTasawwufPart1" component={ProofOfTasawwufPart1Screen} />
        <RootStack.Screen name="TijaniyahArticleDetail" component={TijaniyahArticleDetailScreen} />
        <RootStack.Screen name="DuasOfTijaniyah" component={DuasOfTijaniyahScreen} />
        <RootStack.Screen name="DuaKhatmulWazifa" component={DuaKhatmulWazifaScreen} />
        <RootStack.Screen name="DuaRabilIbadi" component={DuaRabilIbadiScreen} />
        <RootStack.Screen name="DuaHasbilMuhaiminu" component={DuaHasbilMuhaiminuScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <QueryClientProvider client={queryClient}>
          <RootNavigator />
        </QueryClientProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}


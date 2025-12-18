import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomeScreen } from './home';
import { PrayerScreen } from './prayer';
import { QuranScreen } from './quran';
import { CommunityScreen } from './community';
import { ProfileScreen } from './profile';
import { TasbihScreen } from './tasbih';
import { AuthStack } from './auth-stack';
import { AiNoorScreen } from './screens/AiNoorScreen';
import { DonateScreen } from './screens/DonateScreen';
import { JournalScreen } from './screens/JournalScreen';
import { MosqueLocatorScreen } from './screens/MosqueLocatorScreen';
import { ChatRoomsScreen } from './screens/ChatRoomsScreen';
import { ChatRoomScreen } from './screens/ChatRoomScreen';
import { TijaniyahDuasScreen } from './screens/TijaniyahDuasScreen';
import { WazifaLazimScreen } from './screens/WazifaLazimScreen';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ActivityIndicator, View, TouchableOpacity, Text, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { I18nProvider } from './i18n';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();
const queryClient = new QueryClient();

function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const translate = new Animated.Value(0);

  Animated.timing(translate, {
    toValue: 0,
    duration: 400,
    useNativeDriver: true,
  }).start();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: Platform.OS === 'ios' ? 24 : 16,
        alignItems: 'center',
      }}
    >
      <Animated.View
        style={{
          flexDirection: 'row',
          backgroundColor: 'rgba(2, 6, 23, 0.82)',
          borderRadius: 28,
          paddingHorizontal: 18,
          paddingVertical: 10,
          borderWidth: 1,
          borderColor: 'rgba(45, 212, 191, 0.35)',
          shadowColor: '#000',
          shadowOpacity: 0.45,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          transform: [{ translateY: translate }],
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconName =
            route.name === 'Home'
              ? 'home'
              : route.name === 'Prayer'
              ? 'time'
              : route.name === 'Quran'
              ? 'book'
              : route.name === 'Community'
              ? 'people'
              : 'person';

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 6,
              }}
            >
              <Ionicons
                name={iconName as keyof typeof Ionicons.glyphMap}
                size={20}
                color={isFocused ? '#08f774' : '#a5f3fc'}
              />
              <Text
                style={{
                  fontSize: 10,
                  marginTop: 2,
                  color: isFocused ? '#e0f2fe' : '#7dd3fc',
                }}
              >
                {String(label)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </View>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={props => <FloatingTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Prayer" component={PrayerScreen} />
      <Tab.Screen name="Quran" component={QuranScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const check = async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      setAuthed(!!token);
      setChecking(false);
    };
    void check();
  }, []);

  if (checking) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#08f774" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!authed ? (
          <RootStack.Screen name="AuthStack" component={AuthStack} />
        ) : (
          <>
            <RootStack.Screen name="MainTabs" component={Tabs} />
            <RootStack.Screen name="AiNoor" component={AiNoorScreen} />
            <RootStack.Screen name="Donate" component={DonateScreen} />
            <RootStack.Screen name="Journal" component={JournalScreen} />
            <RootStack.Screen name="Mosques" component={MosqueLocatorScreen} />
            <RootStack.Screen name="ChatRooms" component={ChatRoomsScreen} />
            <RootStack.Screen name="ChatRoom" component={ChatRoomScreen} />
            <RootStack.Screen name="TijaniyahDuas" component={TijaniyahDuasScreen} />
            <RootStack.Screen name="WazifaLazim" component={WazifaLazimScreen} />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

export default function RootLayout() {
  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <RootNavigator />
      </QueryClientProvider>
    </I18nProvider>
  );
}


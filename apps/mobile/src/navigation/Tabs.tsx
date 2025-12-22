import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationIndependentTree } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStackNavigator from './stacks/HomeStack';
import PrayerStackNavigator from './stacks/PrayerStack';
import QuranStackNavigator from './stacks/QuranStack';
import CommunityStackNavigator from './stacks/CommunityStack';
import ProfileStackNavigator from './stacks/ProfileStack';
import { GlassTabBar } from './components/GlassTabBar';
import { TijaniyahFab } from './components/TijaniyahFab';

export type RootTabParamList = {
  HomeTab: undefined;
  PrayerTab: undefined;
  QuranTab: undefined;
  CommunityTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export const TabsNavigator: React.FC = () => {
  return (
    <NavigationIndependentTree>
      <View style={styles.container}>
        <Tab.Navigator
          screenOptions={{ headerShown: false }}
          tabBar={props => <GlassTabBar {...props} />}
        >
          <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: 'Home' }} />
          <Tab.Screen name="PrayerTab" component={PrayerStackNavigator} options={{ title: 'Prayer' }} />
          <Tab.Screen name="QuranTab" component={QuranStackNavigator} options={{ title: 'Quran' }} />
          <Tab.Screen
            name="CommunityTab"
            component={CommunityStackNavigator}
            options={{ title: 'Community' }}
          />
          <Tab.Screen
            name="ProfileTab"
            component={ProfileStackNavigator}
            options={{ title: 'Profile' }}
          />
        </Tab.Navigator>
        <TijaniyahFab />
      </View>
    </NavigationIndependentTree>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default TabsNavigator;



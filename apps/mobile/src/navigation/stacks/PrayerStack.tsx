import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PrayerScreen } from '../../../app/prayer';
import { PrayerTimesScreen } from '../../screens/prayer/PrayerTimesScreen';
import { QiblaCompassScreen } from '../../screens/prayer/QiblaCompassScreen';
import { PrayerSettingsScreen } from '../../screens/prayer/PrayerSettingsScreen';
import { MosqueLocatorScreen } from '../../../app/screens/MosqueLocatorScreen';

export type PrayerStackParamList = {
  PrayerMain: undefined;
  PrayerTimes: undefined;
  QiblaCompass: undefined;
  PrayerSettings: undefined;
  Mosques: undefined;
};

const Stack = createNativeStackNavigator<PrayerStackParamList>();

export const PrayerStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="PrayerTimes">
      <Stack.Screen name="PrayerTimes" component={PrayerTimesScreen} />
      <Stack.Screen name="PrayerMain" component={PrayerScreen} />
      <Stack.Screen name="QiblaCompass" component={QiblaCompassScreen} />
      <Stack.Screen name="PrayerSettings" component={PrayerSettingsScreen} />
      <Stack.Screen name="Mosques" component={MosqueLocatorScreen} />
    </Stack.Navigator>
  );
};

export default PrayerStackNavigator;



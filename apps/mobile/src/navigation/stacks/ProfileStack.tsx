import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../../screens/profile/ProfileScreen';
import { JournalScreen } from '../../../app/screens/JournalScreen';
import { DonateScreen } from '../../../app/screens/DonateScreen';
import { SettingsScreen } from '../../../app/screens/SettingsScreen';
import { SupportTicketsScreen } from '../../../app/screens/SupportTicketsScreen';
import { TermsScreen } from '../../screens/auth/TermsScreen';
import { PrivacyScreen } from '../../screens/auth/PrivacyScreen';
import { BookmarksScreen } from '../../screens/quran/BookmarksScreen';
import { WazifaLazimScreen } from '../../../app/screens/WazifaLazimScreen';
import { EditProfileScreen } from '../../screens/profile/EditProfileScreen';

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Journal: undefined;
  Donate: undefined;
  Settings: undefined;
  SupportTickets: undefined;
  Terms: undefined;
  Privacy: undefined;
  Bookmarks: undefined;
  WazifaLazim: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Journal" component={JournalScreen} />
      <Stack.Screen name="Donate" component={DonateScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="SupportTickets" component={SupportTicketsScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
      <Stack.Screen name="WazifaLazim" component={WazifaLazimScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;



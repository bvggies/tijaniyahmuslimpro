import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QuranHomeScreen } from '../../screens/quran/QuranHomeScreen';
import { SurahReaderScreen } from '../../screens/quran/SurahReaderScreen';
import { BookmarksScreen } from '../../screens/quran/BookmarksScreen';

export type QuranStackParamList = {
  QuranMain: undefined;
  SurahReader: { surahNumber: number; ayahNumber?: number };
  Bookmarks: undefined;
};

const Stack = createNativeStackNavigator<QuranStackParamList>();

export const QuranStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="QuranMain" component={QuranHomeScreen} />
      <Stack.Screen name="SurahReader" component={SurahReaderScreen} />
      <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
    </Stack.Navigator>
  );
};

export default QuranStackNavigator;



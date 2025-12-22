import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CommunityFeedScreen } from '../../screens/community/CommunityFeedScreen';
import { ChatRoomsScreen } from '../../screens/chat/ChatRoomsScreen';
import { ChatRoomScreen } from '../../screens/chat/ChatRoomScreen';

export type CommunityStackParamList = {
  CommunityMain: undefined;
  ChatRooms: undefined;
  ChatRoom: { roomId: string; name: string };
  PostDetails: { postId: string };
};

const Stack = createNativeStackNavigator<CommunityStackParamList>();

export const CommunityStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CommunityMain" component={CommunityFeedScreen} />
      <Stack.Screen name="ChatRooms" component={ChatRoomsScreen} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
    </Stack.Navigator>
  );
};

export default CommunityStackNavigator;



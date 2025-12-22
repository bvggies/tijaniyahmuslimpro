import { NavigationProp } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

/**
 * Navigate to AuthStack from anywhere in the app
 * This clears guest mode and resets navigation to AuthStack
 */
export const navigateToAuth = async (navigation: NavigationProp<any>) => {
  try {
    // Clear guest mode and tokens to trigger auth flow
    await SecureStore.deleteItemAsync('guestMode');
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    
    // Reset navigation to AuthStack
    // AuthStack is always registered in RootNavigator, so this should work
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'AuthStack' }],
      }),
    );
  } catch (error) {
    // If navigation fails, the periodic auth check in RootNavigator 
    // will detect the cleared auth state and switch to AuthStack automatically
    if (__DEV__) {
      console.debug('Navigation reset to AuthStack failed, will auto-refresh:', error);
    }
  }
};


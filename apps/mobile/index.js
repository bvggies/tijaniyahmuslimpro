// JS entry file required by Expo/Metro bundler.
// Import gesture handler FIRST - required for React Navigation
import 'react-native-gesture-handler';

// Import and register the root component
import { registerRootComponent } from 'expo';
import RootLayout from './app/_layout';

registerRootComponent(RootLayout);



// Import gesture handler FIRST - required for React Navigation
import 'react-native-gesture-handler';

import { registerRootComponent } from 'expo';
import RootLayout from './app/_layout';

registerRootComponent(RootLayout);

import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import App from './App';

// Register Service Worker for Offline Support (PWA)
if (Platform.OS === 'web' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swPath = './service-worker.js';
    navigator.serviceWorker
      .register(swPath)
      .then((registration) => {
        console.log('SW registered with scope: ', registration.scope);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

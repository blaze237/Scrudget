import 'react-native-get-random-values';
import React from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ScrudgetProvider, useScrudget } from './src/context/ScrudgetContext';
import { ConfirmProvider } from './src/context/ConfirmContext';
import AppNavigator from './src/navigation/AppNavigator';

function ThemedStatusBar() {
  const { state, colors } = useScrudget();
  
  // Update web meta tags dynamically
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      // 1. Update theme-color
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute('content', colors.background);
      } else {
        const newMeta = document.createElement('meta');
        newMeta.name = 'theme-color';
        newMeta.content = colors.background;
        document.head.appendChild(newMeta);
      }
      
      // 2. Update body background
      document.body.style.backgroundColor = colors.background;
      document.documentElement.style.backgroundColor = colors.background;

      // 3. Inject PWA Icon & Manifest for Safari
      const iconUrl = require('./assets/icon.png');
      const iconUri = typeof iconUrl === 'string' ? iconUrl : iconUrl.uri || iconUrl.default;

      if (iconUri) {
        // Apple Touch Icon
        let appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
        if (!appleIcon) {
          appleIcon = document.createElement('link');
          appleIcon.setAttribute('rel', 'apple-touch-icon');
          document.head.appendChild(appleIcon);
        }
        appleIcon.setAttribute('href', iconUri);

        // Shortcut Icon (for good measure)
        let favIcon = document.querySelector('link[rel="shortcut icon"]');
        if (!favIcon) {
          favIcon = document.createElement('link');
          favIcon.setAttribute('rel', 'shortcut icon');
          document.head.appendChild(favIcon);
        }
        favIcon.setAttribute('href', iconUri);
      }

      // 4. Ensure Manifest is linked
      let manifestLink = document.querySelector('link[rel="manifest"]');
      if (!manifestLink) {
        manifestLink = document.createElement('link');
        manifestLink.setAttribute('rel', 'manifest');
        manifestLink.setAttribute('href', '/manifest.json');
        document.head.appendChild(manifestLink);
      }
    }
  }, [colors.background]);

  return <StatusBar style={state.themePreference === 'dark' ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <ScrudgetProvider>
      <ConfirmProvider>
        <ThemedStatusBar />
        <AppNavigator />
      </ConfirmProvider>
    </ScrudgetProvider>
  );
}

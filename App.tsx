import 'react-native-get-random-values';
import React from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ScrudgetProvider, useScrudget } from './src/context/ScrudgetContext';
import { ConfirmProvider } from './src/context/ConfirmContext';
import AppNavigator from './src/navigation/AppNavigator';

function ThemedStatusBar() {
  const { state, colors } = useScrudget();
  
  // Update web meta theme-color dynamically
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      // Update theme-color meta tag
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute('content', colors.background);
      } else {
        const newMeta = document.createElement('meta');
        newMeta.name = 'theme-color';
        newMeta.content = colors.background;
        document.head.appendChild(newMeta);
      }
      
      // Also update body background for PWA area matching
      document.body.style.backgroundColor = colors.background;
      document.documentElement.style.backgroundColor = colors.background;
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

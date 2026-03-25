import 'react-native-get-random-values';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ScrudgetProvider } from './src/context/ScrudgetContext';
import { ConfirmProvider } from './src/context/ConfirmContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ScrudgetProvider>
      <ConfirmProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </ConfirmProvider>
    </ScrudgetProvider>
  );
}

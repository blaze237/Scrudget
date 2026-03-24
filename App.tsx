import 'react-native-get-random-values';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { BudgetProvider } from './src/context/BudgetContext';
import { ConfirmProvider } from './src/context/ConfirmContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <BudgetProvider>
      <ConfirmProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </ConfirmProvider>
    </BudgetProvider>
  );
}

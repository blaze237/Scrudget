import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import BudgetDetailScreen from '../screens/BudgetDetailScreen';
import ArchivedPeriodsScreen from '../screens/ArchivedPeriodsScreen';
import PeriodDetailScreen from '../screens/PeriodDetailScreen';

export type RootStackParamList = {
  Home: undefined;
  BudgetDetail: { budgetId: string };
  ArchivedPeriods: { budgetId: string };
  PeriodDetail: { budgetId: string; periodId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="BudgetDetail" component={BudgetDetailScreen} />
        <Stack.Screen name="ArchivedPeriods" component={ArchivedPeriodsScreen} />
        <Stack.Screen name="PeriodDetail" component={PeriodDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

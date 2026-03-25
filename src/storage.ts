import AsyncStorage from '@react-native-async-storage/async-storage';
import { Scrudget, Expense, Period } from './types';

const KEYS = {
  SCRUDGETS: '@scrudget_scrudgets',
  EXPENSES: '@scrudget_expenses',
  PERIODS: '@scrudget_periods',
  THEME: '@scrudget_theme',
};

export const saveScrudgets = async (scrudgets: Scrudget[]): Promise<void> => {
  await AsyncStorage.setItem(KEYS.SCRUDGETS, JSON.stringify(scrudgets));
};

export const saveExpenses = async (expenses: Expense[]): Promise<void> => {
  await AsyncStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
};

export const savePeriods = async (periods: Period[]): Promise<void> => {
  await AsyncStorage.setItem(KEYS.PERIODS, JSON.stringify(periods));
};

export const saveTheme = async (theme: 'light' | 'dark'): Promise<void> => {
  await AsyncStorage.setItem(KEYS.THEME, theme);
};

export const loadScrudgets = async (): Promise<Scrudget[]> => {
  const data = await AsyncStorage.getItem(KEYS.SCRUDGETS);
  return data ? JSON.parse(data) : [];
};

export const loadExpenses = async (): Promise<Expense[]> => {
  const data = await AsyncStorage.getItem(KEYS.EXPENSES);
  return data ? JSON.parse(data) : [];
};

export const loadPeriods = async (): Promise<Period[]> => {
  const data = await AsyncStorage.getItem(KEYS.PERIODS);
  return data ? JSON.parse(data) : [];
};

export const loadTheme = async (): Promise<'light' | 'dark'> => {
  const data = await AsyncStorage.getItem(KEYS.THEME);
  return data === 'light' ? 'light' : 'dark';
};

export const saveAll = async (
  scrudgets: Scrudget[],
  expenses: Expense[],
  periods: Period[]
): Promise<void> => {
  await Promise.all([
    saveScrudgets(scrudgets),
    saveExpenses(expenses),
    savePeriods(periods),
  ]);
};

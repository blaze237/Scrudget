import AsyncStorage from '@react-native-async-storage/async-storage';
import { Scrudget, Expense, Period } from './types';

const KEYS = {
  SCRUDGETS: '@scrudget_scrudgets',
  EXPENSES: '@scrudget_expenses',
  PERIODS: '@scrudget_periods',
  THEME: '@scrudget_theme',
};

const OLD_KEYS = {
  SCRUDGETS: '@scrudget_budgets',
  EXPENSES: '@scrudget_expenses',
  PERIODS: '@scrudget_periods',
  THEME: '@scrudget_theme', // theme key didn't change but included for completeness
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
  if (data) return JSON.parse(data);
  
  // Migration check
  const oldData = await AsyncStorage.getItem(OLD_KEYS.SCRUDGETS);
  if (oldData) {
    const parsed = JSON.parse(oldData);
    await saveScrudgets(parsed);
    // Optionally remove old key? Let's leave it for safety during this transition
    return parsed;
  }
  return [];
};

export const loadExpenses = async (): Promise<Expense[]> => {
  const data = await AsyncStorage.getItem(KEYS.EXPENSES);
  if (data) return JSON.parse(data);

  const oldData = await AsyncStorage.getItem(OLD_KEYS.EXPENSES);
  if (oldData) {
    const parsed = JSON.parse(oldData);
    await saveExpenses(parsed);
    return parsed;
  }
  return [];
};

export const loadPeriods = async (): Promise<Period[]> => {
  const data = await AsyncStorage.getItem(KEYS.PERIODS);
  if (data) return JSON.parse(data);

  const oldData = await AsyncStorage.getItem(OLD_KEYS.PERIODS);
  if (oldData) {
    const parsed = JSON.parse(oldData);
    await savePeriods(parsed);
    return parsed;
  }
  return [];
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

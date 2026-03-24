import AsyncStorage from '@react-native-async-storage/async-storage';
import { Budget, Expense, Period } from './types';

const KEYS = {
  BUDGETS: '@scrudget_budgets',
  EXPENSES: '@scrudget_expenses',
  PERIODS: '@scrudget_periods',
};

export const saveBudgets = async (budgets: Budget[]): Promise<void> => {
  await AsyncStorage.setItem(KEYS.BUDGETS, JSON.stringify(budgets));
};

export const saveExpenses = async (expenses: Expense[]): Promise<void> => {
  await AsyncStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
};

export const savePeriods = async (periods: Period[]): Promise<void> => {
  await AsyncStorage.setItem(KEYS.PERIODS, JSON.stringify(periods));
};

export const loadBudgets = async (): Promise<Budget[]> => {
  const data = await AsyncStorage.getItem(KEYS.BUDGETS);
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

export const saveAll = async (
  budgets: Budget[],
  expenses: Expense[],
  periods: Period[]
): Promise<void> => {
  await Promise.all([
    saveBudgets(budgets),
    saveExpenses(expenses),
    savePeriods(periods),
  ]);
};

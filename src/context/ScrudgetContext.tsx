import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppState, AppAction, Scrudget, Expense, Period } from '../types';
import { saveAll, loadScrudgets, loadExpenses, loadPeriods, loadTheme, saveTheme } from '../storage';
import { lightColors, darkColors, ThemeColors } from '../theme';

const initialState: AppState = {
  scrudgets: [],
  expenses: [],
  periods: [],
  isLoaded: false,
  themePreference: 'dark',
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_DATA': {
      return {
        scrudgets: action.payload.scrudgets,
        expenses: action.payload.expenses,
        periods: action.payload.periods,
        themePreference: action.payload.themePref,
        isLoaded: true,
      };
    }

    case 'ADD_SCRUDGET': {
      const periodId = uuidv4();
      const scrudgetId = uuidv4();
      const newScrudget: Scrudget = {
        id: scrudgetId,
        name: action.payload.name,
        baseValue: action.payload.baseValue,
        currentBalance: action.payload.baseValue,
        currentPeriodId: periodId,
        color: action.payload.color,
      };
      const newPeriod: Period = {
        id: periodId,
        scrudgetId: scrudgetId,
        startDate: new Date().toISOString(),
        endDate: null,
        startingBalance: action.payload.baseValue,
        finalBalance: null,
      };
      return {
        ...state,
        scrudgets: [...state.scrudgets, newScrudget],
        periods: [...state.periods, newPeriod],
      };
    }

    case 'EDIT_SCRUDGET': {
      const { scrudgetId, name, baseValue, color } = action.payload;
      return {
        ...state,
        scrudgets: state.scrudgets.map((b) =>
          b.id === scrudgetId
            ? {
                ...b,
                name,
                currentBalance: b.currentBalance + (baseValue - b.baseValue), // Adjust balance by diff
                baseValue,
                color,
              }
            : b
        ),
      };
    }

    case 'DELETE_SCRUDGET': {
      const { scrudgetId } = action.payload;
      return {
        ...state,
        scrudgets: state.scrudgets.filter((b) => b.id !== scrudgetId),
        expenses: state.expenses.filter((e) => e.scrudgetId !== scrudgetId),
        periods: state.periods.filter((p) => p.scrudgetId !== scrudgetId),
      };
    }

    case 'ADD_EXPENSE': {
      const scrudget = state.scrudgets.find((b) => b.id === action.payload.scrudgetId);
      if (!scrudget) return state;

      const newExpense: Expense = {
        id: uuidv4(),
        scrudgetId: action.payload.scrudgetId,
        periodId: scrudget.currentPeriodId,
        name: action.payload.name,
        amount: action.payload.amount,
        createdAt: new Date().toISOString(),
      };

      const updatedScrudgets = state.scrudgets.map((b) =>
        b.id === action.payload.scrudgetId
          ? { ...b, currentBalance: b.currentBalance - action.payload.amount }
          : b
      );

      return {
        ...state,
        scrudgets: updatedScrudgets,
        expenses: [...state.expenses, newExpense],
      };
    }

    case 'EDIT_EXPENSE': {
      const { expenseId, name, amount } = action.payload;
      const existingExpense = state.expenses.find((e) => e.id === expenseId);
      if (!existingExpense) return state;

      const diff = amount - existingExpense.amount;
      const updatedScrudgets = state.scrudgets.map((b) =>
        b.id === existingExpense.scrudgetId
          ? { ...b, currentBalance: b.currentBalance - diff }
          : b
      );

      return {
        ...state,
        scrudgets: updatedScrudgets,
        expenses: state.expenses.map((e) =>
          e.id === expenseId ? { ...e, name, amount } : e
        ),
      };
    }

    case 'DELETE_EXPENSE': {
      const expense = state.expenses.find((e) => e.id === action.payload.expenseId);
      if (!expense) return state;

      const updatedScrudgets = state.scrudgets.map((b) =>
        b.id === expense.scrudgetId
          ? { ...b, currentBalance: b.currentBalance + expense.amount }
          : b
      );

      return {
        ...state,
        scrudgets: updatedScrudgets,
        expenses: state.expenses.filter((e) => e.id !== action.payload.expenseId),
      };
    }

    case 'RESET_ALL_SCRUDGETS': {
      const now = new Date().toISOString();

      // Close all current periods
      const updatedPeriods = state.periods.map((p) => {
        if (p.endDate === null) {
          const scrudget = state.scrudgets.find((b) => b.id === p.scrudgetId);
          return {
            ...p,
            endDate: now,
            finalBalance: scrudget ? scrudget.currentBalance : 0,
          };
        }
        return p;
      });

      // Create new periods for each scrudget
      const newPeriods: Period[] = state.scrudgets.map((b) => ({
        id: uuidv4(),
        scrudgetId: b.id,
        startDate: now,
        endDate: null,
        startingBalance: b.baseValue,
        finalBalance: null,
      }));

      // Reset scrudgets to base values with new period IDs
      const resetScrudgets: Scrudget[] = state.scrudgets.map((b, i) => ({
        ...b,
        currentBalance: b.baseValue,
        currentPeriodId: newPeriods[i].id,
      }));

      return {
        ...state,
        scrudgets: resetScrudgets,
        periods: [...updatedPeriods, ...newPeriods],
        // expenses remain — they belong to old periods
      };
    }

    case 'TOGGLE_THEME': {
      return {
        ...state,
        themePreference: state.themePreference === 'light' ? 'dark' : 'light',
      };
    }

    default:
      return state;
  }
}

interface ScrudgetContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  colors: ThemeColors;
}

const ScrudgetContext = createContext<ScrudgetContextType | undefined>(undefined);

export function ScrudgetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [scrudgets, expenses, periods, themePref] = await Promise.all([
          loadScrudgets(),
          loadExpenses(),
          loadPeriods(),
          loadTheme(),
        ]);
        dispatch({ type: 'LOAD_DATA', payload: { scrudgets, expenses, periods, themePref } });
      } catch (error) {
        console.error('Failed to load data:', error);
        dispatch({ type: 'LOAD_DATA', payload: { scrudgets: [], expenses: [], periods: [], themePref: 'dark' } });
      }
    };
    loadData();
  }, []);

  // Save data whenever state changes (after initial load)
  useEffect(() => {
    if (state.isLoaded) {
      saveAll(state.scrudgets, state.expenses, state.periods).catch((error) =>
        console.error('Failed to save data:', error)
      );
      saveTheme(state.themePreference).catch((error) =>
        console.error('Failed to save theme:', error)
      );
    }
  }, [state.scrudgets, state.expenses, state.periods, state.themePreference, state.isLoaded]);

  const colors = state.themePreference === 'light' ? lightColors : darkColors;

  return (
    <ScrudgetContext.Provider value={{ state, dispatch, colors }}>
      {children}
    </ScrudgetContext.Provider>
  );
}

export function useScrudget(): ScrudgetContextType {
  const context = useContext(ScrudgetContext);
  if (!context) {
    throw new Error('useScrudget must be used within a ScrudgetProvider');
  }
  return context;
}

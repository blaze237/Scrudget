import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppState, AppAction, Budget, Expense, Period } from '../types';
import { saveAll, loadBudgets, loadExpenses, loadPeriods, loadTheme, saveTheme } from '../storage';
import { lightColors, darkColors, ThemeColors } from '../theme';

const initialState: AppState = {
  budgets: [],
  expenses: [],
  periods: [],
  isLoaded: false,
  themePreference: 'dark',
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_DATA': {
      return {
        budgets: action.payload.budgets,
        expenses: action.payload.expenses,
        periods: action.payload.periods,
        themePreference: action.payload.themePref,
        isLoaded: true,
      };
    }

    case 'ADD_BUDGET': {
      const periodId = uuidv4();
      const budgetId = uuidv4();
      const newBudget: Budget = {
        id: budgetId,
        name: action.payload.name,
        baseValue: action.payload.baseValue,
        currentBalance: action.payload.baseValue,
        currentPeriodId: periodId,
        color: action.payload.color,
      };
      const newPeriod: Period = {
        id: periodId,
        budgetId: budgetId,
        startDate: new Date().toISOString(),
        endDate: null,
        startingBalance: action.payload.baseValue,
        finalBalance: null,
      };
      return {
        ...state,
        budgets: [...state.budgets, newBudget],
        periods: [...state.periods, newPeriod],
      };
    }

    case 'EDIT_BUDGET': {
      const { budgetId, name, baseValue, color } = action.payload;
      return {
        ...state,
        budgets: state.budgets.map((b) =>
          b.id === budgetId
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

    case 'DELETE_BUDGET': {
      const { budgetId } = action.payload;
      return {
        ...state,
        budgets: state.budgets.filter((b) => b.id !== budgetId),
        expenses: state.expenses.filter((e) => e.budgetId !== budgetId),
        periods: state.periods.filter((p) => p.budgetId !== budgetId),
      };
    }

    case 'ADD_EXPENSE': {
      const budget = state.budgets.find((b) => b.id === action.payload.budgetId);
      if (!budget) return state;

      const newExpense: Expense = {
        id: uuidv4(),
        budgetId: action.payload.budgetId,
        periodId: budget.currentPeriodId,
        name: action.payload.name,
        amount: action.payload.amount,
        createdAt: new Date().toISOString(),
      };

      const updatedBudgets = state.budgets.map((b) =>
        b.id === action.payload.budgetId
          ? { ...b, currentBalance: b.currentBalance - action.payload.amount }
          : b
      );

      return {
        ...state,
        budgets: updatedBudgets,
        expenses: [...state.expenses, newExpense],
      };
    }

    case 'EDIT_EXPENSE': {
      const { expenseId, name, amount } = action.payload;
      const existingExpense = state.expenses.find((e) => e.id === expenseId);
      if (!existingExpense) return state;

      const diff = amount - existingExpense.amount;
      const updatedBudgets = state.budgets.map((b) =>
        b.id === existingExpense.budgetId
          ? { ...b, currentBalance: b.currentBalance - diff }
          : b
      );

      return {
        ...state,
        budgets: updatedBudgets,
        expenses: state.expenses.map((e) =>
          e.id === expenseId ? { ...e, name, amount } : e
        ),
      };
    }

    case 'DELETE_EXPENSE': {
      const expense = state.expenses.find((e) => e.id === action.payload.expenseId);
      if (!expense) return state;

      const updatedBudgets = state.budgets.map((b) =>
        b.id === expense.budgetId
          ? { ...b, currentBalance: b.currentBalance + expense.amount }
          : b
      );

      return {
        ...state,
        budgets: updatedBudgets,
        expenses: state.expenses.filter((e) => e.id !== action.payload.expenseId),
      };
    }

    case 'RESET_ALL_BUDGETS': {
      const now = new Date().toISOString();

      // Close all current periods
      const updatedPeriods = state.periods.map((p) => {
        if (p.endDate === null) {
          const budget = state.budgets.find((b) => b.id === p.budgetId);
          return {
            ...p,
            endDate: now,
            finalBalance: budget ? budget.currentBalance : 0,
          };
        }
        return p;
      });

      // Create new periods for each budget
      const newPeriods: Period[] = state.budgets.map((b) => ({
        id: uuidv4(),
        budgetId: b.id,
        startDate: now,
        endDate: null,
        startingBalance: b.baseValue,
        finalBalance: null,
      }));

      // Reset budgets to base values with new period IDs
      const resetBudgets: Budget[] = state.budgets.map((b, i) => ({
        ...b,
        currentBalance: b.baseValue,
        currentPeriodId: newPeriods[i].id,
      }));

      return {
        ...state,
        budgets: resetBudgets,
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

interface BudgetContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  colors: ThemeColors;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [budgets, expenses, periods, themePref] = await Promise.all([
          loadBudgets(),
          loadExpenses(),
          loadPeriods(),
          loadTheme(),
        ]);
        dispatch({ type: 'LOAD_DATA', payload: { budgets, expenses, periods, themePref } });
      } catch (error) {
        console.error('Failed to load data:', error);
        dispatch({ type: 'LOAD_DATA', payload: { budgets: [], expenses: [], periods: [], themePref: 'dark' } });
      }
    };
    loadData();
  }, []);

  // Save data whenever state changes (after initial load)
  useEffect(() => {
    if (state.isLoaded) {
      saveAll(state.budgets, state.expenses, state.periods).catch((error) =>
        console.error('Failed to save data:', error)
      );
      saveTheme(state.themePreference).catch((error) =>
        console.error('Failed to save theme:', error)
      );
    }
  }, [state.budgets, state.expenses, state.periods, state.themePreference, state.isLoaded]);

  const colors = state.themePreference === 'light' ? lightColors : darkColors;

  return (
    <BudgetContext.Provider value={{ state, dispatch, colors }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget(): BudgetContextType {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}

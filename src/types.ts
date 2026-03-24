export interface Budget {
  id: string;
  name: string;
  baseValue: number;
  currentBalance: number;
  currentPeriodId: string;
}

export interface Expense {
  id: string;
  budgetId: string;
  periodId: string;
  name: string;
  amount: number; // always positive, displayed as negative
  createdAt: string; // ISO date string
}

export interface Period {
  id: string;
  budgetId: string;
  startDate: string; // ISO date string
  endDate: string | null; // null = current/active period
  startingBalance: number;
  finalBalance: number | null;
}

export interface AppState {
  budgets: Budget[];
  expenses: Expense[];
  periods: Period[];
  isLoaded: boolean;
}

export type AppAction =
  | { type: 'LOAD_DATA'; payload: { budgets: Budget[]; expenses: Expense[]; periods: Period[] } }
  | { type: 'ADD_BUDGET'; payload: { name: string; baseValue: number } }
  | { type: 'DELETE_BUDGET'; payload: { budgetId: string } }
  | { type: 'ADD_EXPENSE'; payload: { budgetId: string; name: string; amount: number } }
  | { type: 'DELETE_EXPENSE'; payload: { expenseId: string } }
  | { type: 'RESET_ALL_BUDGETS' };

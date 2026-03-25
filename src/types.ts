export interface Scrudget {
  id: string;
  name: string;
  baseValue: number;
  currentBalance: number;
  currentPeriodId: string;
  color: string;
}

export interface Expense {
  id: string;
  scrudgetId: string;
  periodId: string;
  name: string;
  amount: number; // always positive, displayed as negative
  createdAt: string; // ISO date string
}

export interface Period {
  id: string;
  scrudgetId: string;
  startDate: string; // ISO date string
  endDate: string | null; // null = current/active period
  startingBalance: number;
  finalBalance: number | null;
}

export interface AppState {
  scrudgets: Scrudget[];
  expenses: Expense[];
  periods: Period[];
  isLoaded: boolean;
  themePreference: 'light' | 'dark';
}

export type AppAction =
  | { type: 'LOAD_DATA'; payload: { scrudgets: Scrudget[]; expenses: Expense[]; periods: Period[]; themePref: 'light' | 'dark' } }
  | { type: 'ADD_SCRUDGET'; payload: { name: string; baseValue: number; color: string } }
  | { type: 'EDIT_SCRUDGET'; payload: { scrudgetId: string; name: string; baseValue: number; color: string } }
  | { type: 'DELETE_SCRUDGET'; payload: { scrudgetId: string } }
  | { type: 'ADD_EXPENSE'; payload: { scrudgetId: string; name: string; amount: number } }
  | { type: 'EDIT_EXPENSE'; payload: { expenseId: string; name: string; amount: number } }
  | { type: 'DELETE_EXPENSE'; payload: { expenseId: string } }
  | { type: 'RESET_ALL_SCRUDGETS' }
  | { type: 'TOGGLE_THEME' };

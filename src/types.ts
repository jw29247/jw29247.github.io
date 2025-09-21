export type IncomeType = 'Monthly Income' | 'Bonus';

export interface Income {
  id: string;
  month: string; // format YYYY-MM
  description: string;
  amount: number;
  type: IncomeType;
}

export type ExpenseCategory =
  | 'Essentials'
  | 'Discretionary'
  | 'House (one-off)'
  | 'House (recurring)'
  | 'Wedding'
  | 'Other';

export interface Expense {
  id: string;
  month: string; // format YYYY-MM
  description: string;
  amount: number;
  category: ExpenseCategory;
}

export interface WeddingContribution {
  id: string;
  date: string; // ISO date
  amount: number;
  note: string;
}

export interface WeddingPlan {
  targetDate: string; // ISO date
  targetAmount: number;
  currentSavings: number;
  contributions: WeddingContribution[];
}

export interface FinanceState {
  incomes: Income[];
  expenses: Expense[];
  wedding: WeddingPlan;
}

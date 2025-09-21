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
  recursMonthly?: boolean;
}

export interface WeddingBudgetItem {
  id: string;
  description: string;
  quoted: number;
  paid: number;
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
  budgetItems: WeddingBudgetItem[];
}

export interface FinanceState {
  incomes: Income[];
  expenses: Expense[];
  wedding: WeddingPlan;
}

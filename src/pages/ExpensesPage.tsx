import type { Expense } from '../types';
import ExpenseManager from '../components/finance/ExpenseManager';
import '../styles/ui.css';
import '../styles/finance-page.css';

type ExpensesPageProps = {
  month: string;
  onMonthChange: (month: string) => void;
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onRemoveExpense: (id: string) => void;
};

export function ExpensesPage({
  month,
  onMonthChange,
  expenses,
  onAddExpense,
  onRemoveExpense,
}: ExpensesPageProps) {
  return (
    <section className="page">
      <ExpenseManager
        month={month}
        onMonthChange={onMonthChange}
        expenses={expenses}
        onAddExpense={onAddExpense}
        onRemoveExpense={onRemoveExpense}
      />
    </section>
  );
}

export default ExpensesPage;

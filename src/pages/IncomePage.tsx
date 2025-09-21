import type { Income } from '../types';
import IncomeManager from '../components/finance/IncomeManager';
import '../styles/ui.css';
import '../styles/finance-page.css';

type IncomePageProps = {
  month: string;
  onMonthChange: (month: string) => void;
  incomes: Income[];
  onAddIncome: (income: Omit<Income, 'id'>) => void;
  onRemoveIncome: (id: string) => void;
};

export function IncomePage({ month, onMonthChange, incomes, onAddIncome, onRemoveIncome }: IncomePageProps) {
  return (
    <section className="page">
      <IncomeManager
        month={month}
        onMonthChange={onMonthChange}
        incomes={incomes}
        onAddIncome={onAddIncome}
        onRemoveIncome={onRemoveIncome}
      />
    </section>
  );
}

export default IncomePage;

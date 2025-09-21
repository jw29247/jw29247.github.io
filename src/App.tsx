import { useMemo, useState } from 'react';
import { usePersistentState } from './hooks/usePersistentState';
import type { Expense, FinanceState, Income, WeddingBudgetItem, WeddingContribution } from './types';
import {
  generateSequentialMonths,
  monthsUntilWedding,
  projectedMonthlySavingsNeed,
  projectMonthlyTotalsWithRecurring,
  totalWeddingBudget,
  totalWeddingOutstanding,
  totalWeddingPaid,
  totalWeddingSavings,
} from './utils/finance';
import { createId } from './utils/id';
import DashboardPage from './pages/DashboardPage';
import IncomePage from './pages/IncomePage';
import ExpensesPage from './pages/ExpensesPage';
import WeddingPage from './pages/WeddingPage';
import './styles/app-shell.css';

type PageKey = 'dashboard' | 'income' | 'expenses' | 'wedding';

const monthFormatter = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit' });

const defaultState: FinanceState = {
  incomes: [],
  expenses: [],
  wedding: {
    targetAmount: 0,
    currentSavings: 0,
    targetDate: '2026-05-01',
    contributions: [],
    budgetItems: [],
  },
};

function useCurrentMonth() {
  const [value, setValue] = useState(() => monthFormatter.format(new Date()));
  return [value, setValue] as const;
}

export function App() {
  const [finance, setFinance] = usePersistentState<FinanceState>('griswold-finance-tracker', defaultState);
  const [activeMonth, setActiveMonth] = useCurrentMonth();
  const [activePage, setActivePage] = useState<PageKey>('dashboard');

  const projectionStartMonth = useMemo(() => monthFormatter.format(new Date()), []);
  const projectionMonths = useMemo(
    () => generateSequentialMonths(projectionStartMonth, 12),
    [projectionStartMonth],
  );

  const incomeTotalsByMonth = useMemo(
    () => projectMonthlyTotalsWithRecurring(finance.incomes, projectionMonths, (income) => income.type === 'Monthly Income'),
    [finance.incomes, projectionMonths],
  );

  const expenseTotalsByMonth = useMemo(
    () =>
      projectMonthlyTotalsWithRecurring(finance.expenses, projectionMonths, (expense) =>
        expense.recursMonthly === true,
      ),
    [finance.expenses, projectionMonths],
  );

  const monthlyNet = useMemo(() => {
    const net: Record<string, number> = {};
    projectionMonths.forEach((month) => {
      net[month] = (incomeTotalsByMonth[month] ?? 0) - (expenseTotalsByMonth[month] ?? 0);
    });
    return net;
  }, [incomeTotalsByMonth, expenseTotalsByMonth, projectionMonths]);

  const averageIncome = useMemo(() => {
    if (projectionMonths.length === 0) {
      return 0;
    }
    const total = projectionMonths.reduce((sum, month) => sum + (incomeTotalsByMonth[month] ?? 0), 0);
    return total / projectionMonths.length;
  }, [incomeTotalsByMonth, projectionMonths]);

  const averageExpenses = useMemo(() => {
    if (projectionMonths.length === 0) {
      return 0;
    }
    const total = projectionMonths.reduce((sum, month) => sum + (expenseTotalsByMonth[month] ?? 0), 0);
    return total / projectionMonths.length;
  }, [expenseTotalsByMonth, projectionMonths]);

  const averageNet = averageIncome - averageExpenses;

  const totalBudget = totalWeddingBudget(finance.wedding);
  const totalPaid = totalWeddingPaid(finance.wedding);
  const outstandingBalance = totalWeddingOutstanding(finance.wedding);
  const weddingSavings = totalWeddingSavings(finance.wedding);
  const monthsRemaining = monthsUntilWedding(finance.wedding);
  const monthlySavingsNeeded = projectedMonthlySavingsNeed(finance.wedding);
  const remainingAfterSavings = Math.max(outstandingBalance - weddingSavings, 0);

  const handleAddIncome = (income: Omit<Income, 'id'>) => {
    setFinance((previous) => ({
      ...previous,
      incomes: [...previous.incomes, { ...income, id: createId() }],
    }));
  };

  const handleRemoveIncome = (id: string) => {
    setFinance((previous) => ({
      ...previous,
      incomes: previous.incomes.filter((income) => income.id !== id),
    }));
  };

  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    setFinance((previous) => ({
      ...previous,
      expenses: [...previous.expenses, { ...expense, id: createId() }],
    }));
  };

  const handleRemoveExpense = (id: string) => {
    setFinance((previous) => ({
      ...previous,
      expenses: previous.expenses.filter((expense) => expense.id !== id),
    }));
  };

  const handleUpdateWedding = (updates: Partial<FinanceState['wedding']>) => {
    setFinance((previous) => ({
      ...previous,
      wedding: { ...previous.wedding, ...updates },
    }));
  };

  const handleAddContribution = (contribution: Omit<WeddingContribution, 'id'>) => {
    setFinance((previous) => ({
      ...previous,
      wedding: {
        ...previous.wedding,
        contributions: [...previous.wedding.contributions, { ...contribution, id: createId() }],
      },
    }));
  };

  const handleRemoveContribution = (id: string) => {
    setFinance((previous) => ({
      ...previous,
      wedding: {
        ...previous.wedding,
        contributions: previous.wedding.contributions.filter((item) => item.id !== id),
      },
    }));
  };

  const handleAddBudgetItem = (item: Omit<WeddingBudgetItem, 'id'>) => {
    setFinance((previous) => ({
      ...previous,
      wedding: {
        ...previous.wedding,
        budgetItems: [...(previous.wedding.budgetItems ?? []), { ...item, id: createId() }],
      },
    }));
  };

  const handleUpdateBudgetItem = (id: string, updates: Partial<WeddingBudgetItem>) => {
    setFinance((previous) => ({
      ...previous,
      wedding: {
        ...previous.wedding,
        budgetItems: (previous.wedding.budgetItems ?? []).map((item) =>
          item.id === id ? { ...item, ...updates } : item,
        ),
      },
    }));
  };

  const handleRemoveBudgetItem = (id: string) => {
    setFinance((previous) => ({
      ...previous,
      wedding: {
        ...previous.wedding,
        budgetItems: (previous.wedding.budgetItems ?? []).filter((item) => item.id !== id),
      },
    }));
  };

  const insights = {
    months: projectionMonths,
    incomeTotals: incomeTotalsByMonth,
    expenseTotals: expenseTotalsByMonth,
    netByMonth: monthlyNet,
    averageIncome,
    averageExpenses,
    averageNet,
    monthsRemaining,
    weddingSavings,
    monthlySavingsNeeded,
    totalBudget,
    totalPaid,
    outstandingBalance,
    remainingAfterSavings,
  };

  return (
    <div className="app-shell">
      <nav className="app-nav" aria-label="Primary navigation">
        <button
          type="button"
          className={`app-nav__item${activePage === 'dashboard' ? ' is-active' : ''}`}
          onClick={() => setActivePage('dashboard')}
        >
          Dashboard
        </button>
        <button
          type="button"
          className={`app-nav__item${activePage === 'income' ? ' is-active' : ''}`}
          onClick={() => setActivePage('income')}
        >
          Income
        </button>
        <button
          type="button"
          className={`app-nav__item${activePage === 'expenses' ? ' is-active' : ''}`}
          onClick={() => setActivePage('expenses')}
        >
          Expenses
        </button>
        <button
          type="button"
          className={`app-nav__item${activePage === 'wedding' ? ' is-active' : ''}`}
          onClick={() => setActivePage('wedding')}
        >
          Wedding
        </button>
      </nav>

      <main className="app-main">
        {activePage === 'dashboard' && <DashboardPage finance={finance} insights={insights} />}
        {activePage === 'income' && (
          <IncomePage
            month={activeMonth}
            onMonthChange={setActiveMonth}
            incomes={finance.incomes}
            onAddIncome={handleAddIncome}
            onRemoveIncome={handleRemoveIncome}
          />
        )}
        {activePage === 'expenses' && (
          <ExpensesPage
            month={activeMonth}
            onMonthChange={setActiveMonth}
            expenses={finance.expenses}
            onAddExpense={handleAddExpense}
            onRemoveExpense={handleRemoveExpense}
          />
        )}
        {activePage === 'wedding' && (
          <WeddingPage
            plan={finance.wedding}
            onPlanChange={handleUpdateWedding}
            onAddContribution={handleAddContribution}
            onRemoveContribution={handleRemoveContribution}
            onAddBudgetItem={handleAddBudgetItem}
            onUpdateBudgetItem={handleUpdateBudgetItem}
            onRemoveBudgetItem={handleRemoveBudgetItem}
          />
        )}
      </main>
    </div>
  );
}

export default App;

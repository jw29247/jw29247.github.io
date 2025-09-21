import { FormEvent, useMemo, useState } from 'react';
import { usePersistentState } from './hooks/usePersistentState';
import type { Expense, ExpenseCategory, FinanceState, Income, IncomeType, WeddingContribution } from './types';
import {
  calculateAverageMonthlyAmount,
  calculateMonthlyTotals,
  calculateNetByMonth,
  formatCurrency,
  formatMonthKey,
  monthsUntilWedding,
  sortMonthKeys,
  totalWeddingSavings,
  projectedMonthlySavingsNeed,
} from './utils/finance';
import { createId } from './utils/id';
import './styles/app.css';

const monthFormatter = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit' });

const defaultState: FinanceState = {
  incomes: [],
  expenses: [],
  wedding: {
    targetAmount: 0,
    currentSavings: 0,
    targetDate: '2026-05-01',
    contributions: [],
  },
};

function useCurrentMonth() {
  const [value, setValue] = useState(() => monthFormatter.format(new Date()));
  return [value, setValue] as const;
}

function App() {
  const [finance, setFinance] = usePersistentState<FinanceState>('griswold-finance-tracker', defaultState);
  const [activeMonth, setActiveMonth] = useCurrentMonth();

  const incomeTotalsByMonth = useMemo(
    () => calculateMonthlyTotals(finance.incomes),
    [finance.incomes],
  );

  const expenseTotalsByMonth = useMemo(
    () => calculateMonthlyTotals(finance.expenses),
    [finance.expenses],
  );

  const months = useMemo(() => {
    const monthKeys = new Set([
      ...finance.incomes.map((income) => income.month),
      ...finance.expenses.map((expense) => expense.month),
      activeMonth,
    ]);
    return sortMonthKeys(Array.from(monthKeys));
  }, [finance.incomes, finance.expenses, activeMonth]);

  const monthlyNet = useMemo(
    () => calculateNetByMonth(finance.incomes, finance.expenses),
    [finance.incomes, finance.expenses],
  );

  const averageIncome = useMemo(
    () => calculateAverageMonthlyAmount(finance.incomes),
    [finance.incomes],
  );
  const averageExpenses = useMemo(
    () => calculateAverageMonthlyAmount(finance.expenses),
    [finance.expenses],
  );
  const averageNet = averageIncome - averageExpenses;

  const weddingSavings = totalWeddingSavings(finance.wedding);
  const monthsRemaining = monthsUntilWedding(finance.wedding);
  const monthlySavingsNeeded = projectedMonthlySavingsNeed(finance.wedding);

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
        contributions: [
          ...previous.wedding.contributions,
          { ...contribution, id: createId() },
        ],
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

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Wedding &amp; Home Finance Planner</h1>
          <p>Keep sight of your wedding savings goal while managing everyday life.</p>
        </div>
        <div className="stat-row">
          <Statistic label="Wedding savings" value={formatCurrency(weddingSavings)} />
          <Statistic
            label="Remaining to target"
            value={formatCurrency(Math.max(finance.wedding.targetAmount - weddingSavings, 0))}
          />
          <Statistic label="Months remaining" value={monthsRemaining.toString()} />
          <Statistic label="Monthly savings needed" value={formatCurrency(monthlySavingsNeeded)} />
        </div>
      </header>

      <main className="grid-layout">
        <section className="card span-2">
          <WeddingPlanner
            plan={finance.wedding}
            onPlanChange={handleUpdateWedding}
            onAddContribution={handleAddContribution}
            onRemoveContribution={handleRemoveContribution}
          />
        </section>

        <section className="card">
          <IncomeManager
            month={activeMonth}
            onMonthChange={setActiveMonth}
            incomes={finance.incomes}
            onAddIncome={handleAddIncome}
            onRemoveIncome={handleRemoveIncome}
          />
        </section>

        <section className="card">
          <ExpenseManager
            month={activeMonth}
            onMonthChange={setActiveMonth}
            expenses={finance.expenses}
            onAddExpense={handleAddExpense}
            onRemoveExpense={handleRemoveExpense}
          />
        </section>

        <section className="card span-2">
          <MonthlyOutlook
            months={months}
            incomeTotals={incomeTotalsByMonth}
            expenseTotals={expenseTotalsByMonth}
            netByMonth={monthlyNet}
            averageIncome={averageIncome}
            averageExpenses={averageExpenses}
            averageNet={averageNet}
            monthlySavingsNeeded={monthlySavingsNeeded}
          />
        </section>
      </main>
    </div>
  );
}

interface StatisticProps {
  label: string;
  value: string;
}

function Statistic({ label, value }: StatisticProps) {
  return (
    <div className="statistic">
      <span className="statistic__label">{label}</span>
      <strong className="statistic__value">{value}</strong>
    </div>
  );
}

type WeddingPlannerProps = {
  plan: FinanceState['wedding'];
  onPlanChange: (updates: Partial<FinanceState['wedding']>) => void;
  onAddContribution: (contribution: Omit<WeddingContribution, 'id'>) => void;
  onRemoveContribution: (id: string) => void;
};

function WeddingPlanner({ plan, onPlanChange, onAddContribution, onRemoveContribution }: WeddingPlannerProps) {
  const [newContribution, setNewContribution] = useState({
    date: monthFormatter.format(new Date()) + '-01',
    amount: '',
    note: '',
  });

  const totalSaved = totalWeddingSavings(plan);
  const remaining = Math.max(plan.targetAmount - totalSaved, 0);

  const handleContributionSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number.parseFloat(newContribution.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    onAddContribution({
      date: newContribution.date,
      amount,
      note: newContribution.note.trim() || 'Wedding savings deposit',
    });

    setNewContribution({ ...newContribution, amount: '', note: '' });
  };

  return (
    <div className="stack gap-lg">
      <header className="card-header">
        <div>
          <h2>Wedding savings roadmap</h2>
          <p>
            Track how far you&apos;ve come and what&apos;s left to save before May 2026. Contributions are
            stored locally on your device.
          </p>
        </div>
      </header>

      <div className="grid-2">
        <label className="field">
          <span>Target wedding budget (£)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={plan.targetAmount || ''}
            onChange={(event) =>
              onPlanChange({ targetAmount: Number.parseFloat(event.target.value) || 0 })
            }
          />
        </label>
        <label className="field">
          <span>Current savings (£)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={plan.currentSavings || ''}
            onChange={(event) =>
              onPlanChange({ currentSavings: Number.parseFloat(event.target.value) || 0 })
            }
          />
        </label>
        <label className="field">
          <span>Wedding date</span>
          <input
            type="date"
            value={plan.targetDate}
            onChange={(event) => onPlanChange({ targetDate: event.target.value })}
          />
        </label>
        <div className="field readonly">
          <span>Remaining</span>
          <strong>{formatCurrency(remaining)}</strong>
        </div>
      </div>

      <div className="stack gap-md">
        <h3 className="section-title">Add contribution</h3>
        <form className="grid-3" onSubmit={handleContributionSubmit}>
          <label className="field">
            <span>Date</span>
            <input
              type="date"
              value={newContribution.date}
              onChange={(event) => setNewContribution((prev) => ({ ...prev, date: event.target.value }))}
              required
            />
          </label>
          <label className="field">
            <span>Amount (£)</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={newContribution.amount}
              onChange={(event) => setNewContribution((prev) => ({ ...prev, amount: event.target.value }))}
              required
            />
          </label>
          <label className="field">
            <span>Note</span>
            <input
              type="text"
              value={newContribution.note}
              onChange={(event) => setNewContribution((prev) => ({ ...prev, note: event.target.value }))}
              placeholder="Pay rise, bonus, etc."
            />
          </label>
          <div className="actions align-end">
            <button type="submit" className="button primary">
              Add contribution
            </button>
          </div>
        </form>

        <ContributionList contributions={plan.contributions} onRemove={onRemoveContribution} />
      </div>
    </div>
  );
}

type ContributionListProps = {
  contributions: WeddingContribution[];
  onRemove: (id: string) => void;
};

function ContributionList({ contributions, onRemove }: ContributionListProps) {
  if (contributions.length === 0) {
    return <p className="empty">No extra savings recorded yet.</p>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Amount</th>
          <th scope="col">Note</th>
          <th scope="col" className="actions-col">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {contributions.map((contribution) => (
          <tr key={contribution.id}>
            <td>{new Date(contribution.date).toLocaleDateString('en-GB')}</td>
            <td>{formatCurrency(contribution.amount)}</td>
            <td>{contribution.note}</td>
            <td className="actions-col">
              <button type="button" className="button subtle" onClick={() => onRemove(contribution.id)}>
                Remove
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type IncomeManagerProps = {
  month: string;
  onMonthChange: (month: string) => void;
  incomes: Income[];
  onAddIncome: (income: Omit<Income, 'id'>) => void;
  onRemoveIncome: (id: string) => void;
};

function IncomeManager({ month, onMonthChange, incomes, onAddIncome, onRemoveIncome }: IncomeManagerProps) {
  const [formState, setFormState] = useState({
    description: '',
    amount: '',
    type: 'Monthly Income' as IncomeType,
  });

  const filtered = useMemo(() => incomes.filter((income) => income.month === month), [incomes, month]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number.parseFloat(formState.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    onAddIncome({
      month,
      description: formState.description.trim() || 'Salary',
      amount,
      type: formState.type,
    });

    setFormState({ description: '', amount: '', type: formState.type });
  };

  return (
    <div className="stack gap-md">
      <header className="card-header">
        <div>
          <h2>Monthly income</h2>
          <p>Log salaries and bonuses so you can plan savings with confidence.</p>
        </div>
        <MonthSelector value={month} onChange={onMonthChange} />
      </header>

      <form className="stack gap-sm" onSubmit={handleSubmit}>
        <div className="grid-3">
          <label className="field">
            <span>Description</span>
            <input
              type="text"
              value={formState.description}
              onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Salary, bonus, etc."
            />
          </label>
          <label className="field">
            <span>Amount (£)</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={formState.amount}
              onChange={(event) => setFormState((prev) => ({ ...prev, amount: event.target.value }))}
              required
            />
          </label>
          <label className="field">
            <span>Type</span>
            <select
              value={formState.type}
              onChange={(event) => setFormState((prev) => ({ ...prev, type: event.target.value as IncomeType }))}
            >
              <option value="Monthly Income">Monthly Income</option>
              <option value="Bonus">One-off Bonus</option>
            </select>
          </label>
        </div>
        <div className="actions align-end">
          <button type="submit" className="button primary">
            Add income
          </button>
        </div>
      </form>

      <RecordTable
        emptyMessage="No income recorded for this month yet."
        records={filtered.map((income) => ({
          id: income.id,
          primary: income.description,
          secondary: income.type,
          amount: income.amount,
        }))}
        onRemove={onRemoveIncome}
      />
    </div>
  );
}

type ExpenseManagerProps = {
  month: string;
  onMonthChange: (month: string) => void;
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onRemoveExpense: (id: string) => void;
};

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Essentials',
  'Discretionary',
  'House (recurring)',
  'House (one-off)',
  'Wedding',
  'Other',
];

function ExpenseManager({ month, onMonthChange, expenses, onAddExpense, onRemoveExpense }: ExpenseManagerProps) {
  const [formState, setFormState] = useState({
    description: '',
    amount: '',
    category: 'Essentials' as ExpenseCategory,
  });

  const filtered = useMemo(
    () => expenses.filter((expense) => expense.month === month),
    [expenses, month],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number.parseFloat(formState.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    onAddExpense({
      month,
      description: formState.description.trim() || 'Expense',
      amount,
      category: formState.category,
    });

    setFormState({ description: '', amount: '', category: formState.category });
  };

  return (
    <div className="stack gap-md">
      <header className="card-header">
        <div>
          <h2>Household spending</h2>
          <p>Capture recurring costs and one-off renovations within the same income view.</p>
        </div>
        <MonthSelector value={month} onChange={onMonthChange} />
      </header>

      <form className="stack gap-sm" onSubmit={handleSubmit}>
        <div className="grid-3">
          <label className="field">
            <span>Description</span>
            <input
              type="text"
              value={formState.description}
              onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Mortgage, groceries, tradesperson, ..."
            />
          </label>
          <label className="field">
            <span>Amount (£)</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={formState.amount}
              onChange={(event) => setFormState((prev) => ({ ...prev, amount: event.target.value }))}
              required
            />
          </label>
          <label className="field">
            <span>Category</span>
            <select
              value={formState.category}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, category: event.target.value as ExpenseCategory }))
              }
            >
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="actions align-end">
          <button type="submit" className="button primary">
            Add expense
          </button>
        </div>
      </form>

      <RecordTable
        emptyMessage="No expenses recorded for this month yet."
        records={filtered.map((expense) => ({
          id: expense.id,
          primary: expense.description,
          secondary: expense.category,
          amount: expense.amount,
        }))}
        onRemove={onRemoveExpense}
      />
    </div>
  );
}

type RecordTableProps = {
  records: Array<{ id: string; primary: string; secondary: string; amount: number }>;
  onRemove: (id: string) => void;
  emptyMessage: string;
};

function RecordTable({ records, onRemove, emptyMessage }: RecordTableProps) {
  if (records.length === 0) {
    return <p className="empty">{emptyMessage}</p>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th scope="col">Description</th>
          <th scope="col">Category</th>
          <th scope="col">Amount</th>
          <th scope="col" className="actions-col">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {records.map((record) => (
          <tr key={record.id}>
            <td>{record.primary}</td>
            <td>{record.secondary}</td>
            <td>{formatCurrency(record.amount)}</td>
            <td className="actions-col">
              <button type="button" className="button subtle" onClick={() => onRemove(record.id)}>
                Remove
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type MonthSelectorProps = {
  value: string;
  onChange: (month: string) => void;
};

function MonthSelector({ value, onChange }: MonthSelectorProps) {
  return (
    <label className="field inline">
      <span>Select month</span>
      <input type="month" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

type MonthlyOutlookProps = {
  months: string[];
  incomeTotals: Record<string, number>;
  expenseTotals: Record<string, number>;
  netByMonth: Record<string, number>;
  averageIncome: number;
  averageExpenses: number;
  averageNet: number;
  monthlySavingsNeeded: number;
};

function MonthlyOutlook({
  months,
  incomeTotals,
  expenseTotals,
  netByMonth,
  averageIncome,
  averageExpenses,
  averageNet,
  monthlySavingsNeeded,
}: MonthlyOutlookProps) {
  return (
    <div className="stack gap-md">
      <header className="card-header">
        <div>
          <h2>Monthly outlook</h2>
          <p>Compare income, typical expenses, and net position across the months you track.</p>
        </div>
      </header>

      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Income</th>
            <th scope="col">Expenses</th>
            <th scope="col">Net</th>
          </tr>
        </thead>
        <tbody>
          {months.map((month) => (
            <tr key={month}>
              <td>{formatMonthKey(month)}</td>
              <td>{formatCurrency(incomeTotals[month] ?? 0)}</td>
              <td>{formatCurrency(expenseTotals[month] ?? 0)}</td>
              <td className={netByMonth[month] >= 0 ? 'positive' : 'negative'}>
                {formatCurrency(netByMonth[month] ?? 0)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Average</th>
            <td>{formatCurrency(averageIncome)}</td>
            <td>{formatCurrency(averageExpenses)}</td>
            <td className={averageNet >= 0 ? 'positive' : 'negative'}>{formatCurrency(averageNet)}</td>
          </tr>
        </tfoot>
      </table>

      <p className="footnote">
        Typical monthly surplus ({formatCurrency(averageNet)}) compared with the wedding saving target ({formatCurrency(monthlySavingsNeeded)})
        leaves you with {formatCurrency(averageNet - monthlySavingsNeeded)} after wedding savings each month. Adjust either spending or the target
        if this number drops below zero.
      </p>
    </div>
  );
}

export default App;

import { FormEvent, useMemo, useState } from 'react';
import type { Expense, ExpenseCategory } from '../../types';
import { formatCurrency } from '../../utils/finance';
import MonthSelector from '../shared/MonthSelector';
import './expense-manager.css';

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Essentials',
  'Discretionary',
  'House (one-off)',
  'House (recurring)',
  'Wedding',
  'Other',
];

type ExpenseManagerProps = {
  month: string;
  onMonthChange: (month: string) => void;
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onRemoveExpense: (id: string) => void;
};

export function ExpenseManager({ month, onMonthChange, expenses, onAddExpense, onRemoveExpense }: ExpenseManagerProps) {
  const [formState, setFormState] = useState({
    description: '',
    amount: '',
    category: EXPENSE_CATEGORIES[0] as ExpenseCategory,
    recursMonthly: false,
  });

  const filtered = useMemo(() => expenses.filter((expense) => expense.month === month), [expenses, month]);

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
      recursMonthly: formState.recursMonthly,
    });

    setFormState({ description: '', amount: '', category: formState.category, recursMonthly: formState.recursMonthly });
  };

  return (
    <div className="panel stack gap-lg">
      <header className="panel__header">
        <div>
          <h2>Household spending</h2>
          <p>Capture recurring costs and one-off renovations within the same income view.</p>
        </div>
        <MonthSelector value={month} onChange={onMonthChange} />
      </header>

      <form className="stack gap-md" onSubmit={handleSubmit}>
        <div className="form-grid">
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
          <label className="field inline">
            <input
              type="checkbox"
              checked={formState.recursMonthly}
              onChange={(event) => setFormState((prev) => ({ ...prev, recursMonthly: event.target.checked }))}
            />
            <span>Repeats monthly</span>
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
          secondary: expense.recursMonthly ? `${expense.category} · Monthly` : expense.category,
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

export default ExpenseManager;

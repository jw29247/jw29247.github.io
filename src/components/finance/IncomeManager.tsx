import { FormEvent, useMemo, useState } from 'react';
import type { Income, IncomeType } from '../../types';
import { formatCurrency } from '../../utils/finance';
import MonthSelector from '../shared/MonthSelector';
import './income-manager.css';

type IncomeManagerProps = {
  month: string;
  onMonthChange: (month: string) => void;
  incomes: Income[];
  onAddIncome: (income: Omit<Income, 'id'>) => void;
  onRemoveIncome: (id: string) => void;
};

export function IncomeManager({ month, onMonthChange, incomes, onAddIncome, onRemoveIncome }: IncomeManagerProps) {
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
    <div className="panel stack gap-lg">
      <header className="panel__header">
        <div>
          <h2>Monthly income</h2>
          <p>Log salaries and bonuses so you can plan savings with confidence.</p>
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
              <option value="Bonus">Bonus</option>
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
          <th scope="col">Type</th>
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

export default IncomeManager;

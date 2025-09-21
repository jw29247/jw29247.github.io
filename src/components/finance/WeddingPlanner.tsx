import { FormEvent, useMemo, useState } from 'react';
import type { FinanceState, WeddingBudgetItem, WeddingContribution } from '../../types';
import {
  formatCurrency,
  totalWeddingBudget,
  totalWeddingOutstanding,
  totalWeddingPaid,
  totalWeddingSavings,
} from '../../utils/finance';
import './wedding-planner.css';

type WeddingPlannerProps = {
  plan: FinanceState['wedding'];
  onPlanChange: (updates: Partial<FinanceState['wedding']>) => void;
  onAddContribution: (contribution: Omit<WeddingContribution, 'id'>) => void;
  onRemoveContribution: (id: string) => void;
  onAddBudgetItem: (item: Omit<WeddingBudgetItem, 'id'>) => void;
  onUpdateBudgetItem: (id: string, updates: Partial<WeddingBudgetItem>) => void;
  onRemoveBudgetItem: (id: string) => void;
};

const monthFormatter = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit' });

export function WeddingPlanner({
  plan,
  onPlanChange,
  onAddContribution,
  onRemoveContribution,
  onAddBudgetItem,
  onUpdateBudgetItem,
  onRemoveBudgetItem,
}: WeddingPlannerProps) {
  const [newContribution, setNewContribution] = useState({
    date: monthFormatter.format(new Date()) + '-01',
    amount: '',
    note: '',
  });
  const [newItem, setNewItem] = useState({
    description: '',
    quoted: '',
    paid: '',
  });

  const budgetItems = plan.budgetItems ?? [];

  const totalQuoted = useMemo(() => totalWeddingBudget(plan), [plan]);
  const totalPaid = useMemo(() => totalWeddingPaid(plan), [plan]);
  const outstanding = useMemo(() => totalWeddingOutstanding(plan), [plan]);
  const savingsAvailable = useMemo(() => totalWeddingSavings(plan), [plan]);
  const remainingAfterSavings = Math.max(outstanding - savingsAvailable, 0);

  const handleBudgetItemSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const quoted = Number.parseFloat(newItem.quoted);
    const paid = Number.parseFloat(newItem.paid || '0');
    if (!Number.isFinite(quoted) || quoted <= 0 || !Number.isFinite(paid) || paid < 0) {
      return;
    }

    onAddBudgetItem({
      description: newItem.description.trim() || 'Budget item',
      quoted,
      paid,
    });

    setNewItem({ description: '', quoted: '', paid: '' });
  };

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
    <div className="panel stack gap-lg">
      <header className="panel__header">
        <div>
          <h2>Wedding budget planner</h2>
          <p>Assemble vendor quotes, record payments, and track how much you still need to set aside.</p>
        </div>
      </header>

      <div className="budget-metrics">
        <Metric label="Budget total" value={formatCurrency(totalQuoted)} />
        <Metric label="Paid so far" value={formatCurrency(totalPaid)} />
        <Metric label="Outstanding" value={formatCurrency(outstanding)} tone="negative" />
        <Metric label="Savings available" value={formatCurrency(savingsAvailable)} tone="positive" />
        <Metric label="Still to save" value={formatCurrency(remainingAfterSavings)} tone={remainingAfterSavings === 0 ? 'positive' : 'negative'} />
      </div>

      <div className="grid-fields">
        <label className="field">
          <span>Current savings (£)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={plan.currentSavings || ''}
            onChange={(event) => onPlanChange({ currentSavings: Number.parseFloat(event.target.value) || 0 })}
          />
        </label>
        <label className="field">
          <span>Wedding date</span>
          <input type="date" value={plan.targetDate} onChange={(event) => onPlanChange({ targetDate: event.target.value })} />
        </label>
      </div>

      <div className="stack gap-md">
        <div className="section-header">
          <h3 className="section-title">Budget items</h3>
          <p className="section-subtitle">Capture supplier quotes and the payments you&apos;ve already made.</p>
        </div>
        <form className="grid-budget" onSubmit={handleBudgetItemSubmit}>
          <label className="field">
            <span>Item</span>
            <input
              type="text"
              value={newItem.description}
              onChange={(event) => setNewItem((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Venue, photographer, dress, ..."
              required
            />
          </label>
          <label className="field">
            <span>Quoted (£)</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={newItem.quoted}
              onChange={(event) => setNewItem((prev) => ({ ...prev, quoted: event.target.value }))}
              required
            />
          </label>
          <label className="field">
            <span>Paid (£)</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={newItem.paid}
              onChange={(event) => setNewItem((prev) => ({ ...prev, paid: event.target.value }))}
            />
          </label>
          <div className="actions align-end">
            <button type="submit" className="button primary">
              Add item
            </button>
          </div>
        </form>

        <BudgetItemList
          items={budgetItems}
          onUpdate={onUpdateBudgetItem}
          onRemove={onRemoveBudgetItem}
        />
      </div>

      <div className="stack gap-md">
        <div className="section-header">
          <h3 className="section-title">Track savings injections</h3>
          <p className="section-subtitle">Log deposits that feed your wedding fund. These stay on this device.</p>
        </div>
        <form className="grid-contribution" onSubmit={handleContributionSubmit}>
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

type BudgetItemListProps = {
  items: WeddingBudgetItem[];
  onUpdate: (id: string, updates: Partial<WeddingBudgetItem>) => void;
  onRemove: (id: string) => void;
};

function BudgetItemList({ items, onUpdate, onRemove }: BudgetItemListProps) {
  if (items.length === 0) {
    return <p className="empty">Add your first item to start building the budget.</p>;
  }

  const handleNumberChange = (id: string, field: 'quoted' | 'paid', value: string) => {
    const numeric = Number.parseFloat(value);
    onUpdate(id, { [field]: Number.isFinite(numeric) && numeric >= 0 ? numeric : 0 });
  };

  return (
    <table className="data-table budget-table">
      <thead>
        <tr>
          <th scope="col">Item</th>
          <th scope="col">Quoted</th>
          <th scope="col">Paid</th>
          <th scope="col">Outstanding</th>
          <th scope="col" className="actions-col">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const outstanding = Math.max((item.quoted ?? 0) - (item.paid ?? 0), 0);
          return (
            <tr key={item.id}>
              <td>
                <input
                  type="text"
                  value={item.description}
                  onChange={(event) => onUpdate(item.id, { description: event.target.value })}
                />
              </td>
              <td>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={item.quoted ?? 0}
                  onChange={(event) => handleNumberChange(item.id, 'quoted', event.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={item.paid ?? 0}
                  onChange={(event) => handleNumberChange(item.id, 'paid', event.target.value)}
                />
              </td>
              <td>{formatCurrency(outstanding)}</td>
              <td className="actions-col">
                <button type="button" className="button subtle" onClick={() => onRemove(item.id)}>
                  Remove
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

type MetricProps = {
  label: string;
  value: string;
  tone?: 'default' | 'positive' | 'negative';
};

function Metric({ label, value, tone = 'default' }: MetricProps) {
  return (
    <div className={`metric metric--${tone}`}>
      <span className="metric__label">{label}</span>
      <strong className="metric__value">{value}</strong>
    </div>
  );
}

export default WeddingPlanner;

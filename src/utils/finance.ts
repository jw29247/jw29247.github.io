import type { Expense, Income, WeddingPlan } from '../types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(value);
}

export function getDistinctMonths(records: Array<Income | Expense>): string[] {
  const monthSet = new Set(records.map((record) => record.month));
  return Array.from(monthSet).sort();
}

export function groupByMonth<T extends Income | Expense>(records: T[]): Record<string, T[]> {
  return records.reduce<Record<string, T[]>>((accumulator, record) => {
    if (!accumulator[record.month]) {
      accumulator[record.month] = [];
    }

    accumulator[record.month].push(record);
    return accumulator;
  }, {});
}

export function calculateMonthlyTotals(records: Array<Income | Expense>): Record<string, number> {
  return records.reduce<Record<string, number>>((totals, record) => {
    totals[record.month] = (totals[record.month] ?? 0) + record.amount;
    return totals;
  }, {});
}

export function calculateAverageMonthlyAmount(records: Array<Income | Expense>): number {
  if (records.length === 0) {
    return 0;
  }

  const totals = calculateMonthlyTotals(records);
  const months = Object.keys(totals).length;

  if (months === 0) {
    return 0;
  }

  const sum = Object.values(totals).reduce((total, monthTotal) => total + monthTotal, 0);
  return sum / months;
}

export function monthsUntilWedding(plan: WeddingPlan, referenceDate = new Date()): number {
  const target = new Date(plan.targetDate);
  if (Number.isNaN(target.getTime())) {
    return 0;
  }

  const ref = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const targetStart = new Date(target.getFullYear(), target.getMonth(), 1);

  const yearsDifference = targetStart.getFullYear() - ref.getFullYear();
  const monthsDifference = targetStart.getMonth() - ref.getMonth();
  const totalMonths = yearsDifference * 12 + monthsDifference + 1; // include current month
  return Math.max(totalMonths, 0);
}

export function totalWeddingSavings(plan: WeddingPlan): number {
  const contributionsTotal = plan.contributions.reduce(
    (total, contribution) => total + contribution.amount,
    0,
  );
  return plan.currentSavings + contributionsTotal;
}

export function projectedMonthlySavingsNeed(plan: WeddingPlan, referenceDate = new Date()): number {
  const totalSaved = totalWeddingSavings(plan);
  const remaining = Math.max(plan.targetAmount - totalSaved, 0);
  const monthsRemaining = monthsUntilWedding(plan, referenceDate);
  if (monthsRemaining <= 0) {
    return remaining;
  }

  return remaining / monthsRemaining;
}

export function calculateNetByMonth(incomes: Income[], expenses: Expense[]): Record<string, number> {
  const incomeTotals = calculateMonthlyTotals(incomes);
  const expenseTotals = calculateMonthlyTotals(expenses);
  const months = new Set([...Object.keys(incomeTotals), ...Object.keys(expenseTotals)]);

  const net: Record<string, number> = {};
  months.forEach((month) => {
    net[month] = (incomeTotals[month] ?? 0) - (expenseTotals[month] ?? 0);
  });
  return net;
}
export function formatMonthKey(month: string): string {
  const [yearString, monthString] = month.split('-');
  const year = Number.parseInt(yearString, 10);
  const monthIndex = Number.parseInt(monthString, 10);
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) {
    return month;
  }
  const date = new Date(year, monthIndex - 1);
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export function sortMonthKeys(months: string[]): string[] {
  return [...months].sort(
    (a, b) => new Date(`${a}-01`).getTime() - new Date(`${b}-01`).getTime(),
  );
}

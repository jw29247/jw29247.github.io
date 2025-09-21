import { describe, expect, it } from 'vitest';
import {
  calculateAverageMonthlyAmount,
  calculateNetByMonth,
  monthsUntilWedding,
  projectedMonthlySavingsNeed,
  totalWeddingSavings,
} from './finance';
import type { Expense, Income, WeddingPlan } from '../types';

describe('finance utilities', () => {
  it('computes average monthly totals for irregular entries', () => {
    const incomes: Income[] = [
      { id: '1', month: '2024-01', description: 'Salary', amount: 2000, type: 'Monthly Income' },
      { id: '2', month: '2024-01', description: 'Bonus', amount: 500, type: 'Bonus' },
      { id: '3', month: '2024-02', description: 'Salary', amount: 2000, type: 'Monthly Income' },
    ];

    expect(calculateAverageMonthlyAmount(incomes)).toBeCloseTo(2250, 4);
  });

  it('calculates monthly net values', () => {
    const incomes: Income[] = [
      { id: 'i1', month: '2024-03', description: 'Salary', amount: 3000, type: 'Monthly Income' },
    ];
    const expenses: Expense[] = [
      { id: 'e1', month: '2024-03', description: 'Mortgage', amount: 1200, category: 'House (recurring)' },
      { id: 'e2', month: '2024-03', description: 'Groceries', amount: 400, category: 'Essentials' },
    ];

    expect(calculateNetByMonth(incomes, expenses)).toEqual({ '2024-03': 1400 });
  });

  it('handles savings projections and totals', () => {
    const plan: WeddingPlan = {
      targetAmount: 20000,
      currentSavings: 5000,
      targetDate: '2026-05-01',
      contributions: [
        { id: 'c1', date: '2024-02-14', amount: 1200, note: 'Bonus' },
        { id: 'c2', date: '2024-04-10', amount: 800, note: 'Gift' },
      ],
    };

    expect(totalWeddingSavings(plan)).toBe(7000);
    expect(monthsUntilWedding(plan, new Date('2025-05-01'))).toBeGreaterThan(0);
    expect(projectedMonthlySavingsNeed(plan, new Date('2025-05-01'))).toBeGreaterThan(0);
  });
});

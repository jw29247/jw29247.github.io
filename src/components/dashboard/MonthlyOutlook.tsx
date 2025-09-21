import type { FC } from 'react';
import { formatCurrency, formatMonthKey } from '../../utils/finance';
import './monthly-outlook.css';

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

export const MonthlyOutlook: FC<MonthlyOutlookProps> = ({
  months,
  incomeTotals,
  expenseTotals,
  netByMonth,
  averageIncome,
  averageExpenses,
  averageNet,
  monthlySavingsNeeded,
}) => {
  return (
    <div className="panel stack gap-lg">
      <header className="panel__header">
        <div>
          <h2>12-month outlook</h2>
          <p>Projected income, spending, and net position for the next year, including recurring items.</p>
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

      <p className="monthly-outlook__note">
        Typical monthly surplus ({formatCurrency(averageNet)}) compared with the wedding saving target
        ({formatCurrency(monthlySavingsNeeded)}) leaves you with {formatCurrency(averageNet - monthlySavingsNeeded)}
        after wedding savings each month. Adjust recurring items if this number drops below zero.
      </p>
    </div>
  );
};

export default MonthlyOutlook;

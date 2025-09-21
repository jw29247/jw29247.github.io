import { formatCurrency } from '../../utils/finance';
import './income-expense-bars.css';

type IncomeExpenseBarsProps = {
  data: Array<{ month: string; label: string; income: number; expense: number }>;
};

export function IncomeExpenseBars({ data }: IncomeExpenseBarsProps) {
  if (data.length === 0) {
    return (
      <div className="panel stack gap-md">
        <header className="panel__header">
          <div>
            <h2>Income vs spending</h2>
            <p>See whether your spending footprint is creeping above your earnings.</p>
          </div>
        </header>
        <p className="empty">Add records to compare income and expenses.</p>
      </div>
    );
  }

  const trendData = data.slice(0, 6);
  const maxValue = Math.max(...trendData.flatMap((item) => [item.income, item.expense, 1]));

  return (
    <div className="panel stack gap-md">
      <header className="panel__header">
        <div>
          <h2>Income vs spending</h2>
          <p>The next six months, with income in indigo and outgoings in coral.</p>
        </div>
      </header>

      <div className="income-expense__chart" role="img" aria-label="Income and expenses by month">
        {trendData.map((item) => {
          const incomeHeight = (item.income / maxValue) * 100;
          const expenseHeight = (item.expense / maxValue) * 100;
          return (
            <div key={item.month} className="income-expense__column">
              <div className="income-expense__bars" aria-hidden="true">
                <span className="income-expense__bar income-expense__bar--income" style={{ height: `${incomeHeight}%` }} />
                <span className="income-expense__bar income-expense__bar--expense" style={{ height: `${expenseHeight}%` }} />
              </div>
              <span className="income-expense__label">{item.label}</span>
              <div className="income-expense__values">
                <span className="income">{formatCurrency(item.income)}</span>
                <span className="expense">{formatCurrency(item.expense)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default IncomeExpenseBars;

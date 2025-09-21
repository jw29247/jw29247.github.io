import type { FinanceState } from '../types';
import { formatCurrency, formatMonthKey } from '../utils/finance';
import StatisticCard from '../components/shared/StatisticCard';
import MonthlyOutlook from '../components/dashboard/MonthlyOutlook';
import NetTrendChart from '../components/dashboard/NetTrendChart';
import IncomeExpenseBars from '../components/dashboard/IncomeExpenseBars';
import WeddingProgressCard from '../components/dashboard/WeddingProgressCard';
import '../styles/ui.css';
import '../styles/dashboard-page.css';

type DashboardInsights = {
  months: string[];
  incomeTotals: Record<string, number>;
  expenseTotals: Record<string, number>;
  netByMonth: Record<string, number>;
  averageIncome: number;
  averageExpenses: number;
  averageNet: number;
  monthsRemaining: number;
  weddingSavings: number;
  monthlySavingsNeeded: number;
  totalBudget: number;
  totalPaid: number;
  outstandingBalance: number;
  remainingAfterSavings: number;
};

type DashboardPageProps = {
  finance: FinanceState;
  insights: DashboardInsights;
};

export function DashboardPage({ finance, insights }: DashboardPageProps) {
  const netTrendData = insights.months.map((month) => ({
    month,
    label: formatMonthKey(month),
    value: insights.netByMonth[month] ?? 0,
  }));

  const incomeExpenseData = insights.months.map((month) => ({
    month,
    label: formatMonthKey(month).split(' ').slice(0, 2).join(' '),
    income: insights.incomeTotals[month] ?? 0,
    expense: insights.expenseTotals[month] ?? 0,
  }));

  return (
    <section className="page dashboard">
      <header className="dashboard__header">
        <div>
          <h1>Wedding &amp; Home Finance Planner</h1>
          <p>Keep sight of your wedding savings goal while managing everyday life.</p>
        </div>
        <div className="stat-row">
          <StatisticCard label="Budget total" value={formatCurrency(insights.totalBudget)} />
          <StatisticCard label="Paid so far" value={formatCurrency(insights.totalPaid)} tone="positive" />
          <StatisticCard label="Outstanding balance" value={formatCurrency(insights.outstandingBalance)} tone="negative" />
          <StatisticCard
            label="Still to save"
            value={formatCurrency(insights.remainingAfterSavings)}
            tone={insights.remainingAfterSavings === 0 ? 'positive' : 'negative'}
          />
          <StatisticCard
            label="Monthly savings needed"
            value={formatCurrency(insights.monthlySavingsNeeded)}
            tone={insights.monthlySavingsNeeded <= insights.averageNet ? 'positive' : 'negative'}
          />
        </div>
      </header>

      <div className="dashboard__grid">
        <NetTrendChart data={netTrendData} monthlySavingsNeeded={insights.monthlySavingsNeeded} />
        <IncomeExpenseBars data={incomeExpenseData} />
        <WeddingProgressCard
          budgetTotal={insights.totalBudget}
          paidTotal={insights.totalPaid}
          savingsAvailable={insights.weddingSavings}
          outstandingBalance={insights.outstandingBalance}
          remainingAfterSavings={insights.remainingAfterSavings}
          monthsRemaining={insights.monthsRemaining}
          itemCount={(finance.wedding.budgetItems ?? []).length}
        />
        <div className="span-2">
          <MonthlyOutlook
            months={insights.months}
            incomeTotals={insights.incomeTotals}
            expenseTotals={insights.expenseTotals}
            netByMonth={insights.netByMonth}
            averageIncome={insights.averageIncome}
            averageExpenses={insights.averageExpenses}
            averageNet={insights.averageNet}
            monthlySavingsNeeded={insights.monthlySavingsNeeded}
          />
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;

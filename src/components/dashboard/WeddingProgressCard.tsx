import { formatCurrency } from '../../utils/finance';
import './wedding-progress-card.css';

type WeddingProgressCardProps = {
  budgetTotal: number;
  paidTotal: number;
  savingsAvailable: number;
  outstandingBalance: number;
  remainingAfterSavings: number;
  monthsRemaining: number;
  itemCount: number;
};

export function WeddingProgressCard({
  budgetTotal,
  paidTotal,
  savingsAvailable,
  outstandingBalance,
  remainingAfterSavings,
  monthsRemaining,
  itemCount,
}: WeddingProgressCardProps) {
  const coveredAmount = paidTotal + savingsAvailable;
  const progress = budgetTotal === 0 ? 0 : Math.min(coveredAmount / budgetTotal, 1);
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - progress * circumference;

  return (
    <div className="panel wedding-progress stack gap-md">
      <header className="panel__header">
        <div>
          <h2>Wedding funding coverage</h2>
          <p>How the combination of payments and savings compares to your total budget.</p>
        </div>
      </header>

      <div className="wedding-progress__body">
        <div
          className="wedding-progress__ring"
          role="img"
          aria-label={`Wedding budget ${Math.round(progress * 100)} percent covered`}
        >
          <svg viewBox="0 0 100 100">
            <defs>
              <linearGradient id="weddingProgressGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <circle className="wedding-progress__ring-track" cx="50" cy="50" r="42" />
            <circle
              className="wedding-progress__ring-indicator"
              cx="50"
              cy="50"
              r="42"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={offset}
              stroke="url(#weddingProgressGradient)"
            />
            <text x="50" y="52" textAnchor="middle" className="wedding-progress__percent">
              {Math.round(progress * 100)}%
            </text>
          </svg>
        </div>

        <dl className="wedding-progress__stats">
          <div>
            <dt>Budget items</dt>
            <dd>{itemCount}</dd>
          </div>
          <div>
            <dt>Paid so far</dt>
            <dd>{formatCurrency(paidTotal)}</dd>
          </div>
          <div>
            <dt>Savings available</dt>
            <dd>{formatCurrency(savingsAvailable)}</dd>
          </div>
          <div>
            <dt>Months remaining</dt>
            <dd>{monthsRemaining}</dd>
          </div>
          <div>
            <dt>Outstanding balance</dt>
            <dd>{formatCurrency(outstandingBalance)}</dd>
          </div>
          <div>
            <dt>Still to save</dt>
            <dd>{formatCurrency(remainingAfterSavings)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export default WeddingProgressCard;

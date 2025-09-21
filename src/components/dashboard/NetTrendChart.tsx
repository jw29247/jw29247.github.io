import { formatCurrency } from '../../utils/finance';
import './net-trend-chart.css';

type NetTrendChartProps = {
  data: Array<{ month: string; label: string; value: number }>;
  monthlySavingsNeeded: number;
};

export function NetTrendChart({ data, monthlySavingsNeeded }: NetTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="panel stack gap-md">
        <header className="panel__header">
          <div>
            <h2>Monthly net trend</h2>
            <p>Track whether you remain on course for the savings target.</p>
          </div>
        </header>
        <p className="empty">Add at least one month of income and expenses to see the trend.</p>
      </div>
    );
  }

  const values = data.map((item) => item.value);
  let max = Math.max(...values, 0);
  let min = Math.min(...values, 0);

  if (max === min) {
    const adjustment = Math.abs(max || 1) * 0.2;
    max += adjustment;
    min -= adjustment;
  }

  const range = max - min || 1;

  const points = data.map((item, index) => {
    const x = data.length === 1 ? 0 : (index / (data.length - 1)) * 100;
    const y = ((max - item.value) / range) * 100;
    return { ...item, x, y };
  });

  const lineD = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)},${point.y.toFixed(2)}`)
    .join(' ');

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1] ?? firstPoint;

  const areaPath = `M ${firstPoint?.x.toFixed(2) ?? 0},${firstPoint?.y.toFixed(2) ?? 100} ${points
    .slice(1)
    .map((point) => `L ${point.x.toFixed(2)},${point.y.toFixed(2)}`)
    .join(' ')} L ${lastPoint?.x.toFixed(2) ?? 100},100 L ${firstPoint?.x.toFixed(2) ?? 0},100 Z`;

  const zeroY = Math.min(Math.max(((max - 0) / range) * 100, 0), 100);
  const showZeroLine = min <= 0 && max >= 0;
  const latest = data[data.length - 1]!;

  return (
    <div className="panel stack gap-md">
      <header className="panel__header">
        <div>
          <h2>Monthly net trend</h2>
          <p>Projected surplus for the coming year versus the wedding savings need.</p>
        </div>
        <div className="net-trend__pill">
          <span>Latest month</span>
          <strong>{formatCurrency(latest.value)}</strong>
        </div>
      </header>

      <div className="net-trend__chart">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Monthly net income trend">
          <defs>
            <linearGradient id="netTrendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(79, 70, 229, 0.45)" />
              <stop offset="100%" stopColor="rgba(79, 70, 229, 0.05)" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#netTrendFill)" stroke="none" />
          <path d={lineD} fill="none" stroke="#4f46e5" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
          {showZeroLine && (
            <line
              x1="0"
              y1={zeroY}
              x2="100"
              y2={zeroY}
              stroke="rgba(148, 163, 184, 0.6)"
              strokeDasharray="4 4"
              strokeWidth={0.8}
            />
          )}
          {points.map((point) => (
            <circle key={point.month} cx={point.x} cy={point.y} r={1.5} fill="#312e81" />
          ))}
        </svg>
      </div>

      <ul className="net-trend__legend">
        {points.map((point) => (
          <li key={point.month}>
            <span className="net-trend__legend-label">{point.label}</span>
            <strong className={`net-trend__legend-value ${point.value >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(point.value)}
            </strong>
          </li>
        ))}
      </ul>

      <div className="net-trend__summary">
        <p>
          You need {formatCurrency(monthlySavingsNeeded)} each month for the wedding. This chart helps confirm
          whether your surplus consistently clears that figure.
        </p>
      </div>
    </div>
  );
}

export default NetTrendChart;

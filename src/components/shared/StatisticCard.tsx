type StatisticCardProps = {
  label: string;
  value: string;
  tone?: 'default' | 'positive' | 'negative';
};

export function StatisticCard({ label, value, tone = 'default' }: StatisticCardProps) {
  return (
    <div className={`statistic statistic--${tone}`}>
      <span className="statistic__label">{label}</span>
      <strong className="statistic__value">{value}</strong>
    </div>
  );
}

export default StatisticCard;

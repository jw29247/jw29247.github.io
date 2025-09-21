import type { ChangeEventHandler } from 'react';
import './month-selector.css';

type MonthSelectorProps = {
  value: string;
  onChange: (month: string) => void;
  label?: string;
};

export function MonthSelector({ value, onChange, label = 'Select month' }: MonthSelectorProps) {
  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange(event.target.value);
  };

  return (
    <label className="field inline month-selector">
      <span>{label}</span>
      <input type="month" value={value} onChange={handleChange} />
    </label>
  );
}

export default MonthSelector;

import { useEffect, useState } from 'react';

export function usePersistentState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }

    const storedValue = window.localStorage.getItem(key);
    if (!storedValue) {
      return defaultValue;
    }

    try {
      return JSON.parse(storedValue) as T;
    } catch (error) {
      console.error('Failed to parse stored value', error);
      return defaultValue;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

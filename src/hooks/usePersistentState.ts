import { useEffect, useState } from 'react';

/** useState synchronisé avec localStorage — l'état survit au rechargement. */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota dépassé : on ignore */
    }
  }, [key, value]);

  return [value, setValue] as const;
}

import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item) as T);
      }
    } catch {
      // Ignore parse failures and use initial value.
    } finally {
      setHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (typeof window === 'undefined' || !hydrated) {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // Ignore quota and serialization failures.
    }
  }, [hydrated, key, storedValue]);

  return [storedValue, setStoredValue];
}

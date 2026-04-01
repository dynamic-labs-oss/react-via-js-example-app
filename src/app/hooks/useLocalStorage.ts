import { useCallback, useEffect, useState } from 'react';

const getFromLocalStorage = <T>(key: string, defaultValue: T) => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(
      `[react-demo] Error reading localStorage key "${key}":`,
      error
    );
    return defaultValue;
  }
};

const setToLocalStorage = <T>(key: string, value: T) => {
  try {
    // Save to localStorage
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(
      `[react-demo] Error setting localStorage key "${key}":`,
      error
    );
  }
};

/**
 * A custom hook for managing localStorage with React state synchronization
 * @param key - The localStorage key
 * @param initialValue - The initial value if no value exists in localStorage
 * @returns A tuple with the current value and a setter function
 */
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  // Get value from localStorage or use initial value
  const [stateValue, setStateValue] = useState<T>(() =>
    getFromLocalStorage(key, initialValue)
  );

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      // Allow value to be a function so we have the same API as useState
      if (value instanceof Function) {
        setStateValue((storedValue) => {
          const newValue = value(storedValue);

          setToLocalStorage(key, newValue);

          return newValue;
        });

        return;
      }

      // Save state
      setStateValue(value);

      setToLocalStorage(key, value);
    },
    [key]
  );

  // Listen for changes to this localStorage key from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStateValue(JSON.parse(e.newValue));
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn(
            `[react-demo] [handleStorageChange] Error parsing localStorage value for key "${key}":`,
            error
          );
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [stateValue, setValue] as const;
};

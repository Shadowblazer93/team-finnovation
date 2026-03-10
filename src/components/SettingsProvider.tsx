'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type SettingsContextValue = {
  defaultCurrency: string;
  setDefaultCurrency: (currency: string) => void;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const STORAGE_KEY = 'wwh-default-currency';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [defaultCurrency, setDefaultCurrencyState] = useState('USD');

  useEffect(() => {
    const storedCurrency = window.localStorage.getItem(STORAGE_KEY);
    if (storedCurrency) {
      setDefaultCurrencyState(storedCurrency);
    }
  }, []);

  const setDefaultCurrency = (currency: string) => {
    setDefaultCurrencyState(currency);
    window.localStorage.setItem(STORAGE_KEY, currency);
  };

  const value = useMemo(
    () => ({ defaultCurrency, setDefaultCurrency }),
    [defaultCurrency]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}

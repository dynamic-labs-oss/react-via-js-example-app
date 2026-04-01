import { createStore, useStore } from 'zustand';

type LedgerModeStore = {
  ledgerMode: boolean;
};

export const LEDGER_MODE_KEY = 'ledger-mode';

export const ledgerModeStore = createStore<LedgerModeStore>(() => ({
  ledgerMode: localStorage.getItem(LEDGER_MODE_KEY) === 'true',
}));

export const isLedgerMode = () => {
  return ledgerModeStore.getState().ledgerMode;
};

export const setLedgerMode = (value: boolean) => {
  ledgerModeStore.setState({ ledgerMode: value });

  localStorage.setItem(LEDGER_MODE_KEY, value.toString());
};

export const useLedgerMode = () =>
  useStore(ledgerModeStore, (state) => state.ledgerMode);

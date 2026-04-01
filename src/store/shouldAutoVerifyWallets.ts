import { createStore, useStore } from 'zustand';

type ShouldAutoVerifyWalletsStore = {
  shouldAutoVerifyWallets: boolean;
};

export const AUTO_VERIFY_WALLETS_KEY = 'auto-verify-wallets';

export const shouldAutoVerifyWalletsStore =
  createStore<ShouldAutoVerifyWalletsStore>(() => ({
    shouldAutoVerifyWallets:
      localStorage.getItem(AUTO_VERIFY_WALLETS_KEY) === 'true',
  }));

export const shouldAutoVerifyWallets = () => {
  return shouldAutoVerifyWalletsStore.getState().shouldAutoVerifyWallets;
};

export const setShouldAutoVerifyWallets = (value: boolean) => {
  shouldAutoVerifyWalletsStore.setState({ shouldAutoVerifyWallets: value });

  localStorage.setItem(AUTO_VERIFY_WALLETS_KEY, value.toString());
};

export const useShouldAutoVerifyWallets = () =>
  useStore(
    shouldAutoVerifyWalletsStore,
    (state) => state.shouldAutoVerifyWallets
  );

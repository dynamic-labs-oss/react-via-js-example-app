import { getWalletAccounts } from '@dynamic-labs-sdk/client';

import { useClientState } from './useClientState';

export const useWalletAccounts = () =>
  useClientState('walletAccountsChanged', (client) =>
    getWalletAccounts(client)
  );

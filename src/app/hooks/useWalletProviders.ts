import { getAvailableWalletProvidersData } from '@dynamic-labs-sdk/client';

import { useClientState } from './useClientState';

export const useWalletProviders = () =>
  useClientState('walletProviderChanged', (client) =>
    getAvailableWalletProvidersData(client)
  );

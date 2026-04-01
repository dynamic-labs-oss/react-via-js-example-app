import {
  type WalletAccount,
  getActiveNetworkData,
} from '@dynamic-labs-sdk/client';
import { useQuery } from '@tanstack/react-query';

import { useClientEvent } from './useClientEvent';

export const useActiveNetworkData = (walletAccount: WalletAccount) => {
  const { data, refetch, error, isLoading } = useQuery({
    queryFn: () => getActiveNetworkData({ walletAccount }),
    queryKey: ['networkData', walletAccount.id],
  });

  useClientEvent({
    event: 'walletProviderChanged',
    listener: ({ walletProviderKey }) => {
      if (walletProviderKey === walletAccount.walletProviderKey) {
        void refetch();
      }
    },
  });

  return {
    activeNetworkData: data?.networkData,
    error,
    isLoading,
    refetch,
  };
};

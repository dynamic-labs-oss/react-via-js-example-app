import { type WalletAccount, getBalance } from '@dynamic-labs-sdk/client';
import { useQuery } from '@tanstack/react-query';

import { useClientEvent } from './useClientEvent';

export const useBalance = (walletAccount: WalletAccount) => {
  const { data, refetch, error, isLoading } = useQuery({
    queryFn: () => getBalance({ walletAccount }),
    queryKey: ['balance', walletAccount.id],
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
    balance: data?.balance,
    error,
    isLoading,
    refetch,
  };
};

import { getWalletProviderDataByKey } from '@dynamic-labs-sdk/client';
import { useQuery } from '@tanstack/react-query';

import { useClientEvent } from './useClientEvent';

export const useWalletProviderDataByKey = (key: string) => {
  const { data, refetch, error, isLoading } = useQuery({
    queryFn: () => getWalletProviderDataByKey({ walletProviderKey: key }),
    queryKey: ['walletProviderData', key],
  });

  useClientEvent({
    event: 'walletProviderChanged',
    listener: ({ walletProviderKey }) => {
      if (walletProviderKey === key) {
        void refetch();
      }
    },
  });

  return {
    error,
    isLoading,
    refetch,
    walletProviderData: data,
  };
};

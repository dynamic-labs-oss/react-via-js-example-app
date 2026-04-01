import { getNetworksData } from '@dynamic-labs-sdk/client';
import { useQuery } from '@tanstack/react-query';

import { useClientEvent } from './useClientEvent';

export const useNetworksData = () => {
  const { data, refetch, error, isLoading } = useQuery({
    queryFn: () => getNetworksData(),
    queryKey: ['networksData'],
  });

  useClientEvent({
    event: 'walletProviderChanged',
    listener: () => {
      void refetch();
    },
  });

  return {
    error,
    isLoading,
    networksData: data ?? [],
    refetch,
  };
};

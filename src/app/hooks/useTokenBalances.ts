import {
  type WalletAccount,
  getActiveNetworkData,
  getMultichainBalances,
} from '@dynamic-labs-sdk/client';
import { useQuery } from '@tanstack/react-query';

export const useTokenBalances = (walletAccount: WalletAccount) => {
  const { data, refetch, error, isLoading } = useQuery({
    queryFn: async () => {
      const networkData = await getActiveNetworkData({ walletAccount });
      const networkId = networkData?.networkData?.networkId;

      if (!networkId) return [];

      const chainBalances = await getMultichainBalances({
        balanceRequest: {
          balanceRequests: [
            {
              address: walletAccount.address,
              chain: walletAccount.chain,
              networkIds: [Number(networkId)],
            },
          ],
          filterSpamTokens: false,
        },
      });

      const network = chainBalances
        ?.flatMap((cb) => cb.networks ?? [])
        .find((n) => String(n.networkId) === networkId);

      return network?.balances ?? [];
    },
    queryKey: ['tokenBalances', walletAccount.id],
  });

  return {
    error,
    isLoading,
    refetch,
    tokenBalances: data ?? [],
  };
};

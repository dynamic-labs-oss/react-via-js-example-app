import type { NetworkData } from '@dynamic-labs-sdk/client';
import { createPublicClientFromNetworkData } from '@dynamic-labs-sdk/evm/viem';
import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { type Hex, formatEther } from 'viem';

interface DisplayBalanceWithPublicClientProps {
  address: string;
  networkData: NetworkData;
}

export const DisplayBalanceWithPublicClient: FC<
  DisplayBalanceWithPublicClientProps
> = ({ address, networkData }) => {
  const publicClient = createPublicClientFromNetworkData({
    networkData,
  });

  const { data: balance } = useQuery({
    queryFn: () =>
      publicClient.getBalance({
        address: address as Hex,
      }),
    queryKey: [
      'networks',
      networkData.networkId,
      'addresses',
      address,
      'viem',
      'balance',
    ],
  });

  return (
    <span className="text-xs font-medium text-foreground tabular-nums">
      {balance === undefined && (
        <span className="text-muted-foreground">...</span>
      )}
      {balance !== undefined && (
        <span className="flex flex-row gap-1.5 items-center">
          <img
            src="https://viem.sh/icon-light.png"
            className="w-3.5 h-3.5 border border-border/50 rounded-full"
            alt="Viem"
          />
          {formatEther(balance)} {networkData.nativeCurrency.symbol}
        </span>
      )}
    </span>
  );
};

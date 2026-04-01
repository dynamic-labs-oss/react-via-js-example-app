import {
  type NetworkData,
  getBalanceForAddress,
} from '@dynamic-labs-sdk/client';
import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';

interface DisplayBalanceProps {
  address: string;
  networkData: NetworkData;
}

export const DisplayBalance: FC<DisplayBalanceProps> = ({
  address,
  networkData,
}) => {
  const { data: { balance } = { balance: null } } = useQuery({
    queryFn: () =>
      getBalanceForAddress({
        address,
        chain: networkData.chain,
        networkId: networkData.networkId,
      }),
    queryKey: [
      'networks',
      networkData.networkId,
      'addresses',
      address,
      'balance',
    ],
  });

  return (
    <span className="text-xs font-medium text-foreground tabular-nums">
      {balance === undefined && (
        <span className="text-muted-foreground">...</span>
      )}
      {balance === null && <span className="text-muted-foreground">--</span>}
      {balance && (
        <span className="flex flex-row gap-1.5 items-center">
          <img
            src={networkData.nativeCurrency.iconUrl}
            className="w-3.5 h-3.5 rounded-full"
            alt={networkData.nativeCurrency.symbol}
          />
          {balance} {networkData.nativeCurrency.symbol}
        </span>
      )}
    </span>
  );
};

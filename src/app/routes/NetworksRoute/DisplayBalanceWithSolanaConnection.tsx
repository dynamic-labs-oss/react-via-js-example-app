import type { NetworkData } from '@dynamic-labs-sdk/client';
import { getSolanaConnection } from '@dynamic-labs-sdk/solana';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';

interface DisplayBalanceWithSolanaConnectionProps {
  address: string;
  networkData: NetworkData;
}

export const DisplayBalanceWithSolanaConnection: FC<
  DisplayBalanceWithSolanaConnectionProps
> = ({ address, networkData }) => {
  const connection = getSolanaConnection({
    networkData,
  });

  const { data: balance } = useQuery({
    queryFn: () => connection.getBalance(new PublicKey(address)),
    queryKey: [
      'networks',
      networkData.networkId,
      'addresses',
      address,
      'solana',
      'connection',
      'balance',
    ],
  });

  return (
    <span className="text-xs font-medium text-foreground tabular-nums">
      <span className="flex flex-row gap-1.5 items-center">
        <img
          src="https://solana.com/favicon.ico"
          className="w-3.5 h-3.5 border border-border/50 rounded-full"
          alt="Solana"
        />
        {balance === undefined ? (
          <span className="text-muted-foreground">...</span>
        ) : (
          `${balance} ${networkData.nativeCurrency.symbol}`
        )}
      </span>
    </span>
  );
};

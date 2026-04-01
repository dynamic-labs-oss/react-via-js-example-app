import type { NetworkData } from '@dynamic-labs-sdk/client';
import type { FC } from 'react';

import { DisplayBalance } from './DisplayBalance';
import { DisplayBalanceWithPublicClient } from './DisplayBalanceWithPublicClient';
import { DisplayBalanceWithSolanaConnection } from './DisplayBalanceWithSolanaConnection';

interface NetworkItemProps {
  address?: string;
  networkData: NetworkData;
}

export const NetworkItem: FC<NetworkItemProps> = ({ networkData, address }) => {
  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-muted/30 transition-colors">
      <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-black/[0.06]">
        <img
          src={networkData.iconUrl}
          alt={networkData.displayName}
          className="w-full h-full object-cover"
        />
      </div>

      <p className="text-sm font-medium text-foreground truncate flex-1 min-w-0">
        {networkData.displayName}
      </p>

      {address && (
        <div className="flex items-center gap-3 flex-shrink-0">
          <DisplayBalance address={address} networkData={networkData} />

          {networkData.chain === 'EVM' && (
            <DisplayBalanceWithPublicClient
              address={address}
              networkData={networkData}
            />
          )}

          {networkData.chain === 'SOL' && (
            <DisplayBalanceWithSolanaConnection
              address={address}
              networkData={networkData}
            />
          )}
        </div>
      )}
    </div>
  );
};

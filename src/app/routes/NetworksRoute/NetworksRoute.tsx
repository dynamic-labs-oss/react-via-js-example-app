import type { NetworkData } from '@dynamic-labs-sdk/client';
import { Globe } from 'lucide-react';
import type { FC } from 'react';

import { useNetworksData } from '../../hooks/useNetworksData';
import { ChainSection } from './ChainSection';

export const NetworksRoute: FC = () => {
  const { networksData } = useNetworksData();

  const groupedNetworksData = networksData.reduce((acc, networkData) => {
    acc[networkData.chain] = acc[networkData.chain] || [];
    acc[networkData.chain].push(networkData);
    return acc;
  }, {} as Record<string, NetworkData[]>);

  const totalNetworks = networksData.length;

  return (
    <div className="min-h-screen bg-page mt-16 md:mt-0">
      <div className="max-w-[720px] mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-6 sm:pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            Networks
          </h1>
          {totalNetworks > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalNetworks} available network{totalNetworks !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Networks by chain */}
        <div className="flex flex-col gap-5">
          {Object.keys(groupedNetworksData).map((chain) => (
            <ChainSection
              key={chain}
              networksData={groupedNetworksData[chain]}
            />
          ))}
        </div>

        {/* Empty State */}
        {Object.keys(groupedNetworksData).length === 0 && (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-border/60 shadow-sm flex items-center justify-center">
              <Globe className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-foreground">
                No networks available
              </p>
              <p className="text-[13px] text-muted-foreground mt-1 max-w-[280px]">
                Networks will appear here once they are configured.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import {
  type NetworkData,
  type WalletAccount,
  switchActiveNetwork,
} from '@dynamic-labs-sdk/client';
import type { FC } from 'react';
import { useMemo } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { useActiveNetworkData } from '../../../hooks/useActiveNetworkData';
import { useNetworksData } from '../../../hooks/useNetworksData';

type NetworkSwitcherProps = {
  hideTestnets?: boolean;
  onNetworkUpdated?: (activeNetwork: NetworkData) => void;
  variant?: 'compact' | 'full';
  walletAccount: WalletAccount;
};

export const NetworkSwitcher: FC<NetworkSwitcherProps> = ({
  walletAccount,
  onNetworkUpdated,
  hideTestnets = false,
  variant = 'compact',
}) => {
  const { activeNetworkData, refetch: refetchActiveNetworkData } =
    useActiveNetworkData(walletAccount);

  const { networksData } = useNetworksData();

  const walletAvailableNetworks = useMemo(
    () =>
      networksData.filter(
        (network) =>
          network.chain === walletAccount.chain &&
          (!hideTestnets || !network.testnet)
      ),
    [networksData, walletAccount.chain]
  );

  const handleSwitchNetwork = async (networkId: string) => {
    await switchActiveNetwork({ networkId, walletAccount });
    const { data } = await refetchActiveNetworkData();

    if (data?.networkData) {
      onNetworkUpdated?.(data.networkData);
    }
  };

  if (walletAvailableNetworks.length === 0) {
    return null;
  }

  if (variant === 'full') {
    return (
      <Select
        value={activeNetworkData?.networkId ?? ''}
        onValueChange={handleSwitchNetwork}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select network">
            {activeNetworkData && (
              <span className="flex items-center gap-2">
                {activeNetworkData.iconUrl && (
                  <img
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    src={activeNetworkData.iconUrl}
                    alt={activeNetworkData.displayName}
                  />
                )}
                <span className="font-medium">
                  {activeNetworkData.displayName}
                </span>
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {walletAvailableNetworks.map((network) => (
            <SelectItem key={network.networkId} value={network.networkId}>
              <span className="flex items-center gap-2">
                {network.iconUrl && (
                  <img
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    src={network.iconUrl}
                    alt={network.displayName}
                  />
                )}
                <span className="font-medium">{network.displayName}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <>
      <div className="flex items-center gap-1">
        {activeNetworkData && (
          <img
            className="w-3.5 h-3.5 rounded-full"
            src={activeNetworkData.iconUrl}
            alt={activeNetworkData.displayName}
          />
        )}
        <Select
          value={activeNetworkData?.networkId ?? ''}
          onValueChange={handleSwitchNetwork}
        >
          <SelectTrigger
            size="sm"
            className="h-5 text-[11px] border-0 shadow-none bg-transparent px-0.5 gap-0.5 w-auto text-muted-foreground"
          >
            <SelectValue placeholder="Select network" />
          </SelectTrigger>
          <SelectContent>
            {walletAvailableNetworks.map((network) => (
              <SelectItem key={network.networkId} value={network.networkId}>
                {network.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

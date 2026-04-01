import type { WalletProviderData } from '@dynamic-labs-sdk/client';
import { type FC, useMemo, useState } from 'react';

import { WalletProviderButton } from '../../components/wallets/WalletProviderButton';
import { getChainIcon } from '../../functions/getChainIcon';

type WalletListProps = {
  onClick: (walletProvider: WalletProviderData) => void;
  onMultiChainProviderClick?: (providerKey: string) => void;
  walletProviders: WalletProviderData[];
};

export const WalletList: FC<WalletListProps> = ({
  onClick,
  onMultiChainProviderClick,
  walletProviders,
}) => {
  const [selectedProviderGroup, setSelectedProviderGroup] = useState<string>();

  const walletProvidersGroups: Record<string, WalletProviderData[]> =
    useMemo(() => {
      return walletProviders.reduce((acc, walletProvider) => {
        const group = walletProvider.groupKey;
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push(walletProvider);
        return acc;
      }, {} as Record<string, WalletProviderData[]>);
    }, [walletProviders]);

  const onWalletProviderClick = (groupKey: string) => {
    if (walletProvidersGroups[groupKey].length === 1) {
      onClick(walletProvidersGroups[groupKey][0]);
      return;
    }

    if (onMultiChainProviderClick) {
      onMultiChainProviderClick(groupKey);
      return;
    }

    setSelectedProviderGroup(groupKey);
  };

  const onWalletProviderChainClick = (walletProvider: WalletProviderData) => {
    setSelectedProviderGroup(undefined);
    onClick(walletProvider);
  };

  if (selectedProviderGroup) {
    return (
      <div className="flex flex-col gap-2">
        {walletProvidersGroups[selectedProviderGroup].map((walletProvider) => (
          <WalletProviderButton
            groupKey={walletProvider.groupKey}
            chain={walletProvider.chain}
            key={walletProvider.key}
            IconComponent={getChainIcon(walletProvider.chain)}
            displayName={walletProvider.chain}
            onClick={() => onWalletProviderChainClick(walletProvider)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {Object.entries(walletProvidersGroups)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([groupKey, walletProviders]) => (
          <WalletProviderButton
            key={groupKey}
            groupKey={groupKey}
            iconSrc={walletProviders[0].metadata.icon}
            displayName={walletProviders[0].metadata.displayName}
            onClick={() => onWalletProviderClick(groupKey)}
            chainIcons={walletProviders.map((walletProvider) => {
              const Icon = getChainIcon(walletProvider.chain);
              return {
                component: Icon,
                key: walletProvider.key,
              };
            })}
          />
        ))}
    </div>
  );
};

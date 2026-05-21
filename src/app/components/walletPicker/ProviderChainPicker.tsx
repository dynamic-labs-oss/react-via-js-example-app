import type { WalletProviderData } from '@dynamic-labs-sdk/client';
import type { FC } from 'react';

import { getChainIcon } from '../../functions/getChainIcon';
import { WalletProviderButton } from '../wallets/WalletProviderButton';
import type { WalletProviderEntry } from './CombinedWalletList.types';

type ProviderChainPickerProps = {
  entry: WalletProviderEntry;
  onClick: (provider: WalletProviderData) => void;
};

/**
 * Chain selection subview for a multi-chain SDK provider (installed or
 * not). Each chain in the group's `providers` list becomes a button.
 */
export const ProviderChainPicker: FC<ProviderChainPickerProps> = ({
  entry,
  onClick,
}) => (
  <div className="flex flex-col gap-2">
    {entry.providers.map((provider) => (
      <WalletProviderButton
        chain={provider.chain}
        displayName={provider.chain}
        groupKey={provider.groupKey}
        IconComponent={getChainIcon(provider.chain)}
        key={provider.key}
        onClick={() => onClick(provider)}
      />
    ))}
  </div>
);

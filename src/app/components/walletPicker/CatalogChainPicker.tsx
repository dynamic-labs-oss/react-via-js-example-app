import type { WalletConnectCatalogWallet } from '@dynamic-labs-sdk/client';
import type { FC } from 'react';

import { getChainIcon } from '../../functions/getChainIcon';
import { WalletProviderButton } from '../wallets/WalletProviderButton';
import type { CatalogListEntry } from './CombinedWalletList.types';

type CatalogChainPickerProps = {
  connectingWallet: WalletConnectCatalogWallet | null;
  entry: CatalogListEntry;
  isConnecting: boolean;
  onClick: (wallet: WalletConnectCatalogWallet) => void;
};

/**
 * Chain selection subview for a multi-chain catalog group. Each chain
 * variant renders as its own button, with a loading spinner on the one
 * currently being connected.
 */
export const CatalogChainPicker: FC<CatalogChainPickerProps> = ({
  connectingWallet,
  entry,
  isConnecting,
  onClick,
}) => (
  <div className="flex flex-col gap-2">
    {entry.group.wallets.map((wallet) => {
      const isThisLoading =
        isConnecting &&
        connectingWallet?.chain === wallet.chain &&
        connectingWallet?.name === wallet.name;

      return (
        <WalletProviderButton
          chain={wallet.chain}
          disabled={isConnecting}
          displayName={wallet.chain}
          groupKey={entry.group.id}
          IconComponent={getChainIcon(wallet.chain)}
          key={`${wallet.chain}-${wallet.name}`}
          loading={isThisLoading}
          onClick={() => onClick(wallet)}
        />
      );
    })}
  </div>
);

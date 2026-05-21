import type {
  WalletConnectCatalogWallet,
  WalletProviderData,
} from '@dynamic-labs-sdk/client';
import type { FC } from 'react';

import { CatalogChainPicker } from './CatalogChainPicker';
import type {
  CatalogListEntry,
  WalletProviderEntry,
} from './CombinedWalletList.types';
import { ProviderChainPicker } from './ProviderChainPicker';

type WalletEntryChainPickerProps =
  | {
      entry: WalletProviderEntry;
      kind: 'provider';
      onClick: (provider: WalletProviderData) => void;
    }
  | {
      connectingWallet: WalletConnectCatalogWallet | null;
      entry: CatalogListEntry;
      isConnecting: boolean;
      kind: 'catalog';
      onClick: (wallet: WalletConnectCatalogWallet) => void;
    };

/**
 * Discriminating wrapper that renders {@link ProviderChainPicker} or
 * {@link CatalogChainPicker} depending on the entry kind. Lets the
 * caller pass either shape with a single component.
 */
export const WalletEntryChainPicker: FC<WalletEntryChainPickerProps> = (
  props
) => {
  if (props.kind === 'provider') {
    return <ProviderChainPicker entry={props.entry} onClick={props.onClick} />;
  }

  return (
    <CatalogChainPicker
      connectingWallet={props.connectingWallet}
      entry={props.entry}
      isConnecting={props.isConnecting}
      onClick={props.onClick}
    />
  );
};

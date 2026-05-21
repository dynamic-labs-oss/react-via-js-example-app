import type { WalletProviderData } from '@dynamic-labs-sdk/client';
import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import { AutoVerifyWalletsSwitch } from '../AutoVerifyWalletsSwitch';
import { ErrorMessage } from '../ErrorMessage';
import { LedgerModeSwitch } from '../LedgerModeSwitch';
import { CombinedWalletList } from './CombinedWalletList';
import type { CombinedCatalogGroup } from './CombinedWalletList.types';

type WalletPickerViewProps = {
  error: unknown;
  onBack: () => void;
  onCatalogQrRequested: (group: CombinedCatalogGroup) => void;
  onProviderClick: (walletProvider: WalletProviderData) => void;
  walletProviders: WalletProviderData[];
};

/**
 * Full-screen-within-modal view that hosts the wallet picker. Bundles the
 * combined wallet list with the demo-only switches (auto-verify, ledger
 * mode) and a back button, so the parent `AuthRoute` can collapse the
 * picker behind a single "Connect a wallet" CTA.
 */
export const WalletPickerView: FC<WalletPickerViewProps> = ({
  error,
  onBack,
  onCatalogQrRequested,
  onProviderClick,
  walletProviders,
}) => (
  <div className="flex flex-col gap-3">
    <AutoVerifyWalletsSwitch />
    <LedgerModeSwitch />
    <ErrorMessage error={error} />
    <CombinedWalletList
      onCatalogQrRequested={onCatalogQrRequested}
      onProviderClick={onProviderClick}
      walletProviders={walletProviders}
    />
    <Button onClick={onBack} type="button" variant="outline">
      Back
    </Button>
  </div>
);

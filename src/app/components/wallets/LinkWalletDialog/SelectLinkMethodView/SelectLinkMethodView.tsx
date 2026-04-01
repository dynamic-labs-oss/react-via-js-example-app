import type { WalletProviderData } from '@dynamic-labs-sdk/client';
import type { FC } from 'react';

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../../../components/ui/dialog';
import { useLedgerMode } from '../../../../../store/ledgerMode';
import { useWalletProviders } from '../../../../hooks/useWalletProviders';
import { WalletList } from '../../../../routes/AuthRoute/WalletList';
import { AutoVerifyWalletsSwitch } from '../../../AutoVerifyWalletsSwitch';
import { LedgerModeSwitch } from '../../../LedgerModeSwitch';
import { WalletConnectSignInButton } from '../../../walletConnect/WalletConnectSignInButton';

export const SelectLinkMethodView: FC<{
  onSelect: (walletProvider: WalletProviderData) => void;
  onSelectWalletConnect: () => void;
}> = ({ onSelect, onSelectWalletConnect }) => {
  const allWalletProviders = useWalletProviders();
  const ledgerMode = useLedgerMode();

  const walletProviders = ledgerMode
    ? allWalletProviders.filter((p) =>
        p.metadata.supportedHardwareWalletVendors?.includes('ledger')
      )
    : allWalletProviders;

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add Wallet</DialogTitle>

        <DialogDescription>Add a wallet to your account.</DialogDescription>
      </DialogHeader>

      <AutoVerifyWalletsSwitch />
      <LedgerModeSwitch />

      <WalletConnectSignInButton
        onClick={onSelectWalletConnect}
        text="Continue with WalletConnect"
      />

      <WalletList walletProviders={walletProviders} onClick={onSelect} />
    </>
  );
};

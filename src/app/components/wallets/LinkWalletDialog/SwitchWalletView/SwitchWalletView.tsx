import type { WalletProviderData } from '@dynamic-labs-sdk/client';
import type { FC } from 'react';

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../../../components/ui/dialog';

export const SwitchWalletView: FC<{ walletProvider: WalletProviderData }> = ({
  walletProvider,
}) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Switch selected wallet</DialogTitle>

        <DialogDescription>
          You already have a wallet linked. Please select the wallet you want to
          link.
        </DialogDescription>
      </DialogHeader>

      <div className="py-8 flex justify-center">
        <img
          src={walletProvider.metadata.icon}
          alt={walletProvider.metadata.displayName}
        />
      </div>
    </>
  );
};

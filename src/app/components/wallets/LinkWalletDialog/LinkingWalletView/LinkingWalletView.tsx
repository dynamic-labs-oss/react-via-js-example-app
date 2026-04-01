import type { WalletProviderData } from '@dynamic-labs-sdk/client';
import type { FC } from 'react';

import { DialogHeader, DialogTitle } from '../../../../../components/ui/dialog';

export const LinkingWalletView: FC<{ walletProvider: WalletProviderData }> = ({
  walletProvider,
}) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Add Wallet</DialogTitle>
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

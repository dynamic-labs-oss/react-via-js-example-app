import type { WalletProviderData } from '@dynamic-labs-sdk/client';
import { transferWalletAccount } from '@dynamic-labs-sdk/client';
import { useMutation } from '@tanstack/react-query';
import type { FC } from 'react';

import { Button } from '../../../../../components/ui/button';
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../../components/ui/dialog';
import { ErrorMessage } from '../../../ErrorMessage';

type WalletAlreadyLinkedViewProps = {
  onCancel: () => void;
  onSuccess: () => void;
  walletProvider: WalletProviderData;
};

export const WalletAlreadyLinkedView: FC<WalletAlreadyLinkedViewProps> = ({
  onCancel,
  onSuccess,
  walletProvider,
}) => {
  const {
    mutate: transferWallet,
    error,
    isPending,
  } = useMutation({
    mutationFn: () =>
      transferWalletAccount({ walletProviderKey: walletProvider.key }),
    onSuccess,
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Transfer this wallet?</DialogTitle>
      </DialogHeader>

      <div className="text-sm text-gray-500">
        The wallet you are trying to add is already linked to another account.
      </div>

      <div className="text-sm text-gray-500">
        Adding this wallet to this account will unlink it from its previously
        associated account.
      </div>

      <div className="text-sm font-bold">
        Would you like to transfer this wallet to your current account anyway?
      </div>

      <DialogFooter>
        <Button
          variant="default"
          onClick={() => transferWallet()}
          disabled={isPending}
          loading={isPending}
        >
          Transfer
        </Button>
        <Button
          variant="outline"
          onClick={() => onCancel()}
          disabled={isPending}
        >
          Cancel
        </Button>
      </DialogFooter>

      <ErrorMessage error={error} />
    </>
  );
};

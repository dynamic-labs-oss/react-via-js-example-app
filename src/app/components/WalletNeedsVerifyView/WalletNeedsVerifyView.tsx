import type { WalletAccount, WalletProviderData } from '@dynamic-labs-sdk/client';
import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import { ErrorMessage } from '../ErrorMessage';

type WalletNeedsVerifyViewProps = {
  error?: unknown;
  isVerifying?: boolean;
  onVerify: () => void;
  walletAccount: WalletAccount;
  walletProvider: WalletProviderData;
};

export const WalletNeedsVerifyView: FC<WalletNeedsVerifyViewProps> = ({
  error,
  isVerifying,
  onVerify,
  walletProvider,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center">
        <img
          alt={walletProvider.metadata.displayName}
          src={walletProvider.metadata.icon}
          className="w-10 h-10"
        />
      </div>

      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-medium text-foreground">Wallet connected</p>
        <p className="text-xs text-muted-foreground text-center">
          Tap below to verify ownership by signing a message in{' '}
          {walletProvider.metadata.displayName}.
        </p>
      </div>

      <Button onClick={onVerify} loading={isVerifying} className="w-full">
        Verify Ownership
      </Button>

      <ErrorMessage error={error} />
    </div>
  );
};

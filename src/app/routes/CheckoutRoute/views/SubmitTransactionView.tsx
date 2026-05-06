import type { WalletAccount } from '@dynamic-labs-sdk/client';
import { submitCheckoutTransaction } from '@dynamic-labs-sdk/client';
import { useQuery } from '@tanstack/react-query';
import { type FC, useEffect, useState } from 'react';

type SubmitTransactionViewProps = {
  onCancel: () => void;
  onSubmitted: () => void;
  transactionId: string;
  walletAccount: WalletAccount;
};

export const SubmitTransactionView: FC<SubmitTransactionViewProps> = ({
  onCancel,
  onSubmitted,
  transactionId,
  walletAccount,
}) => {
  const [step, setStep] = useState<'approval' | 'transaction' | null>(null);

  const { error } = useQuery({
    queryFn: async () => {
      await submitCheckoutTransaction({
        onStepChange: setStep,
        transactionId,
        walletAccount,
      });
      onSubmitted();
      return null;
    },
    queryKey: ['submitCheckout', transactionId],
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: Infinity,
  });

  const isUserRejected = error?.message.includes('rejected') ?? false;

  useEffect(() => {
    if (isUserRejected) void onCancel();
  }, [isUserRejected]);

  if (isUserRejected) {
    return (
      <div className="space-y-3 py-4 text-center">
        <p className="text-sm text-destructive">User rejected the transaction</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3 py-4 text-center">
        <p className="text-sm text-destructive">{error.message}</p>
      </div>
    );
  }

  const statusMessage =
    step === 'approval'
      ? 'Approve the transaction in your wallet...'
      : step === 'transaction'
      ? 'Signing transaction...'
      : 'Preparing transaction...';

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      <p className="text-sm text-muted-foreground">{statusMessage}</p>
    </div>
  );
};

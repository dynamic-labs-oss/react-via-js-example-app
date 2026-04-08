import type { WalletAccount } from '@dynamic-labs-sdk/client';
import {
  attachCheckoutTransactionSource,
  getActiveNetworkData,
  getCheckoutTransactionQuote,
} from '@dynamic-labs-sdk/client';
import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';

import { Button } from '../../../../components/ui/button';

type ReviewQuoteViewProps = {
  fromTokenAddress: string;
  onBack: () => void;
  onConfirm: () => void;
  transactionId: string;
  walletAccount: WalletAccount;
};

export const ReviewQuoteView: FC<ReviewQuoteViewProps> = ({
  fromTokenAddress,
  onBack,
  onConfirm,
  transactionId,
  walletAccount,
}) => {
  const { data: transaction, error, isLoading, refetch } = useQuery({
    queryFn: async () => {
      const { networkData } = await getActiveNetworkData({ walletAccount });

      await attachCheckoutTransactionSource({
        fromAddress: walletAccount.address,
        fromChainId: networkData?.networkId ?? '',
        fromChainName: walletAccount.chain,
        transactionId,
      });

      return getCheckoutTransactionQuote({
        fromTokenAddress,
        transactionId,
      });
    },
    queryKey: ['checkoutQuote', transactionId, fromTokenAddress],
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">Fetching quote...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3 py-4 text-center">
        <p className="text-sm text-destructive">{error.message}</p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={onBack}>
            Back
          </Button>
          <Button size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!transaction?.quote) return null;

  const { quote } = transaction;
  const amount = Number(transaction.amount);
  const totalFeeUsd = quote.fees?.totalFeeUsd ?? 0;
  const totalDue = (amount + Number(totalFeeUsd)).toFixed(2);

  const renderFee = (fee?: string) => {
    const n = Number(fee);
    if (!fee || Number.isNaN(n)) return '-';
    if (n < 0.01) return '<$0.01';
    return `$${n.toFixed(2)}`;
  };

  return (
    <div className="space-y-5">
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Amount</span>
          <span>${amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Fees</span>
          <span>{renderFee(quote.fees?.totalFeeUsd)}</span>
        </div>
        <div className="border-t pt-3 flex justify-between text-sm font-semibold">
          <span>Total due</span>
          <span>${totalDue}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Estimated time: ~{quote.estimatedTimeSec}s
      </p>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button className="flex-1" onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </div>
  );
};

import type { Flow, WalletAccount } from '@dynamic-labs-sdk/client';
import {
  attachFlowSource,
  getActiveNetworkData,
  getFlowQuote,
} from '@dynamic-labs-sdk/client';
import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';

import { Button } from '../../../../components/ui/button';

type FlowQuoteViewProps = {
  flow: Flow;
  onBack: () => void;
  onConfirm: (updatedFlow: Flow) => void;
  walletAccount: WalletAccount;
};

export const FlowQuoteView: FC<FlowQuoteViewProps> = ({
  flow,
  onBack,
  onConfirm,
  walletAccount,
}) => {
  const {
    data: quotedFlow,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryFn: async () => {
      const { networkData } = await getActiveNetworkData({ walletAccount });

      await attachFlowSource({
        flowId: flow.id,
        fromAddress: walletAccount.address,
        fromChainId: networkData?.networkId ?? '',
        sourceType: 'wallet',
      });

      return getFlowQuote({
        flowId: flow.id,
        fromChainId: networkData?.networkId,
      });
    },
    queryKey: ['flowQuote', flow.id, walletAccount.address],
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">
          Attaching source & fetching quote...
        </p>
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

  if (!quotedFlow?.quote) return null;

  const { quote } = quotedFlow;

  return (
    <div className="space-y-5">
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">You send</span>
          <span className="font-mono">{quote.fromAmount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">They receive</span>
          <span className="font-mono">{quote.toAmount}</span>
        </div>
        {quote.fees?.totalFeeUsd && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Est. fees</span>
            <span className="font-mono">${quote.fees.totalFeeUsd}</span>
          </div>
        )}
        {quote.estimatedTimeSec && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Est. time</span>
            <span>~{quote.estimatedTimeSec}s</span>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Quote expires at {new Date(quote.expiresAt).toLocaleTimeString()}
      </p>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button
          className="flex-1"
          onClick={() => onConfirm(quotedFlow)}
        >
          Confirm & Sign
        </Button>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => void refetch()}
        disabled={isLoading}
      >
        Refresh Quote
      </Button>
    </div>
  );
};

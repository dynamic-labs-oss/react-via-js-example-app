import type { Flow, WalletAccount } from '@dynamic-labs-sdk/client';
import { submitFlowTransaction } from '@dynamic-labs-sdk/client';
import { useQuery } from '@tanstack/react-query';
import { type FC, useState } from 'react';

import { Button } from '../../../../components/ui/button';

type FlowSubmitViewProps = {
  flow: Flow;
  onBack: () => void;
  onSubmitted: (flow: Flow) => void;
  walletAccount: WalletAccount;
};

export const FlowSubmitView: FC<FlowSubmitViewProps> = ({
  flow,
  onBack,
  onSubmitted,
  walletAccount,
}) => {
  const [step, setStep] = useState<'approval' | 'transaction' | null>(null);

  const { error } = useQuery({
    queryFn: async () => {
      const completedFlow = await submitFlowTransaction({
        flowId: flow.id,
        onStepChange: setStep,
        walletAccount,
      });

      onSubmitted(completedFlow);
      return null;
    },
    queryKey: ['submitFlow', flow.id],
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: Infinity,
  });

  if (error) {
    return (
      <div className="space-y-3 py-4 text-center">
        <p className="text-sm text-destructive">{error.message}</p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={onBack}>
            Back
          </Button>
        </div>
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

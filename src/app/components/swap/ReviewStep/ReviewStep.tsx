import { useAtomValue, useSetAtom } from 'jotai';
import { Loader2 } from 'lucide-react';
import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import { ErrorMessage } from '../../ErrorMessage';
import { QuoteSummary } from '../QuoteSummary';
import {
  executeErrorAtom,
  executeStepAtom,
  executeSwapAtom,
  isExecutingAtom,
  quoteAtom,
  stepAtom,
} from '../swap.atoms';

export const ReviewStep: FC = () => {
  const quote = useAtomValue(quoteAtom)!;
  const executeError = useAtomValue(executeErrorAtom);
  const executeStep = useAtomValue(executeStepAtom);
  const isExecuting = useAtomValue(isExecutingAtom);
  const executeSwap = useSetAtom(executeSwapAtom);
  const setStep = useSetAtom(stepAtom);

  return (
    <div className="flex flex-col space-y-4">
      <QuoteSummary quote={quote} />

      <div className="space-y-1.5">
        {quote.gasCostUSD && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Gas cost</span>
            <span className="font-medium">~${quote.gasCostUSD}</span>
          </div>
        )}
      </div>

      <div className="border-t border-border/40 pt-4 space-y-3">
        {executeStep && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
            <span>
              {executeStep === 'approval'
                ? 'Waiting for approval signature...'
                : 'Waiting for transaction signature...'}
            </span>
          </div>
        )}

        <ErrorMessage
          error={executeError}
          defaultMessage="Failed to execute swap"
          className="text-left"
        />

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setStep('quote')}
            disabled={isExecuting}
          >
            Back
          </Button>
          <Button
            className="flex-1"
            loading={isExecuting}
            disabled={isExecuting || !quote.signingPayload}
            onClick={() => void executeSwap()}
          >
            Execute Swap
          </Button>
        </div>
      </div>
    </div>
  );
};

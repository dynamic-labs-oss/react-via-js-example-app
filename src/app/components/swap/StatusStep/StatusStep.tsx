import { useAtomValue, useSetAtom } from 'jotai';
import { Loader2 } from 'lucide-react';
import type { FC } from 'react';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { QuoteSummary } from '../QuoteSummary';
import {
  STATUS_POLL_INTERVAL,
  checkStatusAtom,
  isSwapTerminalAtom,
  quoteAtom,
  stepAtom,
  swapStatusAtom,
  txHashAtom,
} from '../swap.atoms';

export const StatusStep: FC = () => {
  const quote = useAtomValue(quoteAtom)!;
  const txHash = useAtomValue(txHashAtom);
  const swapStatus = useAtomValue(swapStatusAtom);
  const isTerminal = useAtomValue(isSwapTerminalAtom);
  const checkStatus = useSetAtom(checkStatusAtom);
  const setStep = useSetAtom(stepAtom);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  // Start polling immediately when the component mounts with a txHash.
  useEffect(() => {
    if (!txHash) return;
    void checkStatus(txHash);
    pollingRef.current = setInterval(
      () => void checkStatus(txHash),
      STATUS_POLL_INTERVAL
    );
    return stopPolling;
  }, [txHash]);

  // Stop polling once we reach a terminal status.
  useEffect(() => {
    if (isTerminal) stopPolling();
  }, [isTerminal]);

  const statusColor =
    swapStatus?.status === 'DONE'
      ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
      : swapStatus?.status === 'FAILED'
      ? 'text-destructive bg-destructive/5 border-destructive/20'
      : 'text-amber-600 bg-amber-50 border-amber-200';

  const handleBack = () => {
    stopPolling();
    setStep('review');
  };

  return (
    <div className="flex flex-col space-y-4">
      <QuoteSummary quote={quote} />

      <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
        <p className="text-xs font-medium text-muted-foreground mb-1">
          Transaction Hash
        </p>
        <p className="font-mono text-xs text-muted-foreground break-all">
          {txHash}
        </p>
      </div>

      {swapStatus && (
        <div className={`rounded-lg border px-4 py-3 ${statusColor}`}>
          <div className="flex items-center gap-2">
            {!isTerminal && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <p className="text-sm font-semibold">{swapStatus.status}</p>
          </div>
          {swapStatus.substatus && (
            <p className="text-xs mt-1 opacity-80">{swapStatus.substatus}</p>
          )}
        </div>
      )}

      {!swapStatus && (
        <div className="flex items-center justify-center py-4 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span className="text-sm">Checking status...</span>
        </div>
      )}

      <Button variant="outline" onClick={handleBack}>
        Back
      </Button>
    </div>
  );
};

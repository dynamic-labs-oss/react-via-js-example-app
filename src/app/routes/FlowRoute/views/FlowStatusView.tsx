import { getFlow } from '@dynamic-labs-sdk/client';
import { useQuery } from '@tanstack/react-query';
import { type FC, useRef, useState } from 'react';

import { Button } from '../../../../components/ui/button';

type FlowStatusViewProps = {
  flowId: string;
  onReset: () => void;
};

const TERMINAL_STATES = new Set([
  'cancelled',
  'expired',
  'failed',
  'source_confirmed',
]);

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 30000;

const getStatusLabel = (executionState: string): string => {
  const labels: Record<string, string> = {
    broadcasted: 'Transaction broadcasted',
    cancelled: 'Flow cancelled',
    expired: 'Flow expired',
    failed: 'Flow failed',
    initiated: 'Flow initiated',
    quoted: 'Quote received',
    signing: 'Signing...',
    source_attached: 'Source attached',
    source_confirmed: 'Payment confirmed',
  };

  return labels[executionState] ?? 'Processing...';
};

export const FlowStatusView: FC<FlowStatusViewProps> = ({
  flowId,
  onReset,
}) => {
  const [pollingTimedOut, setPollingTimedOut] = useState(false);
  const pollStartRef = useRef(Date.now());

  const {
    data: flow,
    error,
    isRefetching,
  } = useQuery({
    enabled: !pollingTimedOut,
    queryFn: () => getFlow({ flowId }),
    queryKey: ['flowStatus', flowId],
    refetchInterval: (query) => {
      if (pollingTimedOut) return false;

      const data = query.state.data;
      if (!data) return POLL_INTERVAL_MS;

      const state = String(data.executionState);

      if (TERMINAL_STATES.has(state)) return false;

      if (Date.now() - pollStartRef.current >= POLL_TIMEOUT_MS) {
        setPollingTimedOut(true);
        return false;
      }

      return POLL_INTERVAL_MS;
    },
  });

  if (error && !flow) {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <p className="text-sm text-destructive">{error.message}</p>
        <Button onClick={onReset}>Start Over</Button>
      </div>
    );
  }

  const executionState = flow ? String(flow.executionState) : 'broadcasted';
  const isTerminal = TERMINAL_STATES.has(executionState);
  const isSuccess = executionState === 'source_confirmed';
  const isFailed =
    executionState === 'failed' ||
    executionState === 'cancelled' ||
    executionState === 'expired';
  const statusLabel = getStatusLabel(executionState);

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      {!isTerminal && !pollingTimedOut && (
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      )}

      {isSuccess && (
        <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
          <span className="text-green-500 text-xl">&#10003;</span>
        </div>
      )}

      {isFailed && (
        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <span className="text-destructive text-xl">&#10007;</span>
        </div>
      )}

      <p className="text-sm font-medium">{statusLabel}</p>

      {flow?.txHash && (
        <p className="text-xs text-muted-foreground break-all text-center">
          Tx: {flow.txHash}
        </p>
      )}

      {pollingTimedOut && !isTerminal && (
        <Button
          className="mt-2"
          disabled={isRefetching}
          onClick={() => {
            pollStartRef.current = Date.now();
            setPollingTimedOut(false);
          }}
        >
          {isRefetching ? 'Checking...' : 'Check Status'}
        </Button>
      )}

      {isTerminal && (
        <Button className="mt-2" onClick={onReset}>
          {isSuccess ? 'Done' : 'Start Over'}
        </Button>
      )}
    </div>
  );
};

import type {
  CheckoutExecutionState,
  CheckoutSettlementState,
} from '@dynamic-labs-sdk/client';
import { getCheckoutTransaction } from '@dynamic-labs-sdk/client';
import { useQuery } from '@tanstack/react-query';
import { type FC, useEffect, useRef, useState } from 'react';

import { Button } from '../../../../components/ui/button';

type TransactionStatusViewProps = {
  onReset: () => void;
  onStartOver: () => void;
  transactionId: string;
};

const TERMINAL_EXECUTION_STATES: CheckoutExecutionState[] = [
  'cancelled',
  'expired',
  'failed',
];

const TERMINAL_SETTLEMENT_STATES: CheckoutSettlementState[] = [
  'completed',
  'failed',
];

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 15000;

const getStatusLabel = (
  executionState: CheckoutExecutionState,
  settlementState: CheckoutSettlementState
): string => {
  if (TERMINAL_EXECUTION_STATES.includes(executionState)) {
    return executionState === 'failed'
      ? 'Transaction failed'
      : `Transaction ${executionState}`;
  }

  if (settlementState === 'completed') return 'Payment complete';
  if (settlementState === 'failed') return 'Settlement failed';

  const settlementLabels: Partial<Record<CheckoutSettlementState, string>> = {
    bridging: 'Bridging tokens...',
    routing: 'Routing payment...',
    settling: 'Settling payment...',
    swapping: 'Swapping tokens...',
  };

  if (settlementLabels[settlementState]) return settlementLabels[settlementState]!;

  const executionLabels: Partial<Record<CheckoutExecutionState, string>> = {
    broadcasted: 'Transaction broadcasted',
    source_confirmed: 'Source confirmed',
  };

  return executionLabels[executionState] ?? 'Processing...';
};

export const TransactionStatusView: FC<TransactionStatusViewProps> = ({
  onReset,
  onStartOver,
  transactionId,
}) => {
  const [pollingTimedOut, setPollingTimedOut] = useState(false);
  const pollStartRef = useRef(Date.now());

  useEffect(() => {
    pollStartRef.current = Date.now();
    setPollingTimedOut(false);
  }, [transactionId]);

  const { data: transaction, error, isRefetching } = useQuery({
    enabled: !pollingTimedOut,
    queryFn: () => getCheckoutTransaction({ transactionId }),
    queryKey: ['checkoutTransaction', transactionId],
    refetchInterval: (query) => {
      if (pollingTimedOut) return false;

      const tx = query.state.data;
      if (!tx) return POLL_INTERVAL_MS;

      if (
        TERMINAL_EXECUTION_STATES.includes(tx.executionState as CheckoutExecutionState) ||
        TERMINAL_SETTLEMENT_STATES.includes(tx.settlementState as CheckoutSettlementState)
      ) {
        return false;
      }

      if (Date.now() - pollStartRef.current >= POLL_TIMEOUT_MS) {
        setPollingTimedOut(true);
        return false;
      }

      return POLL_INTERVAL_MS;
    },
  });

  if (error && !transaction) {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <p className="text-sm text-destructive">{error.message}</p>
        <Button onClick={onStartOver}>Start Over</Button>
      </div>
    );
  }

  const executionState =
    (transaction?.executionState as CheckoutExecutionState) ?? 'broadcasted';
  const settlementState =
    (transaction?.settlementState as CheckoutSettlementState) ?? 'none';

  const isTerminal =
    TERMINAL_EXECUTION_STATES.includes(executionState) ||
    TERMINAL_SETTLEMENT_STATES.includes(settlementState);
  const isSuccess = settlementState === 'completed';
  const isFailed =
    executionState === 'failed' || settlementState === 'failed';
  const statusLabel = getStatusLabel(executionState, settlementState);

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

      {error && <p className="text-xs text-destructive">{error.message}</p>}

      {transaction?.txHash && (
        <p className="text-xs text-muted-foreground break-all text-center">
          Tx: {transaction.txHash}
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

      {isTerminal && isSuccess && (
        <Button className="mt-2" onClick={onReset}>
          Done
        </Button>
      )}

      {isTerminal && !isSuccess && (
        <Button className="mt-2" onClick={onStartOver}>
          Start Over
        </Button>
      )}
    </div>
  );
};

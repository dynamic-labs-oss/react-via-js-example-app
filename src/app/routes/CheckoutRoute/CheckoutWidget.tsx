import type {
  CheckoutExecutionState,
  CheckoutSettlementState,
  CheckoutTransaction,
  WalletAccount,
} from '@dynamic-labs-sdk/client';
import {
  cancelCheckoutTransaction,
  getCheckoutTransaction,
} from '@dynamic-labs-sdk/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { type FC, useCallback, useEffect, useState } from 'react';

import { Button } from '../../../components/ui/button';
import { useWalletAccounts } from '../../hooks/useWalletAccounts';
import { AttachSourceView } from './views/AttachSourceView';
import { CreateTransactionView } from './views/CreateTransactionView';
import { ReviewQuoteView } from './views/ReviewQuoteView';
import { SubmitTransactionView } from './views/SubmitTransactionView';
import { TransactionStatusView } from './views/TransactionStatusView';

export type WidgetView =
  | 'create'
  | 'attachSource'
  | 'reviewQuote'
  | 'submit'
  | 'status';

const TERMINAL_EXECUTION_STATES: CheckoutExecutionState[] = [
  'cancelled',
  'expired',
  'failed',
];

const POST_SUBMIT_EXECUTION_STATES: CheckoutExecutionState[] = [
  'signing',
  'broadcasted',
  'source_confirmed',
];

const TERMINAL_SETTLEMENT_STATES: CheckoutSettlementState[] = [
  'completed',
  'failed',
];

const deriveViewFromTransaction = (tx: CheckoutTransaction): WidgetView => {
  const { executionState, settlementState } = tx;

  if (
    TERMINAL_EXECUTION_STATES.includes(executionState as CheckoutExecutionState) ||
    POST_SUBMIT_EXECUTION_STATES.includes(executionState as CheckoutExecutionState) ||
    TERMINAL_SETTLEMENT_STATES.includes(settlementState as CheckoutSettlementState) ||
    (settlementState !== 'none' && settlementState !== undefined)
  ) {
    return 'status';
  }

  if (tx.fromToken) return 'reviewQuote';

  return 'attachSource';
};

const STORAGE_KEY = 'dynamic-demo-checkout-state';

const getPersistedTransactionId = (): string | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as { transactionId?: string };
    return parsed.transactionId ?? null;
  } catch {
    return null;
  }
};

const persistTransactionId = (id: string) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ transactionId: id }));
};

const clearPersistedTransaction = () => {
  localStorage.removeItem(STORAGE_KEY);
};

const VIEWS_WITH_CANCEL: WidgetView[] = ['attachSource', 'reviewQuote', 'submit'];

export const CheckoutWidget: FC = () => {
  const [transaction, setTransaction] = useState<CheckoutTransaction | null>(null);
  const [view, setView] = useState<WidgetView>('create');

  const walletAccounts = useWalletAccounts();
  const connectedWallet = (walletAccounts[0] ?? null) as WalletAccount | null;

  const { isLoading: isRestoring } = useQuery({
    queryFn: async () => {
      const persistedId = getPersistedTransactionId();
      if (!persistedId) return null;

      try {
        const tx = await getCheckoutTransaction({ transactionId: persistedId });
        setTransaction(tx);
        setView(deriveViewFromTransaction(tx));
        return tx;
      } catch {
        clearPersistedTransaction();
        return null;
      }
    },
    queryKey: ['restoreCheckoutState'],
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!transaction) {
      clearPersistedTransaction();
      return;
    }
    persistTransactionId(transaction.id);
  }, [transaction]);

  const handleReset = useCallback(() => {
    clearPersistedTransaction();
    setTransaction(null);
    setView('create');
  }, []);

  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (transaction) {
        await cancelCheckoutTransaction({ transactionId: transaction.id });
      }
    },
    onSettled: handleReset,
  });

  const handleTransactionCreated = (tx: CheckoutTransaction) => {
    setTransaction(tx);
    setView('attachSource');
  };

  const handleTokenSelect = (tokenAddress: string) => {
    if (transaction) setTransaction({ ...transaction, fromToken: tokenAddress });
    setView('reviewQuote');
  };

  const handleBackToTokenSelect = () => {
    if (transaction) setTransaction({ ...transaction, fromToken: undefined });
    setView('attachSource');
  };

  if (isRestoring) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="p-6 flex flex-col items-center gap-3 py-6">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
            <p className="text-sm text-muted-foreground">
              Restoring transaction...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {transaction && (
          <div className="bg-gradient-to-br from-primary to-primary/80 px-6 py-5 text-center">
            <p className="text-sm text-primary-foreground/70">Pay</p>
            <p className="text-3xl font-bold text-primary-foreground">
              ${transaction.amount}
            </p>
          </div>
        )}

        <div className="p-6">
          {view === 'create' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Checkout</h2>
              <CreateTransactionView
                onTransactionCreated={handleTransactionCreated}
              />
            </div>
          )}

          {view === 'attachSource' && transaction && (
            <AttachSourceView
              transactionAmount={Number(transaction.amount)}
              onTokenSelect={handleTokenSelect}
            />
          )}

          {view === 'reviewQuote' &&
            transaction &&
            transaction.fromToken &&
            connectedWallet && (
              <ReviewQuoteView
                fromTokenAddress={transaction.fromToken}
                transactionId={transaction.id}
                walletAccount={connectedWallet}
                onBack={handleBackToTokenSelect}
                onConfirm={() => setView('submit')}
              />
            )}

          {view === 'submit' && transaction && connectedWallet && (
            <SubmitTransactionView
              transactionId={transaction.id}
              walletAccount={connectedWallet}
              onSubmitted={() => setView('status')}
              onCancel={() => cancelMutation.mutate()}
            />
          )}

          {view === 'status' && transaction && (
            <TransactionStatusView
              transactionId={transaction.id}
              onStartOver={() => cancelMutation.mutate()}
              onReset={handleReset}
            />
          )}

          {VIEWS_WITH_CANCEL.includes(view) && transaction && (
            <Button
              variant="ghost"
              className="w-full mt-4 text-destructive"
              onClick={() => cancelMutation.mutate()}
            >
              Cancel Transaction
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

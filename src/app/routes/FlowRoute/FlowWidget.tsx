import type { Flow, WalletAccount } from '@dynamic-labs-sdk/client';
import { cancelFlow, getFlow } from '@dynamic-labs-sdk/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { type FC, useCallback, useEffect, useState } from 'react';

import { Button } from '../../../components/ui/button';
import { useWalletAccounts } from '../../hooks/useWalletAccounts';
import { EnterFlowIdView } from './views/EnterFlowIdView';
import { FlowQuoteView } from './views/FlowQuoteView';
import { FlowStatusView } from './views/FlowStatusView';
import { FlowSubmitView } from './views/FlowSubmitView';

type FlowWidgetView =
  | 'enterFlowId'
  | 'reviewQuote'
  | 'submit'
  | 'status';

const TERMINAL_STATES = new Set([
  'broadcasted',
  'source_confirmed',
  'cancelled',
  'expired',
  'failed',
]);

const STORAGE_KEY = 'dynamic-demo-flow-state';

const getPersistedFlowId = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const persistFlowId = (id: string) => {
  localStorage.setItem(STORAGE_KEY, id);
};

const clearPersistedFlow = () => {
  localStorage.removeItem(STORAGE_KEY);
};

const VIEWS_WITH_CANCEL: FlowWidgetView[] = ['reviewQuote'];

export const FlowWidget: FC = () => {
  const [flow, setFlow] = useState<Flow | null>(null);
  const [view, setView] = useState<FlowWidgetView>('enterFlowId');

  const walletAccounts = useWalletAccounts();
  const connectedWallet = (walletAccounts[0] ?? null) as WalletAccount | null;

  const { isLoading: isRestoring } = useQuery({
    queryFn: async () => {
      const persistedId = getPersistedFlowId();
      if (!persistedId) return null;

      try {
        const restoredFlow = await getFlow({ flowId: persistedId });
        const state = String(restoredFlow.executionState);

        setFlow(restoredFlow);
        setView(TERMINAL_STATES.has(state) ? 'status' : 'reviewQuote');

        return restoredFlow;
      } catch {
        clearPersistedFlow();
        return null;
      }
    },
    queryKey: ['restoreFlowState'],
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!flow) {
      clearPersistedFlow();
      return;
    }
    persistFlowId(flow.id);
  }, [flow]);

  const handleReset = useCallback(() => {
    clearPersistedFlow();
    setFlow(null);
    setView('enterFlowId');
  }, []);

  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (flow) {
        await cancelFlow({ flowId: flow.id });
      }
    },
    onSettled: handleReset,
  });

  const handleFlowLoaded = (loadedFlow: Flow) => {
    setFlow(loadedFlow);
    setView('reviewQuote');
  };

  if (isRestoring) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="p-6 flex flex-col items-center gap-3 py-6">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
            <p className="text-sm text-muted-foreground">Loading flow...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {flow && (
          <div className="bg-gradient-to-br from-primary to-primary/80 px-6 py-5 text-center">
            <p className="text-sm text-primary-foreground/70">Amount</p>
            <p className="text-3xl font-bold text-primary-foreground">
              {flow.amount} {flow.currency}
            </p>
          </div>
        )}

        <div className="p-6">
          {view === 'enterFlowId' && (
            <EnterFlowIdView onFlowLoaded={handleFlowLoaded} />
          )}

          {view === 'reviewQuote' && flow && connectedWallet && (
            <FlowQuoteView
              flow={flow}
              walletAccount={connectedWallet}
              onBack={() => {
                setFlow(null);
                setView('enterFlowId');
              }}
              onConfirm={(updatedFlow) => {
                setFlow(updatedFlow);
                setView('submit');
              }}
            />
          )}

          {view === 'submit' && flow && connectedWallet && (
            <FlowSubmitView
              flow={flow}
              walletAccount={connectedWallet}
              onSubmitted={(completedFlow) => {
                setFlow(completedFlow);
                setView('status');
              }}
              onBack={() => setView('reviewQuote')}
            />
          )}

          {view === 'status' && flow && (
            <FlowStatusView
              flowId={flow.id}
              onReset={handleReset}
            />
          )}

          {VIEWS_WITH_CANCEL.includes(view) && flow && (
            <Button
              variant="ghost"
              className="w-full mt-4 text-destructive"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Flow'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

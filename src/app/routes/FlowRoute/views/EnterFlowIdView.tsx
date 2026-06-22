import type { Flow } from '@dynamic-labs-sdk/client';
import { getFlow } from '@dynamic-labs-sdk/client';
import { useMutation } from '@tanstack/react-query';
import type { FC, FormEvent } from 'react';
import { useState } from 'react';

import { Button } from '../../../../components/ui/button';

type EnterFlowIdViewProps = {
  onFlowLoaded: (flow: Flow) => void;
};

export const EnterFlowIdView: FC<EnterFlowIdViewProps> = ({ onFlowLoaded }) => {
  const [flowId, setFlowId] = useState('');

  const { mutate: loadFlow, isPending, error } = useMutation({
    mutationFn: ({ flowId: id }: { flowId: string }) =>
      getFlow({ flowId: id }),
    onSuccess: onFlowLoaded,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = flowId.trim();
    if (!trimmed) return;
    loadFlow({ flowId: trimmed });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Start a Flow</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter a flow ID to begin the payment process
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="flowId">
            Flow ID
          </label>
          <input
            id="flowId"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="e.g. flow_abc123..."
            value={flowId}
            onChange={(e) => setFlowId(e.target.value)}
            disabled={isPending}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : 'Flow not found. Check the ID and try again.'}
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={!flowId.trim() || isPending}
        >
          {isPending ? 'Loading...' : 'Load Flow'}
        </Button>
      </form>
    </div>
  );
};

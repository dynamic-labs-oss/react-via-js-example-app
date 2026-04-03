import {
  type AptosTransactionPayload,
  signAndSubmitTransaction,
  type AptosWalletAccount,
} from '@dynamic-labs-sdk/aptos';
import { useMutation } from '@tanstack/react-query';
import type { FC, FormEvent } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ErrorMessage } from '../../../ErrorMessage';

const DEFAULT_PAYLOAD = JSON.stringify(
  {
    function: '0x1::aptos_account::transfer',
    functionArguments: ['0x1', '100'],
    typeArguments: [],
  },
  null,
  2
);

type SignAndSubmitTransactionDialogProps = {
  walletAccount: AptosWalletAccount;
};

export const SignAndSubmitTransactionDialog: FC<SignAndSubmitTransactionDialogProps> = ({
  walletAccount,
}) => {
  const [isOpen, _setIsOpen] = useState(false);
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [parseError, setParseError] = useState<string | undefined>();

  const setIsOpen = (open: boolean) => {
    _setIsOpen(open);
    if (!open) {
      setPayload(DEFAULT_PAYLOAD);
      setParseError(undefined);
      reset();
    }
  };

  const {
    data: hash,
    error,
    mutate: handleSubmit,
    isPending,
    reset,
  } = useMutation({
    mutationFn: async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      let transaction: AptosTransactionPayload;
      try {
        transaction = JSON.parse(payload) as AptosTransactionPayload;
        setParseError(undefined);
      } catch {
        setParseError('Invalid JSON payload');
        return;
      }
      const { hash } = await signAndSubmitTransaction({ transaction, walletAccount });
      return hash;
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Sign &amp; Submit Transaction
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[500px]"
        aria-describedby="sign-and-submit-aptos-dialog"
      >
        <DialogTitle>Sign &amp; Submit Transaction</DialogTitle>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payload">Transaction Payload (JSON)</Label>
            <textarea
              name="payload"
              className="w-full min-h-[160px] rounded-md border border-input bg-background px-3 py-2 text-xs font-mono shadow-sm resize-y focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={payload}
              onChange={(e) => {
                reset();
                setParseError(undefined);
                setPayload(e.target.value);
              }}
              required
            />
            {parseError && (
              <p className="text-xs text-destructive">{parseError}</p>
            )}
          </div>

          <Button type="submit" loading={isPending} disabled={isPending}>
            Sign &amp; Submit
          </Button>

          <ErrorMessage
            error={error}
            defaultMessage="Failed to sign and submit transaction"
            className="text-left"
          />

          {hash && (
            <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                Transaction Hash
              </p>
              <p className="font-mono text-xs text-muted-foreground break-all">
                {hash}
              </p>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

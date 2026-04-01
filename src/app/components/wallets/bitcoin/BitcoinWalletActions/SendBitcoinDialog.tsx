import type { BitcoinWalletAccount } from '@dynamic-labs-sdk/bitcoin';
import { sendBitcoin } from '@dynamic-labs-sdk/bitcoin';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type SendBitcoinDialogProps = {
  walletAccount: BitcoinWalletAccount;
};

export const SendBitcoinDialog: FC<SendBitcoinDialogProps> = ({
  walletAccount,
}) => {
  const [isOpen, _setIsOpen] = useState(false);

  const [recipientAddress, setRecipientAddress] = useState<string>('');

  const [amount, setAmount] = useState<string>('');

  const {
    data: result,
    error,
    isPending,
    mutate: handleSendBitcoin,
    reset,
  } = useMutation<
    Awaited<ReturnType<typeof sendBitcoin>>,
    Error,
    FormEvent<HTMLFormElement>
  >({
    mutationFn: async (e) => {
      e.preventDefault();

      const amountInSatoshis = BigInt(Math.floor(parseFloat(amount) * 1e8));

      return sendBitcoin({
        transaction: {
          amount: amountInSatoshis,
          recipientAddress,
        },
        walletAccount,
      });
    },
  });

  const setIsOpen = (open: boolean) => {
    _setIsOpen(open);

    if (!open) {
      setRecipientAddress('');
      setAmount('');
      reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Send Bitcoin
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[425px]"
        aria-describedby="send-bitcoin-dialog"
      >
        <DialogTitle>Send Bitcoin</DialogTitle>

        <form onSubmit={handleSendBitcoin} className="flex flex-col space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipientAddress">Recipient Address</Label>

            <Input
              type="text"
              name="recipientAddress"
              placeholder="bc1q..."
              required
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (BTC)</Label>

            <Input
              type="number"
              name="amount"
              placeholder="0.001"
              step="0.00000001"
              min="0.00000001"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            loading={isPending}
            disabled={isPending || !recipientAddress || !amount}
          >
            Send
          </Button>

          {error && (
            <p className="text-sm text-destructive">{error.message}</p>
          )}

          {result?.transactionId && (
            <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                Transaction ID
              </p>
              <a
                href={`https://mempool.space/tx/${result.transactionId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-primary break-all hover:underline"
              >
                {result.transactionId}
              </a>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

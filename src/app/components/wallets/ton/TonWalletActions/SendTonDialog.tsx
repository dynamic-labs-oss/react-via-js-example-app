import {
  NANOTON_PER_TON,
  sendTon,
  type TonWalletAccount,
} from '@dynamic-labs-sdk/ton';
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
import { getAddressPlaceholder, validateAddress } from '../../../../utils/validateAddress';
import { ErrorMessage } from '../../../ErrorMessage';

type SendTonDialogProps = {
  walletAccount: TonWalletAccount;
};

export const SendTonDialog: FC<SendTonDialogProps> = ({ walletAccount }) => {
  const [isOpen, _setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const addressValidation = recipient
    ? validateAddress('TON', recipient)
    : undefined;
  const isAddressInvalid =
    recipient.length > 0 && addressValidation != null && !addressValidation.isValid;

  const setIsOpen = (open: boolean) => {
    _setIsOpen(open);
    if (!open) {
      setAmount('');
      setRecipient('');
      reset();
    }
  };

  const {
    data: result,
    error,
    mutate: handleSend,
    isPending,
    reset,
  } = useMutation({
    mutationFn: async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const { transactionHash } = await sendTon({
        transaction: {
          amount: BigInt(Math.round(Number(amount) * Number(NANOTON_PER_TON))),
          recipientAddress: recipient,
        },
        walletAccount,
      });
      return transactionHash;
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Send TON
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[425px]"
        aria-describedby="send-ton-dialog"
      >
        <DialogTitle>Send TON</DialogTitle>
        <form onSubmit={handleSend} className="flex flex-col space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (TON)</Label>
            <Input
              type="text"
              name="amount"
              pattern="^[0-9]*\.?[0-9]*$"
              placeholder="0.1"
              required
              value={amount}
              onChange={(e) => {
                reset();
                setAmount(e.target.value);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              type="text"
              name="recipient"
              placeholder={getAddressPlaceholder('TON')}
              aria-invalid={isAddressInvalid || undefined}
              required
              value={recipient}
              onChange={(e) => {
                reset();
                setRecipient(e.target.value);
              }}
            />
            {isAddressInvalid && addressValidation && (
              <p className="text-xs text-destructive">{addressValidation.hint}</p>
            )}
          </div>

          <Button
            type="submit"
            loading={isPending}
            disabled={isPending || isAddressInvalid}
          >
            Send
          </Button>

          <ErrorMessage
            error={error}
            defaultMessage="Failed to send TON"
            className="text-left"
          />

          {result && (
            <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                Transaction Hash
              </p>
              <p className="font-mono text-xs text-muted-foreground break-all">
                {result}
              </p>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

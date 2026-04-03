import {
  NANOTON_PER_TON,
  sendJetton,
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

type SendJettonDialogProps = {
  walletAccount: TonWalletAccount;
};

export const SendJettonDialog: FC<SendJettonDialogProps> = ({ walletAccount }) => {
  const [isOpen, _setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [jettonMasterAddress, setJettonMasterAddress] = useState('');
  const [recipient, setRecipient] = useState('');

  const recipientValidation = recipient
    ? validateAddress('TON', recipient)
    : undefined;
  const isRecipientInvalid =
    recipient.length > 0 && recipientValidation != null && !recipientValidation.isValid;

  const setIsOpen = (open: boolean) => {
    _setIsOpen(open);
    if (!open) {
      setAmount('');
      setJettonMasterAddress('');
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
      const { transactionHash } = await sendJetton({
        transaction: {
          amount: BigInt(Math.round(Number(amount) * Number(NANOTON_PER_TON))),
          jettonMasterAddress,
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
          Send Jetton
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[425px]"
        aria-describedby="send-jetton-dialog"
      >
        <DialogTitle>Send Jetton</DialogTitle>
        <form onSubmit={handleSend} className="flex flex-col space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jettonMasterAddress">Jetton Master Address</Label>
            <Input
              type="text"
              name="jettonMasterAddress"
              placeholder={getAddressPlaceholder('TON')}
              required
              value={jettonMasterAddress}
              onChange={(e) => {
                reset();
                setJettonMasterAddress(e.target.value);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              type="text"
              name="amount"
              pattern="^[0-9]*\.?[0-9]*$"
              placeholder="1.0"
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
              aria-invalid={isRecipientInvalid || undefined}
              required
              value={recipient}
              onChange={(e) => {
                reset();
                setRecipient(e.target.value);
              }}
            />
            {isRecipientInvalid && recipientValidation && (
              <p className="text-xs text-destructive">
                {recipientValidation.hint}
              </p>
            )}
          </div>

          <Button
            type="submit"
            loading={isPending}
            disabled={isPending || isRecipientInvalid}
          >
            Send
          </Button>

          <ErrorMessage
            error={error}
            defaultMessage="Failed to send Jetton"
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

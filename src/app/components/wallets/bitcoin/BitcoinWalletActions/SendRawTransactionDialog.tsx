import type { BitcoinWalletAccount } from '@dynamic-labs-sdk/bitcoin';
import { sendRawTransaction } from '@dynamic-labs-sdk/bitcoin';
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

type SendRawTransactionDialogProps = {
  walletAccount: BitcoinWalletAccount;
};

export const SendRawTransactionDialog: FC<SendRawTransactionDialogProps> = ({
  walletAccount,
}) => {
  const [isOpen, _setIsOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [transactionHex, setTransactionHex] = useState<string>();
  const [transactionId, setTransactionId] = useState<string>();

  const setIsOpen = (open: boolean) => {
    _setIsOpen(open);
    if (!open) {
      setTransactionHex(undefined);
      setTransactionId(undefined);
    }
  };

  const handleSendRawTransaction = async (e: FormEvent<HTMLFormElement>) => {
    setTransactionId(undefined);
    e.preventDefault();

    try {
      setLoading(true);

      const result = await sendRawTransaction({
        rawTransaction: transactionHex || '',
        walletAccount,
      });
      setTransactionId(result.transactionId);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Send Raw Transaction
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[425px]"
        aria-describedby="send-transaction-dialog"
      >
        <DialogTitle>Send Raw Transaction</DialogTitle>
        <form
          onSubmit={handleSendRawTransaction}
          className="flex flex-col space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="rawTransaction">Raw Transaction (hex)</Label>
            <Input
              type="text"
              name="rawTransaction"
              placeholder="Enter raw transaction (hex)"
              required
              value={transactionHex}
              onChange={(e) => setTransactionHex(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            loading={loading}
            disabled={loading || !transactionHex}
          >
            Send
          </Button>

          {transactionId && (
            <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                Transaction ID
              </p>
              <p className="font-mono text-xs text-muted-foreground break-all">
                {transactionId}
              </p>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

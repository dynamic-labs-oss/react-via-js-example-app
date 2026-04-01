import type { NetworkData } from '@dynamic-labs-sdk/client';
import {
  type SolanaWalletAccount,
  signAllTransactions,
  signTransaction,
} from '@dynamic-labs-sdk/solana';
import { toBase58 } from '@mysten/sui/utils';
import type {
  SignaturePubkeyPair,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js';
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
import { Switch } from '@/components/ui/switch';
import { createSolanaTransaction } from '../../../../functions/createSolanaTransaction';

type SignTransactionDialogProps = {
  activeNetworkData: NetworkData;
  signMethod?: 'signAllTransactions' | 'signTransaction';
  walletAccount: SolanaWalletAccount;
};

export const SignTransactionDialog: FC<SignTransactionDialogProps> = ({
  walletAccount,
  activeNetworkData,
  signMethod = 'signTransaction',
}) => {
  const [isOpen, _setIsOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [signedTransactions, setSignedTransactions] =
    useState<(Transaction | VersionedTransaction)[]>();

  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isVersioned, setIsVersioned] = useState(true);

  const setIsOpen = (open: boolean) => {
    _setIsOpen(open);
    if (!open) {
      setRecipient('');
      setAmount('');
      setIsVersioned(true);
      setSignedTransactions(undefined);
    }
  };

  const handleSignTransaction = async (e: FormEvent<HTMLFormElement>) => {
    setSignedTransactions(undefined);
    e.preventDefault();

    try {
      setLoading(true);

      const transaction = await createSolanaTransaction({
        amount: amount || '',
        isVersioned,
        rpcUrl: activeNetworkData.rpcUrls.http[0],
        solanaWalletAccount: walletAccount,
        toAddress: recipient || '',
      });

      if (signMethod === 'signAllTransactions') {
        const { signedTransactions } = await signAllTransactions({
          transactions: [transaction, transaction],
          walletAccount,
        });
        setSignedTransactions(signedTransactions);
        return;
      }

      const { signedTransaction } = await signTransaction({
        transaction,
        walletAccount,
      });
      setSignedTransactions([signedTransaction]);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const title =
    signMethod === 'signAllTransactions'
      ? 'Sign All Transactions'
      : 'Sign Transaction';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">{title}</Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[425px]"
        aria-describedby="send-transaction-dialog"
      >
        <DialogTitle>{title}</DialogTitle>
        <form
          onSubmit={handleSignTransaction}
          className="flex flex-col space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              type="text"
              name="recipient"
              placeholder="Enter recipient address"
              required
              value={recipient}
              onChange={(e) => {
                setRecipient(e.target.value);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              type="text"
              name="amount"
              placeholder="Enter amount"
              required
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="isVersioned">Is Versioned</Label>
            <Switch
              id="isVersioned"
              checked={isVersioned}
              onCheckedChange={setIsVersioned}
            />
          </div>
          <Button
            type="submit"
            loading={loading}
            disabled={loading || !recipient || !amount}
          >
            Sign
          </Button>

          {signedTransactions?.map((signedTransaction, index) => (
            <div
              key={`signed-transaction-${index}`}
              className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5"
            >
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                {signedTransactions.length > 1
                  ? `Signature ${index + 1}`
                  : 'Signature'}
              </p>

              <p className="font-mono text-xs text-muted-foreground break-all">
                {signedTransaction.signatures
                  .map((signature) => {
                    if (signature instanceof Uint8Array) {
                      return toBase58(signature);
                    }
                    return (
                      signature as SignaturePubkeyPair
                    ).signature?.toString('hex');
                  })
                  .join(' -- ')}
              </p>
            </div>
          ))}
        </form>
      </DialogContent>
    </Dialog>
  );
};

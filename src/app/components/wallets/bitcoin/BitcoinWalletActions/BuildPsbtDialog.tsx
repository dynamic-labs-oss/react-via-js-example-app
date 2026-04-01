import type { BitcoinWalletAccount } from '@dynamic-labs-sdk/bitcoin';
import type { FeePriority } from '@dynamic-labs-sdk/bitcoin/waas';
import { buildPsbt } from '@dynamic-labs-sdk/bitcoin/waas';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type BuildPsbtDialogProps = {
  walletAccount: BitcoinWalletAccount;
};

export const BuildPsbtDialog: FC<BuildPsbtDialogProps> = ({
  walletAccount,
}) => {
  const [isOpen, _setIsOpen] = useState(false);

  const [recipientAddress, setRecipientAddress] = useState<string>('');

  const [amount, setAmount] = useState<string>('');

  const [feePriority, setFeePriority] = useState<FeePriority>('medium');

  const {
    data: unsignedPsbt,
    error,
    isPending,
    mutate: handleBuildPsbt,
    reset,
  } = useMutation<
    Awaited<ReturnType<typeof buildPsbt>>,
    Error,
    FormEvent<HTMLFormElement>
  >({
    mutationFn: async (e) => {
      e.preventDefault();

      const amountInSatoshis = BigInt(Math.floor(parseFloat(amount) * 1e8));

      return buildPsbt({
        transaction: {
          amount: amountInSatoshis,
          feePriority,
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
      setFeePriority('medium');
      reset();
    }
  };

  const handleCopyPsbt = async () => {
    if (unsignedPsbt?.unsignedPsbtBase64) {
      await navigator.clipboard.writeText(unsignedPsbt.unsignedPsbtBase64);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Build PSBT
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[425px]"
        aria-describedby="build-psbt-dialog"
      >
        <DialogTitle>Build PSBT</DialogTitle>

        <form onSubmit={handleBuildPsbt} className="flex flex-col space-y-4">
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

          <div className="space-y-2">
            <Label>Fee Priority</Label>

            <Select
              value={feePriority}
              onValueChange={(value) => setFeePriority(value as FeePriority)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            loading={isPending}
            disabled={isPending || !recipientAddress || !amount}
          >
            Build PSBT
          </Button>

          {error && (
            <p className="text-sm text-destructive">{error.message}</p>
          )}

          {unsignedPsbt && (
            <div className="space-y-2">
              <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    Unsigned PSBT (Base64)
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPsbt}
                  >
                    Copy
                  </Button>
                </div>
                <textarea
                  readOnly
                  value={unsignedPsbt.unsignedPsbtBase64}
                  className="border-input rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] min-h-[80px] resize-none font-mono w-full text-xs"
                />
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

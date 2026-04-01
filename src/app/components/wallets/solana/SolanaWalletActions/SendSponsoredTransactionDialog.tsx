import type { NetworkData } from '@dynamic-labs-sdk/client';
import type { SolanaWalletAccount } from '@dynamic-labs-sdk/solana';
import { useMutation } from '@tanstack/react-query';
import type { FC, FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

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
import { sendSolanaTokenTransfer } from '../../../../functions/sendTransaction/sendSolanaTokenTransfer';
import { sendSponsoredSolanaTransaction } from '../../../../functions/sendTransaction/sendSponsoredSolanaTransaction';
import { useTokenBalances } from '../../../../hooks/useTokenBalances';
import { formatBalance, formatUsd } from '../../../../utils/formatBalance';
import { validateAddress } from '../../../../utils/validateAddress';
import { ErrorMessage } from '../../../ErrorMessage';

type SendSponsoredTransactionDialogProps = {
  activeNetworkData: NetworkData;
  walletAccount: SolanaWalletAccount;
};

export const SendSponsoredTransactionDialog: FC<
  SendSponsoredTransactionDialogProps
> = ({ walletAccount, activeNetworkData }) => {
  const [isOpen, _setIsOpen] = useState(false);

  const [selectedTokenAddress, setSelectedTokenAddress] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const { tokenBalances, isLoading: isLoadingTokens } =
    useTokenBalances(walletAccount);

  const selectedToken = useMemo(() => {
    if (selectedTokenAddress) {
      return tokenBalances.find(
        (token) => token.address === selectedTokenAddress
      );
    }
    return tokenBalances.find((token) => token.isNative) ?? tokenBalances[0];
  }, [selectedTokenAddress, tokenBalances]);

  const hasInsufficientBalance =
    amount !== '' &&
    selectedToken != null &&
    Number(amount) > selectedToken.balance;

  const addressValidation = useMemo(() => {
    if (!recipient) return undefined;
    return validateAddress('SOL', recipient);
  }, [recipient]);

  const isAddressInvalid =
    recipient.length > 0 && addressValidation != null && !addressValidation.isValid;

  const setIsOpen = (open: boolean) => {
    _setIsOpen(open);
    if (!open) {
      setSelectedTokenAddress('');
      setAmount('');
      setRecipient('');
      reset();
    }
  };

  const handleMaxClick = () => {
    if (selectedToken) {
      setAmount(String(selectedToken.balance));
    }
  };

  const {
    data: signature,
    error,
    mutate: handleSendTransaction,
    isPending,
    reset,
  } = useMutation({
    mutationFn: async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const isNativeTransfer = selectedToken?.isNative !== false;

      if (isNativeTransfer) {
        return sendSponsoredSolanaTransaction({
          activeNetworkData,
          amount,
          recipient,
          walletAccount,
        });
      }

      // SPL token transfer
      if (selectedToken) {
        return sendSolanaTokenTransfer({
          activeNetworkData,
          amount,
          decimals: selectedToken.decimals,
          recipient,
          sponsored: true,
          tokenMintAddress: selectedToken.address,
          walletAccount,
        });
      }

      toast.info('No token selected');
      return undefined;
    },
  });

  const tokenLabel = selectedToken
    ? selectedToken.symbol
    : activeNetworkData.nativeCurrency.symbol;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Send Sponsored Transaction
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[425px]"
        aria-describedby="send-sponsored-transaction-dialog"
      >
        <DialogTitle>Send Sponsored Transaction</DialogTitle>
        <form
          onSubmit={handleSendTransaction}
          className="flex flex-col space-y-4"
        >
          {/* Token Selector */}
          <div className="space-y-2">
            <Label>Token</Label>
            {isLoadingTokens ? (
              <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-input text-sm text-muted-foreground">
                <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
                Loading tokens...
              </div>
            ) : tokenBalances.length > 0 ? (
              <Select
                value={selectedToken?.address ?? ''}
                onValueChange={(value) => {
                  setSelectedTokenAddress(value);
                  setAmount('');
                  reset();
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select token">
                    {selectedToken && (
                      <span className="flex items-center gap-2">
                        {selectedToken.logoURI ? (
                          <img
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            src={selectedToken.logoURI}
                            alt={selectedToken.symbol}
                          />
                        ) : (
                          <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-[8px] font-semibold text-muted-foreground">
                            {selectedToken.symbol?.slice(0, 2)}
                          </span>
                        )}
                        <span className="font-medium">
                          {selectedToken.symbol}
                        </span>
                        <span className="text-muted-foreground">
                          {formatBalance(selectedToken.balance)}
                        </span>
                        {selectedToken.marketValue != null &&
                          selectedToken.marketValue > 0 && (
                            <span className="text-muted-foreground">
                              {formatUsd(selectedToken.marketValue)}
                            </span>
                          )}
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {tokenBalances.map((token) => (
                    <SelectItem key={token.address} value={token.address}>
                      <span className="flex items-center gap-2">
                        {token.logoURI ? (
                          <img
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            src={token.logoURI}
                            alt={token.symbol}
                          />
                        ) : (
                          <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-[8px] font-semibold text-muted-foreground">
                            {token.symbol?.slice(0, 2)}
                          </span>
                        )}
                        <span className="font-medium">{token.symbol}</span>
                        <span className="text-muted-foreground">
                          {formatBalance(token.balance)}
                        </span>
                        {token.marketValue != null &&
                          token.marketValue > 0 && (
                            <span className="text-muted-foreground">
                              {formatUsd(token.marketValue)}
                            </span>
                          )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-input text-sm text-muted-foreground">
                {activeNetworkData.nativeCurrency.symbol} (native)
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({tokenLabel})</Label>
            <div className="relative">
              <Input
                type="text"
                name="amount"
                pattern="^[0-9]*\.?[0-9]*$"
                placeholder="0.001"
                aria-invalid={hasInsufficientBalance || undefined}
                min="0"
                required
                value={amount}
                onChange={(e) => {
                  reset();
                  setAmount(e.target.value);
                }}
                className="pr-14"
              />
              {selectedToken && (
                <button
                  type="button"
                  onClick={handleMaxClick}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
                >
                  Max
                </button>
              )}
            </div>
            <div className="flex justify-between items-center text-sm">
              {hasInsufficientBalance && (
                <span className="text-destructive">Insufficient balance</span>
              )}
              <span className="text-muted-foreground ml-auto tabular-nums">
                {selectedToken ? (
                  <>
                    <span className="font-bold mr-1">
                      {formatBalance(selectedToken.balance)}
                    </span>
                    {selectedToken.symbol}
                    {selectedToken.marketValue != null &&
                      selectedToken.marketValue > 0 && (
                        <span className="ml-1.5">
                          {formatUsd(selectedToken.marketValue)}
                        </span>
                      )}
                  </>
                ) : (
                  <>
                    {activeNetworkData.nativeCurrency.symbol}
                    {' available'}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Recipient */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              type="text"
              name="recipient"
              placeholder="Base58 address"
              aria-invalid={isAddressInvalid || undefined}
              required
              value={recipient}
              onChange={(e) => {
                reset();
                setRecipient(e.target.value);
              }}
            />
            {isAddressInvalid && addressValidation && (
              <p className="text-xs text-destructive">
                {addressValidation.hint}
              </p>
            )}
          </div>

          <Button
            type="submit"
            loading={isPending}
            disabled={
              isPending || hasInsufficientBalance || isAddressInvalid
            }
          >
            Send (Sponsored)
          </Button>

          <ErrorMessage
            error={error}
            defaultMessage="Failed to send sponsored transaction"
            className="text-left"
          />

          {signature && (
            <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                Signature
              </p>
              <p className="font-mono text-xs text-muted-foreground break-all">
                {signature}
              </p>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

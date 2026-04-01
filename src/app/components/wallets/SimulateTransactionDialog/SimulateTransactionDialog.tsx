import type { NetworkData, WalletAccount } from '@dynamic-labs-sdk/client';
import { isEvmWalletAccount } from '@dynamic-labs-sdk/evm';
import { isSolanaWalletAccount } from '@dynamic-labs-sdk/solana';
import { useMutation } from '@tanstack/react-query';
import { Shield } from 'lucide-react';
import type { FC, FormEvent } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { simulateEvmTransactionDemo } from '../../../functions/simulateTransaction/simulateEvmTransactionDemo';
import { simulateSolanaTransactionDemo } from '../../../functions/simulateTransaction/simulateSolanaTransactionDemo';
import { ErrorMessage } from '../../ErrorMessage';
import { AssetDiffDisplay } from './AssetDiffDisplay';
import { FeeDataDisplay } from './FeeDataDisplay';
import { ValidationBadge } from './ValidationBadge';

type SimulateTransactionDialogProps = {
  activeNetworkData: NetworkData;
  balance: string | undefined;
  walletAccount: WalletAccount;
};

export const SimulateTransactionDialog: FC<SimulateTransactionDialogProps> = ({
  walletAccount,
  activeNetworkData,
  balance = '0',
}) => {
  const [isOpen, _setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [includeFees, setIncludeFees] = useState(false);

  const hasInsufficientBalance =
    amount !== '' && Number(amount) > Number(balance);

  const setIsOpen = (open: boolean) => {
    _setIsOpen(open);
    if (!open) {
      setAmount('');
      setRecipient('');
      setIncludeFees(false);
      reset();
    }
  };

  const {
    data: simulationResult,
    error,
    mutate: handleSimulateTransaction,
    isPending,
    reset,
  } = useMutation({
    mutationFn: async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (isEvmWalletAccount(walletAccount)) {
        return simulateEvmTransactionDemo({
          activeNetworkData,
          amount,
          includeFees,
          recipient: recipient as `0x${string}`,
          walletAccount,
        });
      }

      if (isSolanaWalletAccount(walletAccount)) {
        return simulateSolanaTransactionDemo({
          activeNetworkData,
          amount,
          includeFees,
          recipient,
          walletAccount,
        });
      }

      throw new Error('Unsupported wallet account chain for simulation');
    },
  });

  const isSupported =
    isEvmWalletAccount(walletAccount) || isSolanaWalletAccount(walletAccount);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={!isSupported}>
          Simulate Transaction
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        aria-describedby="simulate-transaction-dialog"
      >
        <DialogTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Simulate Transaction
        </DialogTitle>
        <form
          onSubmit={handleSimulateTransaction}
          className="flex flex-col gap-4"
        >
          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Amount ({activeNetworkData.nativeCurrency.symbol}):
            </label>
            <input
              type="text"
              name="amount"
              pattern="^[0-9]*\.?[0-9]*$"
              placeholder="0.001"
              className={`w-full rounded-sm p-2 border ${
                hasInsufficientBalance ? 'border-red-500' : 'border-border'
              }`}
              min="0"
              required
              value={amount}
              onChange={(e) => {
                reset();
                setAmount(e.target.value);
              }}
            />
            <div className="flex justify-between items-center text-xs">
              {hasInsufficientBalance && (
                <span className="text-red-500">Insufficient balance</span>
              )}
              <span className="text-gray-500 ml-auto">
                <span className="font-bold mr-1">{balance}</span>{' '}
                {activeNetworkData.nativeCurrency.symbol} available
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="recipient" className="text-sm font-medium">
              To:
            </label>
            <input
              type="text"
              name="recipient"
              placeholder="Enter recipient address"
              className="w-full rounded-sm p-2 border border-border"
              required
              value={recipient}
              onChange={(e) => {
                reset();
                setRecipient(e.target.value);
              }}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeFees"
              checked={includeFees}
              onCheckedChange={(checked) => setIncludeFees(checked as boolean)}
            />
            <label
              htmlFor="includeFees"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Include fee estimation
            </label>
          </div>

          <Button
            type="submit"
            loading={isPending}
            disabled={isPending || hasInsufficientBalance}
          >
            Simulate
          </Button>

          <ErrorMessage
            error={error}
            defaultMessage="Failed to simulate transaction"
            className="text-left"
          />

          {simulationResult && (
            <div className="space-y-3 mt-2 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold">Simulation Results</h3>

              {simulationResult.validation && (
                <ValidationBadge validation={simulationResult.validation} />
              )}

              {simulationResult.feeData && (
                <FeeDataDisplay feeData={simulationResult.feeData} />
              )}

              <AssetDiffDisplay
                assets={simulationResult.outAssets}
                type="out"
              />

              <AssetDiffDisplay assets={simulationResult.inAssets} type="in" />

              {simulationResult.counterparties &&
                simulationResult.counterparties.length > 0 && (
                  <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                    <p className="text-sm font-semibold mb-2">Counterparties</p>
                    <div className="space-y-1">
                      {simulationResult.counterparties.map((party, idx) => (
                        <p
                          key={idx}
                          className="text-xs font-mono text-muted-foreground break-all"
                        >
                          {party}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

              {simulationResult.priceData && (
                <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                  <p className="text-sm font-semibold mb-2">Price Data</p>
                  <div className="space-y-1 text-xs">
                    {simulationResult.priceData.nativeTokenUsdPrice && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Native Token Price:
                        </span>
                        <span className="font-mono">
                          $
                          {simulationResult.priceData.nativeTokenUsdPrice.toFixed(
                            4
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Show Total Fiat:
                      </span>
                      <span className="font-mono">
                        {simulationResult.showTotalFiat ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

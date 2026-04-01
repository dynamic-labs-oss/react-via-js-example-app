import type {
  KrakenAccount,
  KrakenTransferRequest,
  TransferDestinationResponse,
} from '@dynamic-labs-sdk/client';
import {
  getKrakenAccounts,
  getKrakenWhitelistedAddresses,
} from '@dynamic-labs-sdk/client';
import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type KrakenTransferFormProps = {
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (data: KrakenTransferRequest) => void;
};

export const KrakenTransferForm: FC<KrakenTransferFormProps> = ({
  isPending,
  onCancel,
  onSubmit,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>('');

  // Fetch Kraken accounts
  const { data: accounts, isLoading: isLoadingAccounts } = useQuery<
    KrakenAccount[],
    Error,
    KrakenAccount[],
    [string]
  >({
    queryFn: () => getKrakenAccounts(),
    queryKey: ['krakenAccounts'],
  });

  // Fetch whitelisted addresses
  const { data: whitelistedData, isLoading: isLoadingWhitelisted } = useQuery<
    TransferDestinationResponse,
    Error,
    TransferDestinationResponse,
    [string]
  >({
    queryFn: () => getKrakenWhitelistedAddresses(),
    queryKey: ['krakenWhitelistedAddresses'],
  });

  const selectedAccount = accounts?.find((acc) => acc.id === selectedAccountId);

  const selectedBalance = selectedAccount?.balances.find(
    (b) => b.currency === currency
  );

  // Reset currency when account changes
  useEffect(() => {
    if (selectedAccount && selectedAccount.balances.length > 0) {
      setCurrency(selectedAccount.balances[0].currency);
    } else {
      setCurrency('');
    }
  }, [selectedAccountId, selectedAccount]);

  const availableDestinations =
    whitelistedData?.destinations.filter((dest) =>
      dest.tokens?.includes(currency)
    ) || [];

  const hasAllRequiredFields =
    !!selectedAccountId && !!destinationAddress && !!amount && !!currency;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit({
      accountId: selectedAccountId,
      amount: parseFloat(amount),
      currency,
      description: 'Transfer from Kraken',
      to: destinationAddress,
    });
  };

  if (isLoadingAccounts || isLoadingWhitelisted) {
    return <div className="p-4 text-center">Loading Kraken data...</div>;
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="p-4 text-center space-y-3">
        <p className="text-muted-foreground">No Kraken accounts found.</p>
        <p className="text-sm text-muted-foreground">
          Please connect your Kraken account in the{' '}
          <strong>Exchange Connections</strong> section above, then try again.
        </p>
      </div>
    );
  }

  return (
    <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label>Kraken Account</Label>
        <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
          <SelectTrigger>
            <SelectValue placeholder="Select an account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name ||
                  account.type ||
                  `Account ${account.id.slice(0, 8)}`}{' '}
                ({account.balances.length}{' '}
                {account.balances.length === 1 ? 'currency' : 'currencies'})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedAccount && (
        <>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Select a currency" />
              </SelectTrigger>
              <SelectContent>
                {selectedAccount.balances.map((balance) => (
                  <SelectItem key={balance.currency} value={balance.currency}>
                    {balance.currency} - Balance: {balance.balance}
                    {balance.availableBalance !== undefined &&
                      ` (Available: ${balance.availableBalance})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
              }}
              placeholder="0.5"
            />
            {selectedBalance && (
              <p className="text-sm text-muted-foreground">
                Available:{' '}
                {selectedBalance.availableBalance ?? selectedBalance.balance}{' '}
                {selectedBalance.currency}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Destination Address</Label>
            {whitelistedData?.enforcesAddressWhitelist &&
            availableDestinations.length > 0 ? (
              <Select
                value={destinationAddress}
                onValueChange={setDestinationAddress}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a whitelisted address" />
                </SelectTrigger>
                <SelectContent>
                  {availableDestinations.map((dest) => (
                    <SelectItem key={dest.address} value={dest.address}>
                      {dest.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type="text"
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                placeholder="0x..."
              />
            )}
            {whitelistedData?.enforcesAddressWhitelist &&
              availableDestinations.length === 0 && (
                <p className="text-sm text-yellow-600">
                  No whitelisted addresses for {currency}. Add one in your
                  Kraken account.
                </p>
              )}
          </div>
        </>
      )}

      <div className="flex gap-2">
        <Button
          type="submit"
          className="w-1/2"
          loading={isPending}
          disabled={isPending || !hasAllRequiredFields}
        >
          Transfer
        </Button>
        <Button
          variant="outline"
          className="w-1/2"
          disabled={isPending}
          onClick={onCancel}
          type="button"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

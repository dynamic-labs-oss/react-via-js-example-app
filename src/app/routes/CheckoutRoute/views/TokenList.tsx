import type { WalletAccount } from '@dynamic-labs-sdk/client';
import { getBalances } from '@dynamic-labs-sdk/client';
import { useQuery } from '@tanstack/react-query';
import { type FC, useState } from 'react';

import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';

type TokenListProps = {
  minMarketValue: number;
  onTokenSelect: (tokenAddress: string) => void;
  walletAccount: WalletAccount;
};

const ManualTokenInput: FC<{ onTokenSelect: (address: string) => void }> = ({
  onTokenSelect,
}) => {
  const [tokenAddress, setTokenAddress] = useState('');

  return (
    <div className="space-y-2">
      <Input
        placeholder="Enter token address"
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value.trim())}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && tokenAddress) onTokenSelect(tokenAddress);
        }}
      />
      <Button
        className="w-full"
        size="sm"
        disabled={!tokenAddress}
        onClick={() => onTokenSelect(tokenAddress)}
      >
        Use token
      </Button>
    </div>
  );
};

export const TokenList: FC<TokenListProps> = ({
  minMarketValue,
  onTokenSelect,
  walletAccount,
}) => {
  const { data, error, isLoading, refetch } = useQuery({
    enabled: !!walletAccount,
    queryFn: () =>
      getBalances({
        filterSpamTokens: true,
        includeNative: true,
        includePrices: true,
        walletAccount,
      }),
    queryKey: ['checkoutTokenBalances', walletAccount.id],
  });

  const balances = (data ?? []).filter(
    (token) => token.marketValue === undefined || token.marketValue >= minMarketValue
  );

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Loading balances...
      </p>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 py-4">
        <p className="text-sm text-destructive text-center">
          Failed to load balances
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => void refetch()}
            className="w-full text-sm py-2 px-3 rounded-md border border-border hover:bg-muted/50 transition-colors cursor-pointer"
          >
            Retry
          </button>
          <p className="text-sm text-muted-foreground text-center">OR</p>
          <ManualTokenInput onTokenSelect={onTokenSelect} />
        </div>
      </div>
    );
  }

  if (balances.length === 0) {
    return (
      <div className="space-y-6 py-2">
        <p className="text-sm text-muted-foreground text-center">
          No tokens found with sufficient balance.
        </p>
        <ManualTokenInput onTokenSelect={onTokenSelect} />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {balances.map((token) => (
        <button
          type="button"
          key={`${token.address}-${token.symbol}`}
          className="flex w-full items-center justify-between py-2 px-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => onTokenSelect(token.address)}
        >
          <div className="flex items-center gap-2">
            {token.logoURI ? (
              <img
                src={token.logoURI}
                alt={token.symbol}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                {token.symbol.slice(0, 2)}
              </div>
            )}
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{token.symbol}</span>
              <span className="text-xs text-muted-foreground">{token.name}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium">{token.balance}</span>
            {token.marketValue !== undefined && (
              <span className="text-xs text-muted-foreground">
                ${token.marketValue.toFixed(2)}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

import type { NetworkData } from '@dynamic-labs-sdk/client';
import { Search, X } from 'lucide-react';
import type { FC, FormEvent } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NetworkItem } from './NetworkItem';

const CHAIN_LABELS: Record<string, string> = {
  APTOS: 'Aptos',
  BTC: 'Bitcoin',
  COSMOS: 'Cosmos',
  EVM: 'EVM',
  SOL: 'Solana',
  STARK: 'Starknet',
  SUI: 'Sui',
  TON: 'TON',
  TRON: 'Tron',
};

export const ChainSection: FC<{ networksData: NetworkData[] }> = ({
  networksData,
}) => {
  const chain = networksData[0].chain;
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [showSearch, setShowSearch] = useState(false);

  const handleOnSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = (e.target as HTMLFormElement).address.value.trim();
    if (value) {
      setAddress(value);
    }
  };

  const handleClearSearch = () => {
    setAddress(undefined);
    setShowSearch(false);
  };

  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-card">
      {/* Section header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-semibold text-foreground">
            {CHAIN_LABELS[chain] ?? chain}
          </h2>
          <span className="text-[11px] font-medium text-muted-foreground bg-muted rounded px-1.5 py-0.5">
            {networksData.length}
          </span>
        </div>

        {!showSearch ? (
          <button
            onClick={() => setShowSearch(true)}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer"
          >
            <Search className="w-3 h-3" />
            Look up balance
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <form
              className="flex items-center gap-1.5"
              onSubmit={handleOnSubmit}
            >
              <Input
                type="text"
                name="address"
                placeholder="Wallet address..."
                className="h-7 text-xs w-48 sm:w-56"
                autoFocus
              />
              <Button
                variant="outline"
                type="submit"
                size="sm"
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <Search className="w-3 h-3" />
              </Button>
            </form>
            <button
              onClick={handleClearSearch}
              className="text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Network rows */}
      <div className="px-3 pb-3">
        <div className="rounded-xl border border-border/40 overflow-hidden divide-y divide-border/30">
          {networksData.map((data) => (
            <NetworkItem
              key={`${data.chain}-${data.networkId}`}
              networkData={data}
              address={address}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

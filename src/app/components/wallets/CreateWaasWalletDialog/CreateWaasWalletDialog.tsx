import { createWaasWalletAccounts } from '@dynamic-labs-sdk/client/waas';
import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const SUPPORTED_CHAINS = [
  { label: 'Bitcoin', value: 'BTC' },
  { label: 'EVM', value: 'EVM' },
  { label: 'Solana', value: 'SOL' },
  { label: 'Sui', value: 'SUI' },
] as const;

export const CreateWaasWalletDialog: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleChain = useCallback((chain: string) => {
    setSelectedChains((prev) =>
      prev.includes(chain) ? prev.filter((c) => c !== chain) : [...prev, chain]
    );
  }, []);

  const handleCreateWallets = useCallback(async () => {
    if (selectedChains.length === 0) {
      toast.error('Please select at least one chain');
      return;
    }

    setIsLoading(true);

    try {
      await createWaasWalletAccounts({
        chains: selectedChains,
        password: password || undefined,
      });

      toast.success('WaaS wallets created successfully', {
        description: `Created ${selectedChains.length} wallet${
          selectedChains.length > 1 ? 's' : ''
        }`,
      });

      setIsOpen(false);
      setPassword('');
      setSelectedChains([]);
    } catch (error) {
      toast.error('Failed to create WaaS wallets', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedChains, password]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Create Embedded
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogTitle>Create WaaS Wallet</DialogTitle>

        <DialogDescription className="flex flex-col gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Select Chains</h3>
            <p className="text-sm">
              Choose which blockchain networks to create wallets for.
            </p>

            <div className="space-y-3">
              {SUPPORTED_CHAINS.map((chain) => (
                <div
                  key={chain.value}
                  className="flex items-center justify-between"
                >
                  <Label htmlFor={`chain-${chain.value}`}>
                    {chain.label}
                  </Label>
                  <Switch
                    id={`chain-${chain.value}`}
                    checked={selectedChains.includes(chain.value)}
                    onCheckedChange={() => handleToggleChain(chain.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <h3 className="font-semibold">Password (Optional)</h3>
            <p className="text-sm">
              Add a password to encrypt your wallet. Leave empty for
              passwordless wallet.
            </p>

            <div className="space-y-2">
              <Label htmlFor="wallet-password">Password</Label>
              <Input
                id="wallet-password"
                type="password"
                placeholder="Enter password (optional)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {selectedChains.length > 0 && (
            <div className="p-3 bg-primary/5 rounded-lg text-sm">
              <p className="font-medium">Selected chains:</p>
              <p className="text-muted-foreground">
                {selectedChains
                  .map(
                    (chain) =>
                      SUPPORTED_CHAINS.find((c) => c.value === chain)?.label
                  )
                  .join(', ')}
              </p>
            </div>
          )}
        </DialogDescription>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={() => handleCreateWallets()}
            disabled={isLoading || selectedChains.length === 0}
          >
            {isLoading ? 'Creating...' : 'Create Wallets'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

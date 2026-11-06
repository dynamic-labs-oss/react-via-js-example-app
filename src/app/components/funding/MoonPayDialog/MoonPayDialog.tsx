import type { Chain, GetMoonPayUrlParams, MoonPayCurrency } from '@dynamic-labs-sdk/client';
import { getMoonPayCurrencies, getMoonPayUrl } from '@dynamic-labs-sdk/client';
import { useGetWalletAccounts } from '@dynamic-labs-sdk/react-hooks';
import { useMutation } from '@tanstack/react-query';
import type { FC } from 'react';
import { useEffect, useState } from 'react';

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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ErrorMessage } from '../../ErrorMessage';

type ChainOption = { label: string; value: Chain };

// Chains with confirmed MoonPay support, derived from redcoast's DYNAMIC_TO_MOONPAY_NETWORK_CODE.
const MOONPAY_CHAIN_OPTIONS: ChainOption[] = [
  { label: 'EVM', value: 'EVM' },
  { label: 'Solana', value: 'SOL' },
  { label: 'Bitcoin', value: 'BTC' },
  { label: 'Sui', value: 'SUI' },
  { label: 'TON', value: 'TON' },
  { label: 'Aptos', value: 'APTOS' },
  { label: 'Cosmos', value: 'COSMOS' },
  { label: 'Stellar', value: 'STELLAR' },
  { label: 'Tron', value: 'TRON' },
  { label: 'Algorand', value: 'ALGO' },
  { label: 'Flow', value: 'FLOW' },
  { label: 'Starknet', value: 'STARK' },
];

type EvmNetworkOption = { label: string; value: string };

// EVM chains supported by MoonPay, keyed by chainId — matches redcoast's DYNAMIC_TO_MOONPAY_NETWORK_CODE for the EVM chain.
const EVM_NETWORK_OPTIONS: EvmNetworkOption[] = [
  { label: 'Ethereum (1)', value: '1' },
  { label: 'Base (8453)', value: '8453' },
  { label: 'Polygon (137)', value: '137' },
  { label: 'Arbitrum (42161)', value: '42161' },
  { label: 'Optimism (10)', value: '10' },
  { label: 'BSC (56)', value: '56' },
  { label: 'ZkSync (324)', value: '324' },
  { label: 'Avalanche (43114)', value: '43114' },
];

const isValidWalletAddress = (address: string) =>
  /^0x[0-9a-fA-F]{40}$/.test(address) || /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);

// Mirrors the host validation in getMoonPayUrl: only https MoonPay domains
// (moonpay.com or any subdomain) are trusted. The trailing boundary group stops
// lookalikes such as evilmoonpay.com or moonpay.com.attacker.io from matching.
const isTrustedMoonPayUrl = (url: string): boolean =>
  /^https:\/\/([a-z0-9-]+\.)*moonpay\.com([/?#]|$)/i.test(url);

export const MoonPayDialog: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chain, setChain] = useState<Chain>('EVM');
  const [networkId, setNetworkId] = useState('');
  const [token, setToken] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [currencies, setCurrencies] = useState<MoonPayCurrency[]>([]);
  const [isFetchingCurrencies, setIsFetchingCurrencies] = useState(false);
  const [walletAddressError, setWalletAddressError] = useState('');
  const [currenciesError, setCurrenciesError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState('');

  const { data: walletAccounts } = useGetWalletAccounts();

  // Address of the connected wallet that matches the selected chain, if any.
  const chainWalletAddress =
    walletAccounts.find((wa) => wa.chain === chain)?.address ?? '';

  // Autofill the wallet address with the connected account for the selected chain.
  // Keyed on the derived address so a manual selection within the same chain is preserved,
  // while switching to a chain with no matching account clears the stale address.
  useEffect(() => {
    setWalletAddress(chainWalletAddress);
    setWalletAddressError('');
  }, [chainWalletAddress]);

  const {
    error,
    mutate: onGetMoonPayUrl,
    isPending,
    reset,
  } = useMutation<string, Error, GetMoonPayUrlParams>({
    mutationFn: (params) => getMoonPayUrl(params),
    onSuccess: (url) => {
      // Defense-in-depth: getMoonPayUrl already validates the host, but re-check
      // here before opening so a malformed URL can never reach window.open.
      if (isTrustedMoonPayUrl(url)) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    },
  });

  const handleClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Clear all form state so a reopened dialog never shows stale inputs.
      reset();
      setCurrencies([]);
      setNetworkId('');
      setToken('');
      setTokenAmount('');
      setWalletAddressError('');
      setCurrenciesError(null);
    }
  };

  const handleChainChange = (value: string) => {
    setChain(value as Chain);
    setNetworkId('');
  };

  const handleFetchCurrencies = async () => {
    setIsFetchingCurrencies(true);
    setCurrenciesError(null);
    try {
      const result = await getMoonPayCurrencies({
        chain,
        ...(networkId ? { networkId } : {}),
      });
      setCurrencies(result);
    } catch (err) {
      setCurrenciesError(err instanceof Error ? err.message : 'Failed to fetch currencies');
    } finally {
      setIsFetchingCurrencies(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Parse defensively: a non-numeric value bypassing the input's HTML5
    // validation must not send NaN to the API.
    const parsedTokenAmount = Number.parseFloat(tokenAmount);
    const hasValidTokenAmount =
      Number.isFinite(parsedTokenAmount) && parsedTokenAmount > 0;
    onGetMoonPayUrl({
      chain,
      walletAddress,
      ...(networkId ? { networkId } : {}),
      ...(token ? { token } : {}),
      ...(hasValidTokenAmount ? { tokenAmount: parsedTokenAmount } : {}),
    });
  };

  const evmNeedsNetwork = chain === 'EVM' && !networkId;
  const hasAllRequiredFields = !!walletAddress && !walletAddressError && !evmNeedsNetwork;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>Open MoonPay</Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogTitle>MoonPay Onramp</DialogTitle>

        <ErrorMessage error={error} />

        <form className="mt-2 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Chain</Label>
            <Select value={chain} onValueChange={handleChainChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select chain" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {MOONPAY_CHAIN_OPTIONS.map(({ label, value }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {chain === 'EVM' && (
            <div className="space-y-2">
              <Label>Network (required for EVM)</Label>
              <Select value={networkId} onValueChange={setNetworkId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {EVM_NETWORK_OPTIONS.map(({ label, value }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Wallet address</Label>
            {walletAccounts.length > 0 ? (
              <Select value={walletAddress} onValueChange={setWalletAddress}>
                <SelectTrigger className="w-full font-mono text-xs">
                  <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {walletAccounts.map((wa, i) => (
                      <SelectItem key={`${i}-${wa.address}`} value={wa.address} className="font-mono text-xs">
                        {wa.address}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex flex-col gap-1">
                <Input
                  value={walletAddress}
                  onChange={(e) => {
                    const val = e.target.value;
                    setWalletAddress(val);
                    setWalletAddressError(
                      val && !isValidWalletAddress(val) ? 'Invalid wallet address format' : '',
                    );
                  }}
                  placeholder="0x... or base58..."
                  className={`font-mono text-xs${walletAddressError ? ' border-red-500' : ''}`}
                />
                {walletAddressError && (
                  <span className="text-xs text-red-500">{walletAddressError}</span>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Token symbol (optional)</Label>
            <Input
              value={token}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^[A-Za-z0-9]{1,10}$/.test(val)) {
                  setToken(val);
                }
              }}
              placeholder="e.g. USDC, SOL, BTC"
              maxLength={10}
            />
          </div>

          <div className="space-y-2">
            <Label>Token amount (optional)</Label>
            <Input
              type="number"
              min="0"
              step="any"
              value={tokenAmount}
              onChange={(e) => setTokenAmount(e.target.value)}
              placeholder="e.g. 0.1"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              className="w-1/2"
              loading={isPending}
              disabled={isPending || !hasAllRequiredFields}
            >
              Open MoonPay
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-1/2"
              loading={isFetchingCurrencies}
              disabled={isFetchingCurrencies || !chain || evmNeedsNetwork}
              onClick={handleFetchCurrencies}
            >
              List currencies
            </Button>
          </div>
        </form>

        {currenciesError && (
          <p className="text-xs text-red-500">{currenciesError}</p>
        )}

        {currencies.length > 0 && (
          <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-border/60">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-muted/80">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Code</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Name</th>
                </tr>
              </thead>
              <tbody>
                {currencies.map((c) => (
                  <tr
                    key={c.code}
                    className="border-t border-border/30 cursor-pointer hover:bg-muted/40"
                    onClick={() => setToken(c.code)}
                  >
                    <td className="px-3 py-1.5 font-mono">{c.code}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{c.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

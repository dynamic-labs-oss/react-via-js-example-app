import { useAtomValue, useSetAtom } from 'jotai';
import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTokenBalances } from '../../../hooks/useTokenBalances';
import { formatBalance } from '../../../utils/formatBalance';
import { NetworkSwitcher } from '../../wallets/NetworkSwitcher';
import { NATIVE_TOKEN_VALUE, OTHER_TOKEN_VALUE } from '../constants';
import {
  activeNetworkDataAtom,
  amountAtom,
  handleAmountChangeAtom,
  handleNetworkUpdatedAtom,
  handleSourceChangeAtom,
  walletAccountAtom,
} from '../swap.atoms';
import { TokenIcon } from '../TokenIcon';

export const SourceSection: FC = () => {
  const walletAccount = useAtomValue(walletAccountAtom)!;
  const activeNetworkData = useAtomValue(activeNetworkDataAtom)!;
  const amount = useAtomValue(amountAtom);
  const handleSourceChange = useSetAtom(handleSourceChangeAtom);
  const handleAmountChange = useSetAtom(handleAmountChangeAtom);
  const handleNetworkUpdated = useSetAtom(handleNetworkUpdatedAtom);

  const [isManualToken, setIsManualToken] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [manualDecimals, setManualDecimals] = useState('18');
  const [selectedAddress, setSelectedAddress] = useState('');

  const { tokenBalances, isLoading: isLoadingTokens } =
    useTokenBalances(walletAccount);

  const selectedToken = useMemo(() => {
    if (selectedAddress) {
      return tokenBalances.find((token) => token.address === selectedAddress);
    }
    return tokenBalances.find((token) => token.isNative) ?? tokenBalances[0];
  }, [selectedAddress, tokenBalances]);

  const hasBalances = tokenBalances.length > 0;

  useEffect(() => {
    if (isLoadingTokens || isManualToken) return;

    if (selectedToken) {
      handleSourceChange({
        decimals: selectedToken.decimals,
        tokenAddress: selectedToken.address,
      });
    } else {
      handleSourceChange({
        decimals: activeNetworkData.nativeCurrency.decimals,
        tokenAddress: '0x0000000000000000000000000000000000000000',
      });
    }
  }, [isLoadingTokens, selectedToken, activeNetworkData, handleSourceChange, isManualToken]);

  const hasInsufficientBalance =
    amount !== '' &&
    selectedToken != null &&
    Number(amount) > selectedToken.balance;

  const tokenLabel = isManualToken
    ? 'tokens'
    : selectedToken
    ? selectedToken.symbol
    : activeNetworkData.nativeCurrency.symbol;

  const handleNetworkSwitched = (network: Parameters<typeof handleNetworkUpdated>[0]) => {
    setSelectedAddress('');
    setIsManualToken(false);
    setManualAddress('');
    setManualDecimals('18');
    handleNetworkUpdated(network);
  };

  const handleBalanceTokenChange = (address: string) => {
    setIsManualToken(false);
    setSelectedAddress(address);
    const token = tokenBalances.find((t) => t.address === address);
    if (token) {
      handleSourceChange({ decimals: token.decimals, tokenAddress: token.address });
    }
    handleAmountChange('');
  };

  const handleNoBalanceSelectChange = (value: string) => {
    handleAmountChange('');
    if (value === OTHER_TOKEN_VALUE) {
      setIsManualToken(true);
      setManualAddress('');
      setManualDecimals('');
      handleSourceChange({ decimals: 18, tokenAddress: '' });
    } else {
      setIsManualToken(false);
      handleSourceChange({
        decimals: activeNetworkData.nativeCurrency.decimals,
        tokenAddress: '0x0000000000000000000000000000000000000000',
      });
    }
  };

  const noBalanceSelectValue = isManualToken
    ? OTHER_TOKEN_VALUE
    : NATIVE_TOKEN_VALUE;

  const nativeCurrency = activeNetworkData.nativeCurrency;

  const NativeTokenLabel = (
    <span className="flex items-center gap-2">
      <TokenIcon
        symbol={nativeCurrency.symbol}
        logoURI={nativeCurrency.iconUrl}
      />
      <span className="font-medium">{nativeCurrency.symbol}</span>
      <span className="text-muted-foreground">(native)</span>
    </span>
  );

  return (
    <fieldset className="space-y-3 rounded-xl border border-border/50 p-4">
      <legend className="text-xs font-semibold text-muted-foreground px-1">
        From
      </legend>

      <div className="space-y-1.5">
        <Label className="text-xs">Network</Label>
        <NetworkSwitcher
          walletAccount={walletAccount}
          onNetworkUpdated={handleNetworkSwitched}
          variant="full"
          hideTestnets={true}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Token</Label>
        {isLoadingTokens ? (
          <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-input text-sm text-muted-foreground">
            <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
            Loading tokens...
          </div>
        ) : hasBalances ? (
          <Select
            value={selectedToken?.address ?? ''}
            onValueChange={handleBalanceTokenChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select token">
                {selectedToken && (
                  <span className="flex items-center gap-2">
                    <TokenIcon
                      symbol={selectedToken.symbol}
                      logoURI={selectedToken.logoURI}
                    />
                    <span className="font-medium">{selectedToken.symbol}</span>
                    <span className="text-muted-foreground">
                      {formatBalance(selectedToken.balance)}
                    </span>
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {tokenBalances.map((token) => (
                <SelectItem key={token.address} value={token.address}>
                  <span className="flex items-center gap-2">
                    <TokenIcon symbol={token.symbol} logoURI={token.logoURI} />
                    <span className="font-medium">{token.symbol}</span>
                    <span className="text-muted-foreground">
                      {formatBalance(token.balance)}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <>
            <Select
              value={noBalanceSelectValue}
              onValueChange={handleNoBalanceSelectChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {isManualToken ? (
                    <span className="text-muted-foreground">
                      Other (enter manually)
                    </span>
                  ) : (
                    NativeTokenLabel
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NATIVE_TOKEN_VALUE}>
                  {NativeTokenLabel}
                </SelectItem>
                <SelectItem value={OTHER_TOKEN_VALUE}>
                  <span className="text-muted-foreground">
                    Other (enter manually)
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>

            {isManualToken && (
              <div className="space-y-2 mt-2">
                <Label className="text-xs">Token Address</Label>
                <Input
                  type="text"
                  placeholder="Token contract address (0x...)"
                  required
                  value={manualAddress}
                  onChange={(e) => {
                    setManualAddress(e.target.value);
                    handleSourceChange({
                      decimals: Number(manualDecimals) || 18,
                      tokenAddress: e.target.value,
                    });
                  }}
                />
                <Label className="text-xs">Decimals</Label>
                <Input
                  type="number"
                  placeholder="18"
                  min="0"
                  max="36"
                  required
                  value={manualDecimals}
                  onChange={(e) => {
                    setManualDecimals(e.target.value);
                    handleSourceChange({
                      decimals: Number(e.target.value) || 18,
                      tokenAddress: manualAddress,
                    });
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="swap-amount" className="text-xs">
          Amount ({tokenLabel})
        </Label>
        <div className="relative">
          <Input
            type="text"
            name="swap-amount"
            pattern="^[0-9]*\.?[0-9]*$"
            placeholder="0.01"
            aria-invalid={hasInsufficientBalance || undefined}
            required
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="pr-14"
          />
          {selectedToken && (
            <button
              type="button"
              onClick={() => handleAmountChange(String(selectedToken.balance))}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              Max
            </button>
          )}
        </div>
        {hasInsufficientBalance && (
          <p className="text-xs text-destructive">Insufficient balance</p>
        )}
      </div>
    </fieldset>
  );
};

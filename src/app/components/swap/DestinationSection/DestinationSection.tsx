import { useAtomValue, useSetAtom } from 'jotai';
import type { FC } from 'react';
import { useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OTHER_TOKEN_VALUE } from '../constants';
import {
  activeNetworkDataAtom,
  handleDestinationChangeAtom,
  walletAccountAtom,
} from '../swap.atoms';
import { TokenIcon } from '../TokenIcon';
import { getTokenPresetsForChain } from '../utils/getTokenPresetsForChain';

export const DestinationSection: FC = () => {
  const walletAccount = useAtomValue(walletAccountAtom)!;
  const activeNetworkData = useAtomValue(activeNetworkDataAtom)!;
  const handleDestinationChange = useSetAtom(handleDestinationChangeAtom);

  const [isManualToken, setIsManualToken] = useState(false);
  const [manualNetworkId, setManualNetworkId] = useState('');
  const [manualTokenAddress, setManualTokenAddress] = useState('');
  const [selectedValue, setSelectedValue] = useState('');

  const presetTokens = useMemo(
    () => getTokenPresetsForChain(walletAccount.chain),
    [walletAccount.chain]
  );

  const selectValue = isManualToken ? OTHER_TOKEN_VALUE : selectedValue;

  const selectedPreset = useMemo(() => {
    if (!selectedValue || isManualToken) return undefined;
    const [networkId, ...addressParts] = selectedValue.split(':');
    const address = addressParts.join(':');
    return presetTokens.find(
      (t) => t.networkId === networkId && t.address === address
    );
  }, [presetTokens, selectedValue, isManualToken]);

  const handleSelectChange = (value: string) => {
    if (value === OTHER_TOKEN_VALUE) {
      setIsManualToken(true);
      setManualNetworkId(activeNetworkData.networkId);
      setManualTokenAddress('');
      setSelectedValue('');
      handleDestinationChange({ networkId: activeNetworkData.networkId, tokenAddress: '' });
    } else {
      setIsManualToken(false);
      setManualTokenAddress('');
      setManualNetworkId('');
      setSelectedValue(value);
      const [networkId, ...addressParts] = value.split(':');
      const address = addressParts.join(':');
      handleDestinationChange({ networkId, tokenAddress: address });
    }
  };

  return (
    <fieldset className="space-y-3 rounded-xl border border-border/50 p-4">
      <legend className="text-xs font-semibold text-muted-foreground px-1">
        To
      </legend>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Destination</Label>
          <Select value={selectValue} onValueChange={handleSelectChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select destination">
                {isManualToken ? (
                  <span className="text-muted-foreground">
                    Other (enter manually)
                  </span>
                ) : (
                  selectedPreset && (
                    <span className="flex items-center gap-2">
                      <TokenIcon
                        symbol={selectedPreset.symbol}
                        logoURI={selectedPreset.logoURI}
                      />
                      <span className="font-medium">
                        {selectedPreset.displayName}
                      </span>
                    </span>
                  )
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {presetTokens.map((token) => (
                <SelectItem
                  key={`${token.networkId}:${token.address}`}
                  value={`${token.networkId}:${token.address}`}
                >
                  <span className="flex items-center gap-2">
                    <TokenIcon symbol={token.symbol} logoURI={token.logoURI} />
                    <span className="font-medium">{token.displayName}</span>
                  </span>
                </SelectItem>
              ))}
              <SelectItem value={OTHER_TOKEN_VALUE}>
                <span className="text-muted-foreground">
                  Other (enter manually)
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isManualToken && (
          <div className="space-y-2">
            <Label className="text-xs">Network ID</Label>
            <Input
              type="text"
              placeholder="Network ID (e.g. 1, 137, 8453)"
              required
              value={manualNetworkId}
              onChange={(e) => {
                setManualNetworkId(e.target.value);
                handleDestinationChange({
                  networkId: e.target.value,
                  tokenAddress: manualTokenAddress,
                });
              }}
            />
            <Label className="text-xs">Token Contract Address</Label>
            <Input
              type="text"
              placeholder="Token contract address (0x...)"
              required
              value={manualTokenAddress}
              onChange={(e) => {
                setManualTokenAddress(e.target.value);
                handleDestinationChange({
                  networkId: manualNetworkId,
                  tokenAddress: e.target.value,
                });
              }}
            />
          </div>
        )}
      </div>
    </fieldset>
  );
};

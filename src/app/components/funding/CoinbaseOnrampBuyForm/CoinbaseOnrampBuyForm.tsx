import type { CoinbaseOnrampGetBuyUrlRequest } from '@dynamic-labs-sdk/client';
import type { FC } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CoinbaseNetworkSelectOrInput } from '../CoinbaseNetworkSelectOrInput';
import { CryptoCurrencySelectOrInput } from '../CryptoCurrencySelectOrInput';
import { FiatCurrencySelectOrInput } from '../FiatCurrencySelectOrInput';
import { WalletAddressSelectOrInput } from '../WalletAddressSelectOrInput';

type CoinbaseOnrampBuyFormProps = {
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (data: CoinbaseOnrampGetBuyUrlRequest) => void;
};

export const CoinbaseOnrampBuyForm: FC<CoinbaseOnrampBuyFormProps> = ({
  isPending,
  onCancel,
  onSubmit,
}) => {
  const [destinationAddress, setDestinationAddress] = useState<string>('');

  const [network, setNetwork] = useState<string>('');

  const [fiatCurrency, setFiatCurrency] = useState<string>('');

  const [defaultAsset, setDefaultAsset] = useState<string>('');

  const [cryptoAmount, setCryptoAmount] = useState<string>('');

  const hasAllRequiredFields =
    !!destinationAddress &&
    !!network &&
    !!fiatCurrency &&
    !!defaultAsset &&
    !!cryptoAmount;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit({
      defaultAsset,
      destinationAddress,
      fiatCurrency,
      networks: [network],
      presetCryptoAmount: cryptoAmount,
    });
  };

  return (
    <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label>Destination address</Label>

        <WalletAddressSelectOrInput onChange={setDestinationAddress} />
      </div>

      <div className="space-y-2">
        <Label>Network</Label>

        <CoinbaseNetworkSelectOrInput onChange={setNetwork} />
      </div>

      <div className="space-y-2">
        <Label>Fiat currency</Label>

        <FiatCurrencySelectOrInput onChange={setFiatCurrency} />
      </div>

      <div className="space-y-2">
        <Label>Default asset</Label>

        <CryptoCurrencySelectOrInput onChange={setDefaultAsset} />
      </div>

      <div className="space-y-2">
        <Label>Crypto amount</Label>

        <Input
          type="number"
          min="0"
          step="any"
          value={cryptoAmount}
          onChange={(event) => {
            setCryptoAmount(event.target.value);
          }}
          placeholder="100"
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          className="w-1/2"
          loading={isPending}
          disabled={isPending || !hasAllRequiredFields}
        >
          Buy
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

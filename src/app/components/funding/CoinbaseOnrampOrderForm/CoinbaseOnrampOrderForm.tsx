import type { CoinbaseCreateOnrampOrderRequest } from '@dynamic-labs-sdk/client';
import type { FC } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CoinbaseNetworkSelectOrInput } from '../CoinbaseNetworkSelectOrInput';
import { CryptoCurrencySelectOrInput } from '../CryptoCurrencySelectOrInput';
import { FiatCurrencySelectOrInput } from '../FiatCurrencySelectOrInput';
import { WalletAddressSelectOrInput } from '../WalletAddressSelectOrInput';

type CoinbaseOnrampOrderFormProps = {
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (data: CoinbaseCreateOnrampOrderRequest) => void;
};

export const CoinbaseOnrampOrderForm: FC<CoinbaseOnrampOrderFormProps> = ({
  isPending,
  onCancel,
  onSubmit,
}) => {
  const [destinationAddress, setDestinationAddress] = useState<string>('');

  const [destinationNetwork, setDestinationNetwork] = useState<string>('');

  const [paymentCurrency, setPaymentCurrency] = useState<string>('');

  const [purchaseCurrency, setPurchaseCurrency] = useState<string>('');

  const [purchaseAmount, setPurchaseAmount] = useState<string>('');

  const hasAllRequiredFields =
    !!destinationAddress &&
    !!destinationNetwork &&
    !!paymentCurrency &&
    !!purchaseCurrency &&
    !!purchaseAmount;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit({
      agreementAcceptedAt: new Date(),
      destinationAddress,
      destinationNetwork,
      isSandbox: true,
      paymentCurrency,
      paymentMethod: 'GUEST_CHECKOUT_APPLE_PAY',
      purchaseAmount,
      purchaseCurrency,
    });
  };

  return (
    <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label>Destination address</Label>

        <WalletAddressSelectOrInput onChange={setDestinationAddress} />
      </div>

      <div className="space-y-2">
        <Label>Destination network</Label>

        <CoinbaseNetworkSelectOrInput onChange={setDestinationNetwork} />
      </div>

      <div className="space-y-2">
        <Label>Payment currency</Label>

        <FiatCurrencySelectOrInput onChange={setPaymentCurrency} />
      </div>

      <div className="space-y-2">
        <Label>Purchase currency</Label>

        <CryptoCurrencySelectOrInput onChange={setPurchaseCurrency} />
      </div>

      <div className="space-y-2">
        <Label>Purchase amount</Label>

        <Input
          type="number"
          min="0"
          step="any"
          value={purchaseAmount}
          onChange={(event) => {
            setPurchaseAmount(event.target.value);
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
          Create order
        </Button>
        <Button
          variant="outline"
          className="w-1/2"
          disabled={isPending}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

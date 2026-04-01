import type { CryptoDotComPaymentCreateRequest } from '@dynamic-labs-sdk/client';
import type { FC } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CryptoDotComNetworkSelectOrInput } from '../CryptoDotComNetworkSelectOrInput';
import { FiatCurrencySelectOrInput } from '../FiatCurrencySelectOrInput';
import { WalletAddressSelectOrInput } from '../WalletAddressSelectOrInput';

type CryptoDotComPaymentFormProps = {
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (data: CryptoDotComPaymentCreateRequest) => void;
};

export const CryptoDotComPaymentForm: FC<CryptoDotComPaymentFormProps> = ({
  isPending,
  onCancel,
  onSubmit,
}) => {
  const [destinationAddress, setDestinationAddress] = useState<string>('');

  const [networkId, setNetworkId] = useState<string>('');

  const [fiatCurrency, setFiatCurrency] = useState<string>('');

  const [amount, setAmount] = useState<number>(100);

  const hasAllRequiredFields =
    !!destinationAddress && !!networkId && !!fiatCurrency && !!amount;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit({
      amount,
      chain: 'EVM',
      currency: fiatCurrency,
      merchantName: 'Dynamic',
      networkId,
      walletAddress: destinationAddress,
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

        <CryptoDotComNetworkSelectOrInput onChange={setNetworkId} />
      </div>

      <div className="space-y-2">
        <Label>Currency</Label>

        <FiatCurrencySelectOrInput onChange={setFiatCurrency} />
      </div>

      <div className="space-y-2">
        <Label>Amount</Label>

        <Input
          type="number"
          min="0"
          step="any"
          value={amount}
          onChange={(event) => {
            setAmount(Number(event.target.value));
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
          Create Payment
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

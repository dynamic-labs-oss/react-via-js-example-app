/* eslint-disable custom-rules/ban-ethereum-eth-terms */
import type { FC } from 'react';

import { SelectOrInput } from '../../SelectOrInput';

const CRYPTO_CURRENCY_OPTIONS = [
  { label: 'ETH', value: 'ETH' },
  { label: 'USDC', value: 'USDC' },
];

type CryptoCurrencySelectOrInputProps = {
  onChange: (currency: string) => void;
};

export const CryptoCurrencySelectOrInput: FC<
  CryptoCurrencySelectOrInputProps
> = ({ onChange }) => {
  return (
    <SelectOrInput
      options={CRYPTO_CURRENCY_OPTIONS}
      onChange={onChange}
      customInputProps={{ maxLength: 6, placeholder: 'USDC' }}
      selectValueProps={{ placeholder: 'Select currency' }}
    />
  );
};

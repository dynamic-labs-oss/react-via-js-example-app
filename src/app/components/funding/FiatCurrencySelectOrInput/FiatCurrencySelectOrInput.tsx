import type { FC } from 'react';

import { SelectOrInput } from '../../SelectOrInput';

const FIAT_CURRENCY_OPTIONS = [
  { label: 'BRL - Brazilian Real', value: 'BRL' },
  { label: 'EUR - Euro', value: 'EUR' },
  { label: 'GBP - British Pound', value: 'GBP' },
  { label: 'USD - United States Dollar', value: 'USD' },
];

type FiatCurrencySelectOrInputProps = {
  onChange: (currency: string) => void;
};

export const FiatCurrencySelectOrInput: FC<FiatCurrencySelectOrInputProps> = ({
  onChange,
}) => {
  return (
    <SelectOrInput
      options={FIAT_CURRENCY_OPTIONS}
      onChange={onChange}
      customInputProps={{ maxLength: 3, placeholder: 'USD' }}
      selectValueProps={{ placeholder: 'Select currency' }}
    />
  );
};

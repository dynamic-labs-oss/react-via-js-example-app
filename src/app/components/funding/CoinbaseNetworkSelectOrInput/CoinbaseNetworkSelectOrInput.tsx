/* eslint-disable custom-rules/ban-ethereum-eth-terms */
import type { FC } from 'react';

import { SelectOrInput } from '../../SelectOrInput';

const COINBASE_NETWORK_OPTIONS = [
  { label: 'Arbitrum', value: 'arbitrum' },
  { label: 'Avalanche', value: 'avalanche' },
  { label: 'Base', value: 'base' },
  { label: 'Ethereum', value: 'ethereum' },
  { label: 'Optimism', value: 'optimism' },
  { label: 'Polygon', value: 'polygon' },
];

type CoinbaseNetworkSelectOrInputProps = {
  onChange: (network: string) => void;
};

export const CoinbaseNetworkSelectOrInput: FC<
  CoinbaseNetworkSelectOrInputProps
> = ({ onChange }) => {
  return (
    <SelectOrInput
      options={COINBASE_NETWORK_OPTIONS}
      onChange={onChange}
      customInputProps={{ maxLength: 50, placeholder: 'base' }}
      selectValueProps={{ placeholder: 'Select network' }}
    />
  );
};

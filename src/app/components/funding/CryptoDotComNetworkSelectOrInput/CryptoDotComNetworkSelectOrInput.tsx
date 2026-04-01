/* eslint-disable custom-rules/ban-ethereum-eth-terms */
import type { FC } from 'react';

import { SelectOrInput } from '../../SelectOrInput';

const CRYPTO_DOT_COM_NETWORK_OPTIONS = [
  { label: 'Arbitrum - 42161', value: '42161' },
  { label: 'Cronos - 25', value: '25' },
  { label: 'Ethereum - 1', value: '1' },
  { label: 'Optimism - 10', value: '10' },
  { label: 'Polygon - 137', value: '137' },
  { label: 'ZkSync - 324', value: '324' },
];

type CryptoDotComNetworkSelectOrInputProps = {
  onChange: (networkId: string) => void;
};

export const CryptoDotComNetworkSelectOrInput: FC<
  CryptoDotComNetworkSelectOrInputProps
> = ({ onChange }) => {
  return (
    <SelectOrInput
      options={CRYPTO_DOT_COM_NETWORK_OPTIONS}
      onChange={onChange}
      customInputProps={{
        maxLength: 10,
        placeholder: 'Enter network id (e.g. 1)',
      }}
      selectValueProps={{ placeholder: 'Select network' }}
    />
  );
};

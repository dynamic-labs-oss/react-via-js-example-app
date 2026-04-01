import { isEvmWalletAccount } from '@dynamic-labs-sdk/evm';
import type { FC } from 'react';
import { useMemo } from 'react';

import { useWalletAccounts } from '../../../hooks/useWalletAccounts';
import { SelectOrInput } from '../../SelectOrInput';

type WalletAddressSelectOrInputProps = {
  onChange: (address: string) => void;
};

export const WalletAddressSelectOrInput: FC<
  WalletAddressSelectOrInputProps
> = ({ onChange }) => {
  const walletAccounts = useWalletAccounts();

  const evmWalletAccounts = useMemo(
    () => walletAccounts.filter(isEvmWalletAccount),
    [walletAccounts]
  );

  return (
    <SelectOrInput
      options={evmWalletAccounts.map((walletAccount) => ({
        label: walletAccount.address,
        value: walletAccount.address,
      }))}
      onChange={onChange}
      customInputProps={{ placeholder: '0x...' }}
      selectValueProps={{ placeholder: 'Select an address' }}
    />
  );
};

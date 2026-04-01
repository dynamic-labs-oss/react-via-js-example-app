import type { NetworkData } from '@dynamic-labs-sdk/client';
import type { EvmWalletAccount } from '@dynamic-labs-sdk/evm';
import { simulateEvmTransaction } from '@dynamic-labs-sdk/evm';
import { parseEther } from 'viem';

import { simulateZerodevTransactionDemo } from './simulateZerodevTransactionDemo';

type SimulateEvmTransactionDemoParams = {
  activeNetworkData: NetworkData;
  amount: string;
  includeFees: boolean;
  recipient: `0x${string}`;
  walletAccount: EvmWalletAccount;
};

export const simulateEvmTransactionDemo = async ({
  walletAccount,
  amount,
  recipient,
  includeFees,
  activeNetworkData,
}: SimulateEvmTransactionDemoParams) => {
  if (walletAccount.walletProviderKey.includes('zerodev')) {
    return simulateZerodevTransactionDemo({
      activeNetworkData,
      amount,
      includeFees,
      recipient,
      walletAccount,
    });
  }

  const result = await simulateEvmTransaction({
    includeFees,
    transaction: {
      from: walletAccount.address as `0x${string}`,
      networkId: activeNetworkData.networkId,
      to: recipient,
      value: parseEther(amount),
    },
    walletAccount,
  });

  return result;
};

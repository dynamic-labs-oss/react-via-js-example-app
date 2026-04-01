import type { NetworkData } from '@dynamic-labs-sdk/client';
import type { EvmWalletAccount } from '@dynamic-labs-sdk/evm';
import { simulateZerodevUserOperation } from '@dynamic-labs-sdk/zerodev';
import { entryPoint07Address } from 'viem/account-abstraction';

type SimulateZerodevTransactionDemoParams = {
  activeNetworkData: NetworkData;
  amount: string;
  includeFees: boolean;
  recipient: `0x${string}`;
  walletAccount: EvmWalletAccount;
};

export const simulateZerodevTransactionDemo = async ({
  walletAccount,
  amount: _amount,
  recipient: _recipient,
  includeFees,
  activeNetworkData,
}: SimulateZerodevTransactionDemoParams) => {
  // For ZeroDev, we need to create a user operation
  // This is a simplified version that simulates a transfer
  const result = await simulateZerodevUserOperation({
    entryPoint: entryPoint07Address,
    includeFees,
    networkId: activeNetworkData.networkId,
    userOperation: {
      callData: '0x', // Placeholder - in a real scenario this would be encoded call data
      callGasLimit: 100000n,
      maxFeePerGas: 1000000000n,
      maxPriorityFeePerGas: 1000000000n,
      nonce: 0n,
      preVerificationGas: 50000n,
      sender: walletAccount.address as `0x${string}`,
      signature: '0x',
      verificationGasLimit: 100000n,
    },
    walletAccount,
  });

  return result;
};

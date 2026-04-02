import type { NetworkData } from '@dynamic-labs-sdk/client';
import {
  type SolanaWalletAccount,
  simulateSolanaTransaction,
} from '@dynamic-labs-sdk/solana';

import { createSolanaTransaction } from '../createSolanaTransaction';

type SimulateSolanaTransactionDemoParams = {
  activeNetworkData: NetworkData;
  amount: string;
  includeFees: boolean;
  recipient: string;
  walletAccount: SolanaWalletAccount;
};

export const simulateSolanaTransactionDemo = async ({
  walletAccount,
  amount,
  recipient,
  activeNetworkData,
  includeFees,
}: SimulateSolanaTransactionDemoParams) => {
  const transaction = await createSolanaTransaction({
    amount,
    isVersioned: true,
    rpcUrl: activeNetworkData.rpcUrls.http[0],
    solanaWalletAccount: walletAccount,
    toAddress: recipient,
  });

  return simulateSolanaTransaction({
    includeFees,
    transaction,
    walletAccount,
  });
};

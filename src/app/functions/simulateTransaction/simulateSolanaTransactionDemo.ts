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
  // eslint-disable-next-line no-console
  console.log('[SOLANA SIMULATION] Starting with params:', {
    amount,
    includeFees,
    recipient,
    rpcUrl: activeNetworkData.rpcUrls.http[0],
    walletAddress: walletAccount.address,
  });

  try {
    const transaction = await createSolanaTransaction({
      amount,
      isVersioned: true,
      rpcUrl: activeNetworkData.rpcUrls.http[0],
      solanaWalletAccount: walletAccount,
      toAddress: recipient,
    });

    // eslint-disable-next-line no-console
    console.log('[SOLANA SIMULATION] Transaction created successfully');

    const result = await simulateSolanaTransaction({
      includeFees,
      transaction,
      walletAccount,
    });

    // eslint-disable-next-line no-console
    console.log('[SOLANA SIMULATION] Simulation result:', result);

    return result;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[SOLANA SIMULATION] Error:', error);
    throw error;
  }
};

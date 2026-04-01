import type { NetworkData } from '@dynamic-labs-sdk/client';
import {
  type SolanaWalletAccount,
  signAndSendSponsoredTransaction,
} from '@dynamic-labs-sdk/solana';

import { createSolanaTransaction } from '../createSolanaTransaction';

type SendSponsoredSolanaTransactionParams = {
  activeNetworkData: NetworkData;
  amount: string;
  recipient: string;
  walletAccount: SolanaWalletAccount;
};

export const sendSponsoredSolanaTransaction = async ({
  walletAccount,
  amount,
  recipient,
  activeNetworkData,
}: SendSponsoredSolanaTransactionParams) => {
  const transaction = await createSolanaTransaction({
    amount,
    isVersioned: true,
    rpcUrl: activeNetworkData.rpcUrls.http[0],
    solanaWalletAccount: walletAccount,
    toAddress: recipient,
  });

  const { signature } = await signAndSendSponsoredTransaction({
    transaction,
    walletAccount,
  });

  return signature;
};

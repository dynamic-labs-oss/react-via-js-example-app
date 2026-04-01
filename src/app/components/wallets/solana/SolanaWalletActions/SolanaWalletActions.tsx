import type { NetworkData } from '@dynamic-labs-sdk/client';
import { isWaasWalletAccount } from '@dynamic-labs-sdk/client/waas';
import type { SolanaWalletAccount } from '@dynamic-labs-sdk/solana';
import type { FC } from 'react';

import { SendSponsoredTransactionDialog } from './SendSponsoredTransactionDialog';
import { SignTransactionDialog } from './SignTransactionDialog';
import { TransactionHistoryDialog } from './TransactionHistoryDialog';

type SolanaWalletActionsProps = {
  activeNetworkData: NetworkData;
  walletAccount: SolanaWalletAccount;
};

export const SolanaWalletActions: FC<SolanaWalletActionsProps> = ({
  walletAccount,
  activeNetworkData,
}) => {
  const isEmbeddedWallet = isWaasWalletAccount({ walletAccount });

  return (
    <>
      <SignTransactionDialog
        walletAccount={walletAccount}
        activeNetworkData={activeNetworkData}
      />

      <SignTransactionDialog
        walletAccount={walletAccount}
        activeNetworkData={activeNetworkData}
        signMethod="signAllTransactions"
      />

      {isEmbeddedWallet && (
        <>
          <SendSponsoredTransactionDialog
            walletAccount={walletAccount}
            activeNetworkData={activeNetworkData}
          />

          <TransactionHistoryDialog
            walletAccount={walletAccount}
            activeNetworkData={activeNetworkData}
          />
        </>
      )}
    </>
  );
};

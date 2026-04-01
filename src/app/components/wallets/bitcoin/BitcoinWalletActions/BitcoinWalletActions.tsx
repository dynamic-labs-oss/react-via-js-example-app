import type { BitcoinWalletAccount } from '@dynamic-labs-sdk/bitcoin';
import { isWaasWalletAccount } from '@dynamic-labs-sdk/client/waas';
import type { FC } from 'react';

import { BuildPsbtDialog } from './BuildPsbtDialog';
import { SendBitcoinDialog } from './SendBitcoinDialog';
import { SendRawTransactionDialog } from './SendRawTransactionDialog';
import { SignPsbtDialog } from './SignPsbtDialog';

type BitcoinWalletActionsProps = {
  walletAccount: BitcoinWalletAccount;
};

export const BitcoinWalletActions: FC<BitcoinWalletActionsProps> = ({
  walletAccount,
}) => {
  const isEmbeddedWallet = isWaasWalletAccount({ walletAccount });

  return (
    <>
      <SignPsbtDialog walletAccount={walletAccount} />

      <SendRawTransactionDialog walletAccount={walletAccount} />

      {isEmbeddedWallet && (
        <>
          <BuildPsbtDialog walletAccount={walletAccount} />

          <SendBitcoinDialog walletAccount={walletAccount} />
        </>
      )}
    </>
  );
};

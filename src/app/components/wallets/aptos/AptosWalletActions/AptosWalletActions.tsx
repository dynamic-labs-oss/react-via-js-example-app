import type { AptosWalletAccount } from '@dynamic-labs-sdk/aptos';
import type { FC } from 'react';

import { SignAndSubmitTransactionDialog } from './SignAndSubmitTransactionDialog';

type AptosWalletActionsProps = {
  walletAccount: AptosWalletAccount;
};

export const AptosWalletActions: FC<AptosWalletActionsProps> = ({
  walletAccount,
}) => {
  return <SignAndSubmitTransactionDialog walletAccount={walletAccount} />;
};

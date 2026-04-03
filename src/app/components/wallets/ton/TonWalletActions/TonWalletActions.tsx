import type { TonWalletAccount } from '@dynamic-labs-sdk/ton';
import type { FC } from 'react';

import { SendJettonDialog } from './SendJettonDialog';
import { SendTonDialog } from './SendTonDialog';

type TonWalletActionsProps = {
  walletAccount: TonWalletAccount;
};

export const TonWalletActions: FC<TonWalletActionsProps> = ({
  walletAccount,
}) => {
  return (
    <>
      <SendTonDialog walletAccount={walletAccount} />
      <SendJettonDialog walletAccount={walletAccount} />
    </>
  );
};

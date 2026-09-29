import { isWaasWalletAccount } from '@dynamic-labs-sdk/client/waas';
import type { EvmWalletAccount } from '@dynamic-labs-sdk/evm';
import type { FC } from 'react';

import { EvmGaslessDialog } from './EvmGaslessDialog';

type EvmWalletActionsProps = {
  walletAccount: EvmWalletAccount;
};

export const EvmWalletActions: FC<EvmWalletActionsProps> = ({
  walletAccount,
}) => {
  const isEmbeddedWallet = isWaasWalletAccount({ walletAccount });

  if (!isEmbeddedWallet) return null;

  return <EvmGaslessDialog walletAccount={walletAccount} />;
};

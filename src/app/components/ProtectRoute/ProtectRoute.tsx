import type { FC, PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';

import { useUser } from '../../hooks/useUser';
import { useWalletAccounts } from '../../hooks/useWalletAccounts';

export const ProtectRoute: FC<PropsWithChildren> = ({ children }) => {
  const user = useUser();
  const walletAccounts = useWalletAccounts();

  if (!user && !walletAccounts.length) {
    return <Navigate to="/auth" />;
  }

  return children;
};

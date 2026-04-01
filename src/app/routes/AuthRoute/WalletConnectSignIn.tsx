import { isMobile as isMobileUtil } from '@dynamic-labs-sdk/client';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { WalletConnectSignInButton } from '../../components/walletConnect/WalletConnectSignInButton';

const isMobile = isMobileUtil();

export const WalletConnectSignIn: FC = () => {
  const navigate = useNavigate();

  const triggerNavigation = () => {
    if (isMobile) {
      navigate(`/auth/wallet-connect/wallets`);
    } else {
      navigate(`/auth/wallet-connect`);
    }
  };

  return <WalletConnectSignInButton onClick={triggerNavigation} />;
};

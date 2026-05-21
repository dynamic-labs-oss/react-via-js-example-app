import type { WalletConnectCatalogWallet } from '@dynamic-labs-sdk/client';
import { waitForClientInitialized } from '@dynamic-labs-sdk/client';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { shouldAutoVerifyWallets } from '@/store/shouldAutoVerifyWallets';
import { openWalletConnectDeepLink } from '../components/walletConnect/openWalletConnectDeepLink';
import { getWalletConnectConnection } from '../functions/getWalletConnectConnection';
import { onSignIn } from '../functions/onSignIn/onSignIn';

type UseConnectCatalogWalletViaDeepLinkParams = {
  onSuccess?: () => void;
};

/**
 * Mobile-only flow that opens the wallet's deep link after starting a
 * WalletConnect session. Tracks which catalog wallet is in flight so the
 * caller can render a loading state on the right button.
 */
export const useConnectCatalogWalletViaDeepLink = ({
  onSuccess,
}: UseConnectCatalogWalletViaDeepLinkParams = {}) => {
  const [connectingWallet, setConnectingWallet] =
    useState<WalletConnectCatalogWallet | null>(null);

  const mutation = useMutation({
    mutationFn: async (wallet: WalletConnectCatalogWallet) => {
      setConnectingWallet(wallet);

      await waitForClientInitialized();

      const { uri, approval } = await getWalletConnectConnection({
        autoVerify: shouldAutoVerifyWallets(),
        chain: wallet.chain === 'SOL' ? 'SOL' : 'EVM',
      });
      openWalletConnectDeepLink({ uri, wallet });

      await approval();
      await onSignIn();

      setConnectingWallet(null);
      onSuccess?.();
    },
    onError: () => setConnectingWallet(null),
  });

  return {
    connectingWallet,
    connectWallet: mutation.mutate,
    isConnecting: mutation.isPending,
  };
};

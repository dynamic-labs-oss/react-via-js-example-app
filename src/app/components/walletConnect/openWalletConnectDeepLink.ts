import type { WalletConnectCatalogWallet } from '@dynamic-labs-sdk/client';
import { appendWalletConnectUriToDeepLink } from '@dynamic-labs-sdk/wallet-connect';
import { toast } from 'sonner';

import { getPreferredDeepLink } from './getPreferredDeepLink';

type OpenWalletConnectDeepLinkParams = {
  uri: string;
  wallet: WalletConnectCatalogWallet;
};

/**
 * Opens a WalletConnect deep link to connect to a mobile wallet.
 *
 * For Android: constructs deep link using wallet's native scheme: {scheme}://wc?uri={pairingUri}&redirect={currentUrl}
 * For iOS/Desktop: constructs deep link with ?uri= parameter and redirect URL
 * Includes current URL as redirect parameter to enable auto-redirect back to the app
 *
 * @param params.uri - The WalletConnect pairing URI
 * @param params.wallet - The WalletConnect catalog wallet entry containing deep link information
 * @throws Error if no deep link is available for the wallet
 *
 * @see https://docs.reown.com/walletkit/android/mobile-linking
 */
export const openWalletConnectDeepLink = ({
  uri,
  wallet,
}: OpenWalletConnectDeepLinkParams): void => {
  const origin = wallet.deeplinks
    ? getPreferredDeepLink(wallet.deeplinks)
    : undefined;

  if (!origin) {
    const errorMessage = `Unable to connect to ${wallet.name}: No deep link available.`;

    toast.error(errorMessage);

    throw new Error(errorMessage);
  }

  const deepLink = appendWalletConnectUriToDeepLink({
    deepLinkUrl: origin,
    walletConnectUri: uri,
  });

  window.open(deepLink, '_blank');
};

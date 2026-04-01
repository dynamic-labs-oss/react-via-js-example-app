import { addBitcoinExtension } from '@dynamic-labs-sdk/bitcoin';
import {
  createDynamicClient,
  getWalletConnectCatalogWalletByWalletProviderKey,
  initializeClient,
  isMobile,
  onEvent,
} from '@dynamic-labs-sdk/client';
import { addEvmExtension } from '@dynamic-labs-sdk/evm';
import { addWalletConnectEvmExtension } from '@dynamic-labs-sdk/evm/wallet-connect';
import {
  addPhantomRedirectSolanaExtension,
  addSolanaExtension,
} from '@dynamic-labs-sdk/solana';
import { addWalletConnectSolanaExtension } from '@dynamic-labs-sdk/solana/wallet-connect';
import { addSuiExtension } from '@dynamic-labs-sdk/sui';
import { addTronExtension } from '@dynamic-labs-sdk/tron';
import { addZerodevExtension } from '@dynamic-labs-sdk/zerodev';
import { toast } from 'sonner';

import { demoConfig } from './demoConfig';
import { getPreferredDeepLink } from '../components/walletConnect/getPreferredDeepLink';

// Trailing slash is stripped because the SDK's api-core constructs paths as
// `${apiBaseUrl}/endpoint`, which would produce a double slash otherwise.
const apiBaseUrl = new URL(
  demoConfig.apiBaseUrlPath,
  demoConfig.apiBaseUrlOrigin
).href.replace(/\/$/, '');

export const dynamicClient = createDynamicClient({
  autoInitialize: false,

  coreConfig: {
    apiBaseUrl,
  },

  environmentId: demoConfig.environmentId,
  metadata: {
    name: 'Dynamic',
    universalLink: window.location.origin,
  },
});

void initializeClient();

addEvmExtension();
addZerodevExtension();
addSolanaExtension();
addBitcoinExtension();
addSuiExtension();
addTronExtension();
void addWalletConnectEvmExtension();
void addPhantomRedirectSolanaExtension({
  onCloseTab: () => window.close(),
  url: new URL(window.location.href),
});
void addWalletConnectSolanaExtension();

onEvent({
  event: 'walletConnectUserActionRequested',
  listener: async ({ walletProviderKey }) => {
    if (isMobile()) {
      const walletConnectCatalogWallet =
        await getWalletConnectCatalogWalletByWalletProviderKey({
          walletProviderKey,
        });

      if (!walletConnectCatalogWallet?.deeplinks) {
        return;
      }

      const deepLink = getPreferredDeepLink(
        walletConnectCatalogWallet.deeplinks
      );

      if (deepLink) {
        window.open(deepLink, '_blank');

        return;
      }
    }

    toast.info('Please approve the action in your wallet application', {
      duration: 5000,
    });
  },
});

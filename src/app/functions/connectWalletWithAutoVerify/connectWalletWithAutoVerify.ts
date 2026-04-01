import type { HardwareWalletVendor, WalletAccount, WalletProviderData } from '@dynamic-labs-sdk/client';
import {
  DeeplinkConnectAndVerifyUnsupportedError,
  connectAndVerifyWithWalletProvider,
  connectWithWalletProvider,
} from '@dynamic-labs-sdk/client';

import { shouldAutoVerifyWallets } from '../../../store/shouldAutoVerifyWallets';

type ConnectWalletWithAutoVerifyParams = {
  hardwareWalletVendor?: HardwareWalletVendor;
  walletProvider: WalletProviderData;
};

export type ConnectWalletResult =
  | { status: 'connected' }
  | { status: 'needs-verify'; walletAccount: WalletAccount; walletProvider: WalletProviderData };

/**
 * Connects a wallet and optionally verifies ownership in a single step.
 *
 * When `connectAndVerifyWithWalletProvider` throws a
 * `DeeplinkConnectAndVerifyUnsupportedError` (mobile + deep link provider),
 * we fall back to connecting only and return `needs-verify` so the caller can
 * present a separate "Verify Ownership" button.
 */
export const connectWalletWithAutoVerify = async ({
  hardwareWalletVendor,
  walletProvider,
}: ConnectWalletWithAutoVerifyParams): Promise<ConnectWalletResult> => {
  if (!shouldAutoVerifyWallets()) {
    await connectWithWalletProvider({
      hardwareWalletVendor,
      walletProviderKey: walletProvider.key,
    });

    return { status: 'connected' };
  }

  try {
    await connectAndVerifyWithWalletProvider({
      hardwareWalletVendor,
      walletProviderKey: walletProvider.key,
    });

    return { status: 'connected' };
  } catch (error) {
    if (error instanceof DeeplinkConnectAndVerifyUnsupportedError) {
      const walletAccount = await connectWithWalletProvider({
        addToDynamicWalletAccounts: false,
        hardwareWalletVendor,
        walletProviderKey: walletProvider.key,
      });

      return { status: 'needs-verify', walletAccount, walletProvider };
    }

    throw error;
  }
};

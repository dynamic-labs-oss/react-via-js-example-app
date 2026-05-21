import { waitForClientInitialized } from '@dynamic-labs-sdk/client';
import { useCallback, useEffect, useState } from 'react';

import { useShouldAutoVerifyWallets } from '../../store/shouldAutoVerifyWallets';
import type { SupportedQrChain } from '../components/walletConnect/BrandedWalletConnectQrCode.types';
import { getWalletConnectConnection } from '../functions/getWalletConnectConnection';
import { onSignIn } from '../functions/onSignIn/onSignIn';

type UseBrandedWalletConnectSessionParams = {
  chain: SupportedQrChain | null;
  onConnected: () => void;
};

/**
 * Drives a WalletConnect pairing session for the given chain, exposing the
 * pairing URI for the QR code, any connection error, and a retry callback.
 * Re-runs whenever `chain` changes (e.g. user switches between EVM and SOL).
 */
export const useBrandedWalletConnectSession = ({
  chain,
  onConnected,
}: UseBrandedWalletConnectSessionParams) => {
  const autoVerify = useShouldAutoVerifyWallets();
  const [uri, setUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const attemptConnection = useCallback(async () => {
    if (!chain) return;

    setError(null);
    setUri(null);

    try {
      await waitForClientInitialized();

      const { uri: pairingUri, approval } = await getWalletConnectConnection({
        autoVerify,
        chain,
      });

      setUri(pairingUri);
      await approval();

      await onSignIn();
      onConnected();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.message ?? String(err));
    }
  }, [autoVerify, chain, onConnected]);

  useEffect(() => {
    void attemptConnection();
  }, [attemptConnection]);

  return { error, retry: attemptConnection, uri };
};

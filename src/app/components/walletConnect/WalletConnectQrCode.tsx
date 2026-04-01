import type { Chain } from '@dynamic-labs-sdk/client';
import { waitForClientInitialized } from '@dynamic-labs-sdk/client';
import {
  connectAndVerifyWithWalletConnectEvm,
  connectWithWalletConnectEvm,
} from '@dynamic-labs-sdk/evm/wallet-connect';
import {
  connectAndVerifyWithWalletConnectSolana,
  connectWithWalletConnectSolana,
} from '@dynamic-labs-sdk/solana/wallet-connect';
import {
  EthereumIcon,
  SolanaIcon,
  WalletConnectIcon,
} from '@dynamic-labs/iconic';
import { useMutation } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { type FC, useCallback, useEffect, useState } from 'react';

import { Button } from '../../../components/ui/button';
import { useShouldAutoVerifyWallets } from '../../../store/shouldAutoVerifyWallets';
import { AutoVerifyWalletsSwitch } from '../AutoVerifyWalletsSwitch';
import { QrCode } from '../QrCode';

type WalletConnectQrCodeProps = {
  onConnectionComplete: () => void;
};

type AvailableChain = Extract<Chain, 'EVM' | 'SOL'>;

const availableChains = {
  EVM: {
    renderIcon: (className: string) => <EthereumIcon className={className} />,
  },
  SOL: {
    renderIcon: (className: string) => <SolanaIcon className={className} />,
  },
} satisfies Record<
  AvailableChain,
  { renderIcon: (className: string) => ReactNode }
>;

export const WalletConnectQrCode: FC<WalletConnectQrCodeProps> = ({
  onConnectionComplete,
}) => {
  const [chain, setChain] = useState<AvailableChain | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const shouldAutoVerifyWallets = useShouldAutoVerifyWallets();

  const { mutate: copyUrl, isPending: isCopyingUrl } = useMutation({
    mutationFn: async () => url && navigator.clipboard.writeText(url),
  });

  const handleSwitchChain = useCallback(() => {
    setChain(null);
    setUrl(null);
    setError(null);
  }, []);

  const attemptConnection = useCallback(async () => {
    if (!chain) {
      return;
    }

    setError(null);
    setUrl(null);

    const evmConnect = shouldAutoVerifyWallets
      ? connectAndVerifyWithWalletConnectEvm
      : connectWithWalletConnectEvm;

    const solanaConnect = shouldAutoVerifyWallets
      ? connectAndVerifyWithWalletConnectSolana
      : connectWithWalletConnectSolana;

    const connect = chain === 'EVM' ? evmConnect : solanaConnect;

    await waitForClientInitialized();

    try {
      const { uri, approval } = await connect();

      setUrl(uri);

      await approval();

      onConnectionComplete();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setError(error.message ?? error);
    }
  }, [onConnectionComplete, shouldAutoVerifyWallets, chain]);

  useEffect(() => {
    void attemptConnection();
  }, [attemptConnection]);

  if (!chain) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground self-center">
          <WalletConnectIcon className="w-7! h-7!" />
          <p>WalletConnect</p>
        </div>

        <p className="text-xs text-muted-foreground self-center">
          Select the chain you want to connect to
        </p>

        <div className="flex flex-col gap-2">
          {Object.entries(availableChains).map(([chain, { renderIcon }]) => (
            <Button
              onClick={() => setChain(chain as AvailableChain)}
              variant="outline"
              className="flex items-center gap-3 px-3 py-3 h-auto justify-start"
              key={chain}
            >
              {renderIcon('w-8 h-8 rounded-md')}
              {chain}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground self-center">
        <div className="relative">
          <WalletConnectIcon className="w-7! h-7!" />
          <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
            {availableChains[chain].renderIcon('w-4 h-4 rounded-md')}
          </div>
        </div>

        <p>WalletConnect {chain}</p>
      </div>

      <p className="text-xs text-muted-foreground self-center">
        Read the QR code with your favorite mobile wallet
      </p>

      <AutoVerifyWalletsSwitch
        className="self-center"
        label="Also verify wallets"
      />

      <div className="relative flex items-center justify-center">
        <QrCode value={url} className="self-center" />

        {error && (
          <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center backdrop-blur-sm">
            <div
              className="flex flex-col items-center gap-2 cursor-pointer bg-black/30 rounded-lg p-4"
              onClick={() => void attemptConnection()}
            >
              <p className="text-white">{error}</p>

              <Button variant="outline">Retry</Button>
            </div>
          </div>
        )}
      </div>

      <Button
        type="button"
        loading={isCopyingUrl}
        onClick={() => copyUrl()}
        disabled={Boolean(!url || error)}
      >
        Copy URL
      </Button>

      <Button type="button" onClick={handleSwitchChain}>
        Switch Chain
      </Button>
    </div>
  );
};

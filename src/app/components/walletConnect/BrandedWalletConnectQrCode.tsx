import { useMutation } from '@tanstack/react-query';
import { type FC, useMemo, useState } from 'react';

import { Button } from '../../../components/ui/button';
import { AutoVerifyWalletsSwitch } from '../AutoVerifyWalletsSwitch';
import { BrandedChainPickerView } from './BrandedChainPickerView';
import { BrandedQrCode } from './BrandedQrCode';
import type {
  BrandedCatalogGroup,
  SupportedQrChain,
} from './BrandedWalletConnectQrCode.types';
import { isSupportedQrChain } from './BrandedWalletConnectQrCode.types';
import { BrandedWalletHeader } from './BrandedWalletHeader';
import { useBrandedWalletConnectSession } from '../../hooks/useBrandedWalletConnectSession';

type BrandedWalletConnectQrCodeProps = {
  group: BrandedCatalogGroup;
  onBack: () => void;
  onConnectionComplete: () => void;
};

/**
 * Renders a branded WalletConnect QR flow for a single catalog group.
 *
 * Shows a chain picker only when the group exposes multiple QR-supported
 * chains (EVM/SOL). The QR itself is wrapped in {@link BrandedQrCode} so the
 * wallet icon sits centered and the border picks up the group's
 * `primaryColor`.
 */
export const BrandedWalletConnectQrCode: FC<
  BrandedWalletConnectQrCodeProps
> = ({ group, onBack, onConnectionComplete }) => {
  const supportedWallets = useMemo(
    () => group.wallets.filter((wallet) => isSupportedQrChain(wallet.chain)),
    [group.wallets]
  );

  const [chain, setChain] = useState<SupportedQrChain | null>(
    supportedWallets.length === 1
      ? (supportedWallets[0].chain as SupportedQrChain)
      : null
  );

  const { error, retry, uri } = useBrandedWalletConnectSession({
    chain,
    onConnected: onConnectionComplete,
  });

  const { mutate: copyUrl, isPending: isCopyingUrl } = useMutation({
    mutationFn: async () => uri && navigator.clipboard.writeText(uri),
  });

  if (!chain) {
    return (
      <BrandedChainPickerView
        group={group}
        onBack={onBack}
        onChainSelected={setChain}
        wallets={supportedWallets}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <BrandedWalletHeader
        iconSrc={group.spriteUrl}
        name={group.name}
        primaryColor={group.primaryColor}
      />

      <p className="text-xs text-muted-foreground self-center">
        Scan with your wallet app
      </p>

      <AutoVerifyWalletsSwitch
        className="self-center"
        label="Also verify wallets"
      />

      <div className="relative flex items-center justify-center">
        <BrandedQrCode
          iconAlt={`${group.name} icon`}
          iconSrc={group.spriteUrl || undefined}
          primaryColor={group.primaryColor}
          value={uri}
        />

        {error && (
          <div
            className="absolute inset-0 flex items-center justify-center backdrop-blur-sm cursor-pointer"
            onClick={() => void retry()}
          >
            <div className="flex flex-col items-center gap-2 bg-black/30 rounded-lg p-4">
              <p className="text-white text-sm">{error}</p>
              <Button variant="outline">Retry</Button>
            </div>
          </div>
        )}
      </div>

      <Button
        disabled={Boolean(!uri || error)}
        loading={isCopyingUrl}
        onClick={() => copyUrl()}
        type="button"
      >
        Copy URL
      </Button>

      {supportedWallets.length > 1 && (
        <Button onClick={() => setChain(null)} type="button" variant="outline">
          Switch chain
        </Button>
      )}

      <Button onClick={onBack} type="button" variant="outline">
        Back to wallets
      </Button>
    </div>
  );
};

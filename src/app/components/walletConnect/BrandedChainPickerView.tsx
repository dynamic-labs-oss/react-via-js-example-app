import type { WalletConnectCatalogWallet } from '@dynamic-labs-sdk/client';
import type { FC } from 'react';

import { Button } from '../../../components/ui/button';
import { getChainIcon } from '../../functions/getChainIcon';
import type {
  BrandedCatalogGroup,
  SupportedQrChain,
} from './BrandedWalletConnectQrCode.types';
import { BrandedWalletHeader } from './BrandedWalletHeader';

type BrandedChainPickerViewProps = {
  group: BrandedCatalogGroup;
  onBack: () => void;
  onChainSelected: (chain: SupportedQrChain) => void;
  wallets: WalletConnectCatalogWallet[];
};

/**
 * Chain selection screen rendered before the QR view when a catalog group
 * exposes multiple QR-supported chains (EVM and SOL).
 */
export const BrandedChainPickerView: FC<BrandedChainPickerViewProps> = ({
  group,
  onBack,
  onChainSelected,
  wallets,
}) => (
  <div className="flex flex-col gap-3">
    <BrandedWalletHeader
      iconSrc={group.spriteUrl}
      name={group.name}
      primaryColor={group.primaryColor}
    />

    <p className="text-xs text-muted-foreground self-center">
      Select the chain you want to connect to
    </p>

    <div className="flex flex-col gap-2">
      {wallets.map((wallet) => {
        const ChainIcon = getChainIcon(wallet.chain);
        return (
          <Button
            className="flex items-center gap-3 px-3 py-3 h-auto justify-start"
            key={wallet.chain}
            onClick={() => onChainSelected(wallet.chain as SupportedQrChain)}
            variant="outline"
          >
            {ChainIcon && <ChainIcon className="w-6 h-6 rounded-md" />}
            {wallet.chain}
          </Button>
        );
      })}
    </div>

    <Button onClick={onBack} type="button" variant="outline">
      Back
    </Button>
  </div>
);

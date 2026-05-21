import type { Chain, WalletConnectCatalogWallet } from '@dynamic-labs-sdk/client';

/** Chains for which the demo can render a WalletConnect QR session. */
export type SupportedQrChain = Extract<Chain, 'EVM' | 'SOL'>;

export const isSupportedQrChain = (chain: Chain): chain is SupportedQrChain =>
  chain === 'EVM' || chain === 'SOL';

/**
 * Catalog group shape consumed by {@link BrandedWalletConnectQrCode}. Mirrors
 * the `CombinedCatalogGroup` from `CombinedWalletList.types` but lives next to
 * its consumer so the component can be reused outside of AuthRoute.
 */
export type BrandedCatalogGroup = {
  id: string;
  name: string;
  primaryColor?: string;
  spriteUrl: string;
  wallets: WalletConnectCatalogWallet[];
};

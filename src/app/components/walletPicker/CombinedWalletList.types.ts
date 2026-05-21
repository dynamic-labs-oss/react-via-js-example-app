import type {
  WalletConnectCatalogWallet,
  WalletProviderData,
} from '@dynamic-labs-sdk/client';

/**
 * Display-ready catalog group used by {@link CombinedWalletList}. Built from
 * the WalletConnect catalog with one entry per group; `wallets` holds the
 * per-chain WalletConnect catalog entries inside the group.
 */
export type CombinedCatalogGroup = {
  id: string;
  name: string;
  primaryColor?: string;
  spriteUrl: string;
  wallets: WalletConnectCatalogWallet[];
};

/**
 * Entry representing one or more wallet providers exposed by the SDK
 * (browser extensions, deep-link/redirect providers, smart-contract
 * wallets, etc.). `isInstalled` only flags actual browser-extension
 * providers; everything else (e.g. Phantom Redirect, Base Account) is a
 * provider you can invoke but is rendered in the "Other wallets" section.
 */
export type WalletProviderEntry = {
  displayName: string;
  groupKey: string;
  iconSrc?: string;
  isInstalled: boolean;
  providers: WalletProviderData[];
  type: 'provider';
};

/** Entry representing a catalog group the user has not installed. */
export type CatalogListEntry = {
  group: CombinedCatalogGroup;
  type: 'catalog';
};

/** Union of entries shown in the combined wallet list. */
export type CombinedListEntry = WalletProviderEntry | CatalogListEntry;

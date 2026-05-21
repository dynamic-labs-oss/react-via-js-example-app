import type { WalletProviderData } from '@dynamic-labs-sdk/client';

import type { WalletProviderEntry } from '../../components/walletPicker/CombinedWalletList.types';

type BuildProviderEntriesParams = {
  walletProviders: WalletProviderData[];
};

/**
 * Groups the given wallet providers by `groupKey` and produces a sorted
 * list of {@link WalletProviderEntry} ready to be displayed. The
 * `isInstalled` flag is set when at least one provider in the group is a
 * browser extension — used by the picker to split the "Installed" section
 * from the "Other wallets" section.
 *
 * Filtering by provider type (which kinds are surfaced at all) is the
 * caller's responsibility; this helper assumes everything in
 * `walletProviders` should appear.
 */
export const buildProviderEntries = ({
  walletProviders,
}: BuildProviderEntriesParams): WalletProviderEntry[] => {
  const groups = walletProviders.reduce((acc, provider) => {
    if (!acc[provider.groupKey]) acc[provider.groupKey] = [];
    acc[provider.groupKey].push(provider);
    return acc;
  }, {} as Record<string, WalletProviderData[]>);

  return Object.entries(groups)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([groupKey, providers]) => ({
      displayName: providers[0].metadata.displayName,
      groupKey,
      iconSrc: providers[0].metadata.icon,
      isInstalled: providers.some(
        (provider) => provider.walletProviderType === 'browserExtension'
      ),
      providers,
      type: 'provider',
    }));
};

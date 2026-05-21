import type {
  WalletConnectCatalog,
  WalletProviderData,
} from '@dynamic-labs-sdk/client';

import type { CombinedListEntry } from '../../components/walletPicker/CombinedWalletList.types';
import { buildCatalogEntries } from '../buildCatalogEntries';
import { buildProviderEntries } from '../buildProviderEntries';

type BuildCombinedListEntriesParams = {
  catalog: WalletConnectCatalog | undefined;
  // Provider kinds to surface in the picker. On desktop we keep this narrow
  // (browserExtension + custodialService) because we can detect installed
  // extensions; on mobile the caller passes a wider set that includes
  // deep-link providers like Phantom Redirect.
  shownProviderTypes: ReadonlySet<string>;
  walletProviders: WalletProviderData[];
};

/**
 * Merges the available wallet providers and the WalletConnect catalog into
 * a single sorted list of entries. The `shownProviderTypes` set decides
 * which SDK provider kinds enter the picker — everything else is filtered
 * out before grouping AND before the catalog-exclusion check, so a hidden
 * provider does not silently hide its matching catalog entry.
 *
 * Provider entries are tagged with `isInstalled` so the caller can split
 * them into "Installed" vs "Other" sections while still using the same
 * SDK provider call to connect.
 *
 * Catalog wallets that match a surfaced provider (by normalized group
 * key/name) are filtered out so the provider entry wins.
 */
export const buildCombinedListEntries = ({
  catalog,
  shownProviderTypes,
  walletProviders,
}: BuildCombinedListEntriesParams): CombinedListEntry[] => {
  const shownProviders = walletProviders.filter((provider) =>
    shownProviderTypes.has(provider.walletProviderType)
  );

  return [
    ...buildProviderEntries({ walletProviders: shownProviders }),
    ...buildCatalogEntries({ catalog, walletProviders: shownProviders }),
  ];
};

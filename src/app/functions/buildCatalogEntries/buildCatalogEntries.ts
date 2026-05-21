import type {
  WalletConnectCatalog,
  WalletProviderData,
} from '@dynamic-labs-sdk/client';
import { excludeInstalledFromCatalog } from '@dynamic-labs-sdk/client';

import type {
  CatalogListEntry,
  CombinedCatalogGroup,
} from '../../components/walletPicker/CombinedWalletList.types';
import { sortWallets } from '../../components/walletConnect/sortWallets';

type BuildCatalogEntriesParams = {
  catalog: WalletConnectCatalog | undefined;
  walletProviders: WalletProviderData[];
};

/**
 * Iterates the WalletConnect catalog, drops entries that the user already
 * has installed (matched against `walletProviders`), and collapses
 * per-chain wallet records into one {@link CombinedCatalogGroup} per group.
 *
 * Currently scoped to EVM + SOL chains — extend the filter at the top of
 * the loop when new chains are supported.
 */
export const buildCatalogEntries = ({
  catalog,
  walletProviders,
}: BuildCatalogEntriesParams): CatalogListEntry[] => {
  if (!catalog) return [];

  const filteredCatalog = excludeInstalledFromCatalog({
    catalog,
    walletProviders,
  });
  const collected: CombinedCatalogGroup[] = [];

  for (const [walletKey, wallet] of Object.entries(filteredCatalog.wallets)) {
    if (wallet.chain !== 'EVM' && wallet.chain !== 'SOL') continue;

    const groupId = wallet.groupId || walletKey;
    const groupMeta = filteredCatalog.groups[groupId];
    const groupName = groupMeta?.name || wallet.name;

    const existing = collected.find((entry) => entry.id === groupId);

    if (existing) {
      existing.wallets = sortWallets([...existing.wallets, wallet]);
      continue;
    }

    collected.push({
      id: groupId,
      name: groupName,
      primaryColor: groupMeta?.primaryColor ?? wallet.primaryColor,
      spriteUrl: groupMeta?.spriteUrl || wallet.spriteUrl,
      wallets: [wallet],
    });
  }

  return sortWallets(collected).map((group) => ({ group, type: 'catalog' }));
};

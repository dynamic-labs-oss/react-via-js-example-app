import type { WalletProviderData } from '@dynamic-labs-sdk/client';
import {
  getWalletConnectCatalog,
  isMobile as isMobileUtil,
} from '@dynamic-labs-sdk/client';
import { filterDuplicates } from '@dynamic-labs-sdk/client/core';
import { useQuery } from '@tanstack/react-query';
import { type FC, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { buildCombinedListEntries } from '../../functions/buildCombinedListEntries';
import { getChainIcon } from '../../functions/getChainIcon';
import { useConnectCatalogWalletViaDeepLink } from '../../hooks/useConnectCatalogWalletViaDeepLink';
import { MAX_WALLETS_DISPLAY } from '../walletConnect/filterAndLimit';
import { WalletProviderButton } from '../wallets/WalletProviderButton';
import type {
  CombinedCatalogGroup,
  CombinedListEntry,
  WalletProviderEntry,
} from './CombinedWalletList.types';
import { WalletEntryChainPicker } from './WalletEntryChainPicker';

const isMobile = isMobileUtil();

// Desktop: we can detect installed extensions, so we narrow to providers
// that fit the "Installed" vs "Other" split (browserExtension is the only
// kind that should appear under "Installed"; custodialService is shown
// under "Other" alongside catalog wallets).
const DESKTOP_SHOWN_PROVIDER_TYPES: ReadonlySet<string> = new Set([
  'browserExtension',
  'custodialService',
]);

// Mobile: extension detection is unreliable so we collapse to a single list
// and additionally surface deep-link providers (e.g. Phantom Redirect),
// which on mobile open the wallet app via a custom URL scheme.
const MOBILE_SHOWN_PROVIDER_TYPES: ReadonlySet<string> = new Set([
  'browserExtension',
  'custodialService',
  'deepLink',
]);

type CombinedWalletListProps = {
  onCatalogQrRequested: (group: CombinedCatalogGroup) => void;
  onProviderClick: (walletProvider: WalletProviderData) => void;
  walletProviders: WalletProviderData[];
};

type MatchesSearchParams = {
  entry: CombinedListEntry;
  query: string;
};

const matchesSearch = ({ entry, query }: MatchesSearchParams): boolean => {
  const texts =
    entry.type === 'provider'
      ? [entry.displayName]
      : [entry.group.name, ...entry.group.wallets.map((w) => w.name)];
  return texts.some((text) => text.toLowerCase().includes(query));
};

/**
 * Wallet list for AuthRoute that combines installed wallet providers with
 * the WalletConnect catalog.
 *
 * Desktop renders two sections — "Installed" (browser extensions) and
 * "All wallets" (everything else). Mobile collapses to a single flat list
 * (no headers) and additionally surfaces deep-link providers like Phantom
 * Redirect since extension detection is unreliable there.
 *
 * Click handling:
 * - Provider entries (installed or not): `onProviderClick` triggers the
 *   regular SDK connect flow.
 * - Catalog entries: on mobile starts a WalletConnect session + opens the
 *   wallet's deep link; on desktop calls `onCatalogQrRequested` so the
 *   parent can render a branded QR view.
 */
export const CombinedWalletList: FC<CombinedWalletListProps> = ({
  onCatalogQrRequested,
  onProviderClick,
  walletProviders,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupKey, setSelectedGroupKey] = useState<string>();
  const [displayLimit, setDisplayLimit] = useState(MAX_WALLETS_DISPLAY);

  const { data: catalog } = useQuery({
    queryFn: () => getWalletConnectCatalog(),
    queryKey: ['walletConnectCatalog'],
  });

  const entries = useMemo(
    () =>
      buildCombinedListEntries({
        catalog,
        shownProviderTypes: isMobile
          ? MOBILE_SHOWN_PROVIDER_TYPES
          : DESKTOP_SHOWN_PROVIDER_TYPES,
        walletProviders,
      }),
    [catalog, walletProviders]
  );

  const { connectingWallet, connectWallet, isConnecting } =
    useConnectCatalogWalletViaDeepLink({
      onSuccess: () => setSelectedGroupKey(undefined),
    });

  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return entries;
    return entries.filter((entry) => matchesSearch({ entry, query }));
  }, [entries, searchQuery]);

  // Desktop splits into two sections:
  //   - "Installed":  browser-extension providers we actually detected
  //   - "Other":      everything else (non-installed providers + catalog)
  // Mobile collapses to a single list (no install detection), so we just
  // expose the full filtered list under one bucket.
  const installedEntries = isMobile
    ? []
    : filteredEntries.filter(
        (entry): entry is WalletProviderEntry =>
          entry.type === 'provider' && entry.isInstalled
      );
  const otherEntries = isMobile
    ? filteredEntries
    : filteredEntries.filter(
        (entry) => !(entry.type === 'provider' && entry.isInstalled)
      );

  const visibleOther = otherEntries.slice(0, displayLimit);
  const hiddenCount = otherEntries.length - visibleOther.length;

  const handleCatalogClick = (group: CombinedCatalogGroup) => {
    if (!isMobile) {
      onCatalogQrRequested(group);
      return;
    }
    if (group.wallets.length === 1) {
      connectWallet(group.wallets[0]);
      return;
    }
    setSelectedGroupKey(group.id);
  };

  const handleProviderEntryClick = (entry: WalletProviderEntry) => {
    if (entry.providers.length === 1) {
      onProviderClick(entry.providers[0]);
      return;
    }
    setSelectedGroupKey(entry.groupKey);
  };

  if (selectedGroupKey) {
    const selected = entries.find((entry) =>
      entry.type === 'provider'
        ? entry.groupKey === selectedGroupKey
        : entry.group.id === selectedGroupKey
    );

    if (selected?.type === 'provider') {
      return (
        <WalletEntryChainPicker
          entry={selected}
          kind="provider"
          onClick={(provider) => {
            setSelectedGroupKey(undefined);
            onProviderClick(provider);
          }}
        />
      );
    }

    if (selected?.type === 'catalog') {
      return (
        <WalletEntryChainPicker
          connectingWallet={connectingWallet}
          entry={selected}
          isConnecting={isConnecting}
          kind="catalog"
          onClick={connectWallet}
        />
      );
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Input
        className="mb-1"
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setDisplayLimit(MAX_WALLETS_DISPLAY);
        }}
        placeholder="Search wallets..."
        value={searchQuery}
      />

      {installedEntries.length > 0 && (
        <>
          <SectionLabel>Installed</SectionLabel>
          {installedEntries.map((entry) => (
            <WalletProviderButton
              chainIcons={filterDuplicates(
                entry.providers.map((p) => p.chain)
              ).flatMap((chain) => {
                const Icon = getChainIcon(chain);
                return Icon ? [{ component: Icon, key: chain }] : [];
              })}
              displayName={entry.displayName}
              groupKey={entry.groupKey}
              iconSrc={entry.iconSrc}
              key={`provider-${entry.groupKey}`}
              onClick={() => handleProviderEntryClick(entry)}
            />
          ))}
        </>
      )}

      {visibleOther.length > 0 && (
        <>
          {!isMobile && (
            <SectionLabel
              // Add extra top margin when both sections are present so the
              // visual separation reads as "different group".
              withTopGap={installedEntries.length > 0}
            >
              All wallets
            </SectionLabel>
          )}
          {visibleOther.map((entry) => {
            if (entry.type === 'provider') {
              return (
                <WalletProviderButton
                  chainIcons={filterDuplicates(
                    entry.providers.map((p) => p.chain)
                  ).flatMap((chain) => {
                    const Icon = getChainIcon(chain);
                    return Icon ? [{ component: Icon, key: chain }] : [];
                  })}
                  displayName={entry.displayName}
                  groupKey={entry.groupKey}
                  iconSrc={entry.iconSrc}
                  key={`provider-${entry.groupKey}`}
                  onClick={() => handleProviderEntryClick(entry)}
                />
              );
            }

            const { group } = entry;
            const isThisGroupConnecting =
              isMobile &&
              isConnecting &&
              group.wallets.length === 1 &&
              connectingWallet?.name === group.wallets[0].name;

            return (
              <WalletProviderButton
                chainIcons={filterDuplicates(
                  group.wallets.map((w) => w.chain)
                ).flatMap((chain) => {
                  const Icon = getChainIcon(chain);
                  return Icon ? [{ component: Icon, key: chain }] : [];
                })}
                disabled={isMobile && isConnecting}
                displayName={group.name}
                groupKey={group.id}
                iconSrc={group.spriteUrl || undefined}
                key={`catalog-${group.id}`}
                loading={isThisGroupConnecting}
                onClick={() => handleCatalogClick(group)}
              />
            );
          })}

          {hiddenCount > 0 && (
            <Button
              className="w-full text-sm text-muted-foreground"
              onClick={() =>
                setDisplayLimit((current) => current + MAX_WALLETS_DISPLAY)
              }
              type="button"
              variant="ghost"
            >
              Show {Math.min(hiddenCount, MAX_WALLETS_DISPLAY)} more
              {hiddenCount > MAX_WALLETS_DISPLAY
                ? ` (${hiddenCount} remaining)`
                : ''}
            </Button>
          )}
        </>
      )}

      {filteredEntries.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No wallets match your search
        </p>
      )}
    </div>
  );
};

type SectionLabelProps = {
  children: string;
  withTopGap?: boolean;
};

const SectionLabel: FC<SectionLabelProps> = ({ children, withTopGap }) => (
  <p
    className={`text-[11px] text-muted-foreground uppercase tracking-wider font-medium select-none ${
      withTopGap ? 'mt-2' : ''
    }`}
  >
    {children}
  </p>
);

import {
  type WalletConnectCatalogWallet,
  getWalletConnectCatalog,
  waitForClientInitialized,
} from '@dynamic-labs-sdk/client';
import { filterDuplicates } from '@dynamic-labs-sdk/client/core';
import {
  connectAndVerifyWithWalletConnectEvm,
  connectWithWalletConnectEvm,
} from '@dynamic-labs-sdk/evm/wallet-connect';
import { useMutation, useQuery } from '@tanstack/react-query';
import { type FC, useCallback, useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import { shouldAutoVerifyWallets } from '@/store/shouldAutoVerifyWallets';
import { getChainIcon } from '../../functions/getChainIcon';
import { onSignIn } from '../../functions/onSignIn/onSignIn';
import { AutoVerifyWalletsSwitch } from '../AutoVerifyWalletsSwitch';
import { WalletProviderButton } from '../wallets/WalletProviderButton';
import { filterAndLimit } from './filterAndLimit';
import { openWalletConnectDeepLink } from './openWalletConnectDeepLink';
import { sortWallets } from './sortWallets';

type WalletConnectWalletListProps = {
  onConnectionComplete?: () => void;
  selectedGroupId: string | undefined;
  setSelectedGroupId: (groupId: string | undefined) => void;
};

export const WalletConnectWalletList: FC<WalletConnectWalletListProps> = ({
  onConnectionComplete,
  selectedGroupId,
  setSelectedGroupId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [connectingWallet, setConnectingWallet] =
    useState<WalletConnectCatalogWallet | null>(null);

  const { data: walletConnectCatalog, isLoading } = useQuery({
    queryFn: async () => getWalletConnectCatalog(),
    queryKey: ['walletConnectCatalog'],
  });

  const shouldAutoVerify = shouldAutoVerifyWallets();

  const { mutate: connectWallet, isPending: isConnecting } = useMutation({
    mutationFn: async (wallet: WalletConnectCatalogWallet) => {
      setConnectingWallet(wallet);

      const connect = shouldAutoVerify
        ? connectAndVerifyWithWalletConnectEvm
        : connectWithWalletConnectEvm;

      await waitForClientInitialized();

      const { uri, approval } = await connect();

      // Open wallet app with deep link
      openWalletConnectDeepLink({ uri, wallet });

      // Wait for connection approval
      await approval();

      setSelectedGroupId(undefined);
      setConnectingWallet(null);

      await onSignIn();

      onConnectionComplete?.();
    },
    onError: () => {
      setConnectingWallet(null);
    },
  });

  const walletsByGroup = useMemo(() => {
    if (!walletConnectCatalog) return [];

    const grouped: Array<{
      id: string;
      name: string;
      spriteUrl: string;
      wallets: WalletConnectCatalogWallet[];
    }> = [];

    for (const [walletKey, wallet] of Object.entries(
      walletConnectCatalog.wallets
    )) {
      // Filter out non-EVM wallets
      if (wallet.chain !== 'EVM') {
        continue;
      }

      const groupId = wallet.groupId || walletKey;

      const walletBookGroup = walletConnectCatalog.groups[groupId];

      const groupEntry = grouped.find((entry) => entry.id === groupId);

      if (groupEntry) {
        groupEntry.wallets = sortWallets([...groupEntry.wallets, wallet]);
        continue;
      }

      const name = walletBookGroup?.name || wallet.name;
      const spriteUrl = walletBookGroup?.spriteUrl || wallet.spriteUrl;

      grouped.push({
        id: groupId,
        name,
        spriteUrl,
        wallets: [wallet],
      });
    }

    return sortWallets(grouped);
  }, [walletConnectCatalog]);

  const filteredWalletsByGroup = useMemo(
    () =>
      filterAndLimit({
        getSearchableTexts: (group) => [
          group.name,
          ...group.wallets.map((wallet) => wallet.name),
        ],
        items: walletsByGroup,
        searchQuery,
      }),
    [walletsByGroup, searchQuery]
  );

  const onGroupClick = (groupId: string) => {
    const group = walletsByGroup.find((g) => g.id === groupId);

    if (group && group.wallets.length === 1) {
      // If group has only one wallet, connect directly
      onWalletClick(group.wallets[0]);
      return;
    }

    setSelectedGroupId(groupId);
  };

  const onWalletClick = useCallback(
    (wallet: WalletConnectCatalogWallet) => {
      connectWallet(wallet);
    },
    [connectWallet]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-sm text-muted-foreground">Loading wallets…</p>
      </div>
    );
  }

  if (!walletConnectCatalog) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-sm text-muted-foreground">Failed to load wallets</p>
      </div>
    );
  }

  if (selectedGroupId) {
    const selectedGroup = walletsByGroup.find((g) => g.id === selectedGroupId);

    if (!selectedGroup) {
      return null;
    }

    const filteredWallets = filterAndLimit({
      getSearchableTexts: (wallet) => [wallet.name],
      items: selectedGroup.wallets,
      searchQuery,
    });

    return (
      <div className="flex flex-col gap-2">
        <AutoVerifyWalletsSwitch className="mb-2" />

        <Input
          placeholder="Search wallets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-2"
        />

        {filteredWallets.map((wallet) => {
          const uniqueKey = `${wallet.spriteUrl}-${wallet.chain}-${wallet.name}`;
          const isConnectingThisWallet =
            isConnecting && connectingWallet?.name === wallet.name;

          return (
            <WalletProviderButton
              key={uniqueKey}
              groupKey={wallet.name}
              displayName={wallet.name}
              iconSrc={wallet.spriteUrl || undefined}
              chain={wallet.chain}
              onClick={() => onWalletClick(wallet)}
              loading={isConnectingThisWallet}
              disabled={isConnecting}
              chainIcons={[wallet.chain].flatMap((chain) => {
                const Icon = getChainIcon(chain);
                return Icon ? [{ component: Icon, key: chain }] : [];
              })}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <AutoVerifyWalletsSwitch className="mb-2" />

      <Input
        placeholder="Search wallets..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-2"
        autoFocus
      />

      {filteredWalletsByGroup.map(
        ({ id: groupId, name, spriteUrl, wallets }) => {
          const isSingleWallet = wallets.length === 1;
          const isConnectingThisGroup =
            isSingleWallet &&
            isConnecting &&
            connectingWallet?.name === wallets[0]?.name;

          return (
            <WalletProviderButton
              key={groupId}
              groupKey={groupId}
              displayName={name}
              iconSrc={spriteUrl || undefined}
              onClick={() => onGroupClick(groupId)}
              loading={isConnectingThisGroup}
              disabled={isConnecting}
              chainIcons={filterDuplicates(
                wallets.map((wallet) => wallet.chain)
              ).flatMap((chain) => {
                const Icon = getChainIcon(chain);
                return Icon ? [{ component: Icon, key: chain }] : [];
              })}
            />
          );
        }
      )}
    </div>
  );
};

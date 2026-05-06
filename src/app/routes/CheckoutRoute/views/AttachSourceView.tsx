import type { WalletProviderData } from '@dynamic-labs-sdk/client';
import {
  connectWithWalletProvider,
  removeWalletAccount,
  switchActiveNetwork,
} from '@dynamic-labs-sdk/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type FC } from 'react';

import { Button } from '../../../../components/ui/button';
import { useActiveNetworkData } from '../../../hooks/useActiveNetworkData';
import { useNetworksData } from '../../../hooks/useNetworksData';
import { useWalletAccounts } from '../../../hooks/useWalletAccounts';
import { useWalletProviders } from '../../../hooks/useWalletProviders';
import { WalletList } from '../../AuthRoute/WalletList';
import { TokenList } from './TokenList';

type AttachSourceViewProps = {
  onTokenSelect: (tokenAddress: string) => void;
  transactionAmount: number;
};

const formatAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

const ConnectedWalletView: FC<{
  onTokenSelect: (tokenAddress: string) => void;
  transactionAmount: number;
}> = ({ onTokenSelect, transactionAmount }) => {
  const walletAccounts = useWalletAccounts();
  const walletAccount = walletAccounts[0];
  const queryClient = useQueryClient();
  const { activeNetworkData, refetch: refetchNetwork } = useActiveNetworkData(
    walletAccount!
  );
  const { networksData } = useNetworksData();

  const walletNetworks = networksData.filter(
    (n) => n.chain === walletAccount?.chain
  );

  const handleDisconnect = async () => {
    await removeWalletAccount({ walletAccount: walletAccount! });
  };

  const handleSwitchNetwork = async (networkId: string) => {
    await switchActiveNetwork({ networkId, walletAccount: walletAccount! });
    await refetchNetwork();
    await queryClient.invalidateQueries({
      queryKey: ['checkoutTokenBalances', walletAccount?.id],
    });
  };

  if (!walletAccount) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm font-medium">
            {formatAddress(walletAccount.address)}
          </span>
          <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
            {walletAccount.chain}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void handleDisconnect()}
        >
          Change
        </Button>
      </div>

      <div className="border-t pt-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground">Token Balances</p>
          {walletNetworks.length > 1 && (
            <div className="flex items-center gap-1.5">
              {activeNetworkData?.iconUrl && (
                <img
                  className="w-3.5 h-3.5 rounded-full"
                  src={activeNetworkData.iconUrl}
                  alt={activeNetworkData.displayName}
                />
              )}
              <select
                className="text-xs bg-transparent border border-border rounded-md px-1.5 py-0.5 text-foreground cursor-pointer"
                value={activeNetworkData?.networkId ?? ''}
                onChange={(e) => void handleSwitchNetwork(e.target.value)}
              >
                {walletNetworks.map((network) => (
                  <option key={network.networkId} value={network.networkId}>
                    {network.displayName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <TokenList
          walletAccount={walletAccount}
          minMarketValue={transactionAmount}
          onTokenSelect={onTokenSelect}
        />
      </div>
    </div>
  );
};

export const AttachSourceView: FC<AttachSourceViewProps> = ({
  onTokenSelect,
  transactionAmount,
}) => {
  const walletProviders = useWalletProviders();
  const walletAccounts = useWalletAccounts();
  const connectedWallet = walletAccounts[0] ?? null;

  const connectMutation = useMutation({
    mutationFn: (walletProvider: WalletProviderData) =>
      connectWithWalletProvider({ walletProviderKey: walletProvider.key }),
  });

  if (connectedWallet) {
    return (
      <ConnectedWalletView
        transactionAmount={transactionAmount}
        onTokenSelect={onTokenSelect}
      />
    );
  }

  if (connectMutation.isPending) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">Connecting wallet...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Connect a wallet to continue
      </p>

      {connectMutation.error && (
        <p className="text-sm text-destructive">
          {connectMutation.error.message}
        </p>
      )}

      <WalletList
        walletProviders={walletProviders}
        onClick={(wp) => connectMutation.mutate(wp)}
      />

      {walletProviders.length === 0 && (
        <p className="text-xs text-muted-foreground text-center">
          No wallet providers found. Make sure the SDK is initialized.
        </p>
      )}
    </div>
  );
};

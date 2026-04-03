import { isBitcoinWalletAccount } from '@dynamic-labs-sdk/bitcoin';
import { isTonWalletAccount } from '@dynamic-labs-sdk/ton';
import {
  type WalletAccount,
  isHardwareWalletAccount,
  isWalletAccountVerified,
  removeWalletAccount,
  verifyWalletAccount,
} from '@dynamic-labs-sdk/client';
import { isWaasWalletAccount } from '@dynamic-labs-sdk/client/waas';
import { isSolanaWalletAccount } from '@dynamic-labs-sdk/solana';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle, ChevronDown, RefreshCw, Trash2 } from 'lucide-react';
import { type FC, useMemo, useState } from 'react';

import { Button } from '../../../../components/ui/button';
import { useActiveNetworkData } from '../../../hooks/useActiveNetworkData';
import { useBalance } from '../../../hooks/useBalance';
import { useTokenBalances } from '../../../hooks/useTokenBalances';
import { useWalletProviderDataByKey } from '../../../hooks/useWalletProviderDataByKey';
import { formatBalance, formatUsd } from '../../../utils/formatBalance';
import { SwapTokenDialog } from '../../swap/SwapTokenDialog';
import { BitcoinWalletActions } from '../bitcoin/BitcoinWalletActions';
import { CopyableAddress } from '../CopyableAddress';
import { ExportPrivateKeyDialog } from '../ExportPrivateKeyDialog';
import { NetworkSwitcher } from '../NetworkSwitcher';
import { SendTransactionDialog } from '../SendTransactionDialog';
import { SignMessageDialog } from '../SignMessageDialog';
import { SimulateTransactionDialog } from '../SimulateTransactionDialog';
import { SolanaWalletActions } from '../solana/SolanaWalletActions';
import { TonWalletActions } from '../ton/TonWalletActions';
import { WaasDelegationDialog } from '../WaasDelegationDialog';
import { WaasTestDialog } from '../WaasTestDialog';
import { WalletAddressesWithTypes } from '../WalletAddressesWithTypes';

const TOKEN_PREVIEW_COUNT = 4;

export const WalletAccountCard: FC<{ walletAccount: WalletAccount }> = ({
  walletAccount,
}) => {
  const isWaasAccount = isWaasWalletAccount({ walletAccount });
  const isVerified = isWalletAccountVerified({ walletAccount });
  const [showAllTokens, setShowAllTokens] = useState(false);

  const { activeNetworkData } = useActiveNetworkData(walletAccount);

  const { balance, refetch: refetchBalance } = useBalance(walletAccount);

  const {
    tokenBalances,
    isLoading: isLoadingTokens,
    refetch: refetchTokenBalances,
  } = useTokenBalances(walletAccount);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleNetworkUpdated = async () => {
    await refetchBalance();
  };

  const { walletProviderData } = useWalletProviderDataByKey(
    walletAccount.walletProviderKey
  );

  const {
    mutate: verify,
    isPending: isVerifyingWalletAccount,
    error: verifyError,
  } = useMutation({
    mutationFn: () => verifyWalletAccount({ walletAccount }),
  });

  const handleRefreshBalances = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchBalance(), refetchTokenBalances()]);
    setIsRefreshing(false);
  };

  const visibleTokens = showAllTokens
    ? tokenBalances
    : tokenBalances.slice(0, TOKEN_PREVIEW_COUNT);
  const hiddenTokenCount = tokenBalances.length - TOKEN_PREVIEW_COUNT;
  const hasTokens = tokenBalances.length > 0;

  const totalUsdValue = useMemo(() => {
    return tokenBalances.reduce(
      (sum, token) => sum + (token.marketValue ?? 0),
      0
    );
  }, [tokenBalances]);

  return (
    <div
      key={walletAccount.id}
      className="group rounded-2xl bg-card border border-border/60 shadow-card flex flex-col"
      data-testid={`wallet-card-${walletAccount.address}`}
    >
      {/* Identity row */}
      <div className="px-4 sm:px-6 pt-5 pb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {walletProviderData ? (
            <div className="w-9 h-9 rounded-full bg-muted/60 flex items-center justify-center flex-shrink-0 ring-1 ring-black/[0.06]">
              <img
                className="w-5 h-5"
                src={walletProviderData.metadata.icon}
                alt={walletProviderData.metadata.displayName}
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-muted/60 flex items-center justify-center flex-shrink-0 ring-1 ring-black/[0.06]">
              <span className="text-muted-foreground text-xs">?</span>
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground truncate">
                {walletProviderData?.metadata.displayName ?? 'Unknown Wallet'}
              </p>
              <span className="flex-shrink-0 text-[11px] font-medium text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                {walletAccount.chain}
              </span>
              {isHardwareWalletAccount({ walletAccount }) && (
                <span className="flex-shrink-0 text-[11px] font-medium text-amber-600 bg-amber-100 rounded px-1.5 py-0.5">
                  Ledger
                </span>
              )}
            </div>
            <CopyableAddress address={walletAccount.address} />
            <p className="text-[11px] text-muted-foreground/60 font-mono">
              {walletAccount.walletProviderKey}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {/* Aggregate USD value */}
          {totalUsdValue > 0 && (
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {formatUsd(totalUsdValue)}
            </p>
          )}

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                isVerified ? 'text-emerald-600' : 'text-muted-foreground'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isVerified ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                }`}
              />
              is verified: {isVerified ? 'true' : 'false'}
            </span>

            <span className="text-border text-xs">|</span>

            <NetworkSwitcher
              walletAccount={walletAccount}
              onNetworkUpdated={handleNetworkUpdated}
            />
          </div>
        </div>
      </div>

      {/* Token balances */}
      <div className="px-4 sm:px-6 pb-4">
        <div className="flex items-center justify-end mb-1.5">
          <button
            onClick={handleRefreshBalances}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer disabled:cursor-default"
          >
            <RefreshCw
              className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            {isRefreshing ? 'Refreshing' : 'Refresh'}
          </button>
        </div>
        {hasTokens ? (
          <div className="rounded-xl border border-border/50 overflow-hidden">
            {visibleTokens.map((token, i) => (
              <div
                key={`${token.address}-${i}`}
                className={`flex items-center gap-3 px-4 py-2.5 ${
                  i > 0 ? 'border-t border-border/30' : ''
                }`}
              >
                {token.logoURI ? (
                  <img
                    className="w-7 h-7 rounded-full flex-shrink-0"
                    src={token.logoURI}
                    alt={token.symbol}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {token.symbol?.slice(0, 2)}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {token.symbol}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {token.name}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-foreground tabular-nums">
                    {formatBalance(token.balance)}
                  </p>
                  {token.marketValue != null && token.marketValue > 0 && (
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {formatUsd(token.marketValue)}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {hiddenTokenCount > 0 && !showAllTokens && (
              <button
                onClick={() => setShowAllTokens(true)}
                className="w-full flex items-center justify-center gap-1 px-4 py-2 border-t border-border/30 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors cursor-pointer"
              >
                Show {hiddenTokenCount} more token
                {hiddenTokenCount !== 1 ? 's' : ''}
                <ChevronDown className="w-3 h-3" />
              </button>
            )}

            {showAllTokens && tokenBalances.length > TOKEN_PREVIEW_COUNT && (
              <button
                onClick={() => setShowAllTokens(false)}
                className="w-full flex items-center justify-center gap-1 px-4 py-2 border-t border-border/30 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors cursor-pointer"
              >
                Show less
                <ChevronDown className="w-3 h-3 rotate-180" />
              </button>
            )}
          </div>
        ) : isLoadingTokens ? (
          <div className="rounded-xl border border-border/50 px-4 py-6 flex justify-center">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
              Loading balances
            </div>
          </div>
        ) : balance ? (
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-2.5">
              {activeNetworkData?.nativeCurrency.iconUrl ? (
                <img
                  className="w-7 h-7 rounded-full flex-shrink-0"
                  src={activeNetworkData.nativeCurrency.iconUrl}
                  alt={activeNetworkData.nativeCurrency.symbol}
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {activeNetworkData?.nativeCurrency.symbol?.slice(0, 2) ??
                      '?'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {activeNetworkData?.nativeCurrency.symbol ?? 'Native'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeNetworkData?.nativeCurrency.name ?? 'Native token'}
                </p>
              </div>
              <p className="text-sm font-medium text-foreground tabular-nums">
                {balance}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Addresses with types */}
      <div className="px-4 sm:px-6 pb-2">
        <WalletAddressesWithTypes walletAccount={walletAccount} />
      </div>

      {/* Actions */}
      <div className="px-4 sm:px-6 pb-5 pt-4 border-t border-border/40">
        <div className="flex flex-wrap gap-2 [&_button]:rounded-full [&_button]:h-7 [&_button]:px-3 [&_button]:text-xs [&_button]:font-medium [&_button]:border [&_button]:border-border/50 [&_button]:shadow-none">
          {!isVerified && (
            <Button
              variant="default"
              size="sm"
              className="border-transparent"
              onClick={() => verify()}
              loading={isVerifyingWalletAccount}
            >
              Verify
            </Button>
          )}

          <SignMessageDialog walletAccount={walletAccount} />

          {activeNetworkData && (
            <>
              <SendTransactionDialog
                walletAccount={walletAccount}
                activeNetworkData={activeNetworkData}
              />
              <SimulateTransactionDialog
                walletAccount={walletAccount}
                activeNetworkData={activeNetworkData}
                balance={balance ?? undefined}
              />
              <SwapTokenDialog
                walletAccount={walletAccount}
                activeNetworkData={activeNetworkData}
              />
            </>
          )}

          {isBitcoinWalletAccount(walletAccount) && (
            <BitcoinWalletActions walletAccount={walletAccount} />
          )}

          {isSolanaWalletAccount(walletAccount) && activeNetworkData && (
            <SolanaWalletActions
              walletAccount={walletAccount}
              activeNetworkData={activeNetworkData}
            />
          )}

          {isTonWalletAccount(walletAccount) && (
            <TonWalletActions walletAccount={walletAccount} />
          )}

          {isWaasAccount && (
            <>
              <ExportPrivateKeyDialog walletAccount={walletAccount} />
              <WaasDelegationDialog walletAccount={walletAccount} />
              <WaasTestDialog walletAccount={walletAccount} />
            </>
          )}

          {!isWaasAccount && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground/50 hover:text-destructive hover:bg-destructive/5 hover:border-destructive/20"
              onClick={() => removeWalletAccount({ walletAccount })}
            >
              <Trash2 className="w-3 h-3" />
              Remove
            </Button>
          )}
        </div>
      </div>

      {verifyError && (
        <div className="mx-4 sm:mx-6 mb-4 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5">
          <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-xs text-destructive">{verifyError.message}</p>
        </div>
      )}
    </div>
  );
};

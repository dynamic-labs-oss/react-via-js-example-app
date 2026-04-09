import {
  type GetTransactionHistoryResponse,
  type NetworkData,
  getTransactionHistory,
} from '@dynamic-labs-sdk/client';
import type { SolanaWalletAccount } from '@dynamic-labs-sdk/solana';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDownLeft, ArrowUpRight, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { type FC, useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type AssetTransferMetadata = {
  decimals?: number;
  imageUri?: string;
  name?: string;
  symbol?: string;
};

type AssetTransfer = {
  amount: number;
  fromAddress: string;
  metadata?: AssetTransferMetadata;
  toAddress: string;
  tokenAddress?: string;
};

type TransactionHistoryDialogProps = {
  activeNetworkData: NetworkData;
  walletAccount: SolanaWalletAccount;
};

export const TransactionHistoryDialog: FC<TransactionHistoryDialogProps> = ({
  walletAccount,
  activeNetworkData,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const queryClient = useQueryClient();

  const queryKey = [
    'transactionHistory',
    walletAccount.address,
    activeNetworkData.networkId,
  ];

  const {
    data: transactionData,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    enabled: isOpen,
    queryFn: () =>
      getTransactionHistory({
        address: walletAccount.address,
        chain: walletAccount.chain,
        networkId: Number(activeNetworkData.networkId),
      }),
    queryKey,
  });

  const loadMore = useCallback(async () => {
    if (!transactionData?.nextOffset || isLoadingMore) return;

    setIsLoadingMore(true);

    try {
      const nextPage = await getTransactionHistory({
        address: walletAccount.address,
        chain: walletAccount.chain,
        networkId: Number(activeNetworkData.networkId),
        offset: transactionData.nextOffset,
      });

      queryClient.setQueryData(queryKey, {
        ...nextPage,
        transactions: [
          ...transactionData.transactions,
          ...nextPage.transactions,
        ],
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [transactionData, isLoadingMore, walletAccount, activeNetworkData, queryClient, queryKey]);

  const formatDateHeading = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      timeStyle: 'short',
    }).format(date);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatAmount = (transfer: AssetTransfer) => {
    const decimals = transfer.metadata?.decimals ?? 9;
    const formatted = transfer.amount / Math.pow(10, decimals);

    return formatted.toLocaleString(undefined, {
      maximumFractionDigits: 6,
    });
  };

  const isOutgoing = (transfer: AssetTransfer) => {
    return (
      transfer.fromAddress.toLowerCase() === walletAccount.address.toLowerCase()
    );
  };

  const groupTransactionsByDate = (transactions: GetTransactionHistoryResponse['transactions']) => {
    const groups: Record<string, typeof transactions> = {};

    for (const tx of transactions) {
      const dateKey = formatDateHeading(new Date(tx.transactionTimestamp));

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(tx);
    }

    return groups;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">Transaction History</Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[480px] max-h-[80vh] overflow-hidden flex flex-col"
        aria-describedby="transaction-history-dialog"
      >
        <div className="flex items-center justify-between">
          <DialogTitle>Recent Activity</DialogTitle>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50"
            aria-label="Refresh transactions"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`}
            />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto -mx-2 px-2">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && transactionData?.transactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found for this wallet.
            </div>
          )}

          {!isLoading && transactionData?.transactions && transactionData.transactions.length > 0 && (
            <div className="flex flex-col gap-4">
              {Object.entries(groupTransactionsByDate(transactionData.transactions)).map(
                ([dateLabel, txs]) => (
                  <div key={dateLabel} className="flex flex-col gap-2">
                    <h3 className="text-xs font-medium text-muted-foreground px-1">
                      {dateLabel}
                    </h3>

                    {txs.map((tx) => {
                      const primaryTransfer = tx.assetTransfers[0] as AssetTransfer | undefined;
                      const outgoing = primaryTransfer
                        ? isOutgoing(primaryTransfer)
                        : tx.fromAddress.toLowerCase() === walletAccount.address.toLowerCase();
                      const counterparty = outgoing ? tx.toAddress : tx.fromAddress;

                      return (
                        <a
                          key={tx.transactionHash}
                          href={tx.blockExplorerUrls[0] ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer group"
                        >
                          <div className="relative flex-shrink-0">
                            {primaryTransfer?.metadata?.imageUri ? (
                              <img
                                src={primaryTransfer.metadata.imageUri}
                                alt={primaryTransfer.metadata.name ?? 'Token'}
                                className="w-9 h-9 rounded-full"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                                {outgoing ? (
                                  <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                  <ArrowDownLeft className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                            )}

                            <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                              outgoing ? 'bg-orange-100 dark:bg-orange-900/50' : 'bg-green-100 dark:bg-green-900/50'
                            }`}>
                              {outgoing ? (
                                <ArrowUpRight className="w-2.5 h-2.5 text-orange-600 dark:text-orange-400" />
                              ) : (
                                <ArrowDownLeft className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                              )}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-sm">
                                {outgoing ? 'Sent' : 'Received'}
                              </span>

                              {primaryTransfer && (
                                <span className={`text-sm font-medium whitespace-nowrap ${
                                  outgoing
                                    ? 'text-foreground'
                                    : 'text-green-600 dark:text-green-400'
                                }`}>
                                  {outgoing ? '-' : '+'}
                                  {formatAmount(primaryTransfer)}{' '}
                                  {primaryTransfer.metadata?.symbol ?? 'Unknown'}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-muted-foreground">
                                {outgoing ? 'To' : 'From'}{' '}
                                {truncateAddress(counterparty)}
                              </span>

                              <span className="text-xs text-muted-foreground">
                                {formatTime(new Date(tx.transactionTimestamp))}
                              </span>
                            </div>

                            {tx.assetTransfers.length > 1 && (
                              <div className="flex flex-col gap-1 mt-1.5 pt-1.5 border-t border-border/50">
                                {tx.assetTransfers.slice(1).map((transfer, index) => (
                                  <div
                                    key={`${tx.transactionHash}-transfer-${index}`}
                                    className="flex items-center justify-between text-xs"
                                  >
                                    <span className="text-muted-foreground">
                                      {isOutgoing(transfer) ? 'Sent' : 'Received'}
                                    </span>

                                    <span className={`font-medium ${
                                      isOutgoing(transfer)
                                        ? 'text-foreground'
                                        : 'text-green-600 dark:text-green-400'
                                    }`}>
                                      {isOutgoing(transfer) ? '-' : '+'}
                                      {formatAmount(transfer)}{' '}
                                      {transfer.metadata?.symbol ?? 'Unknown'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {transactionData?.nextOffset && (
          <div className="pt-2 border-t border-border text-center">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load more transactions'
              )}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

import { Wallet } from 'lucide-react';
import { type FC } from 'react';

import { CreateWaasWalletDialog } from '../../components/wallets/CreateWaasWalletDialog';
import { LinkWalletDialog } from '../../components/wallets/LinkWalletDialog';
import { WalletAccountCard } from '../../components/wallets/WalletAccountCard';
import { useWalletAccounts } from '../../hooks/useWalletAccounts';

export const WalletsRoute: FC = () => {
  const walletAccounts = useWalletAccounts();

  return (
    <div className="min-h-screen bg-page mt-16 md:mt-0">
      <div className="mx-auto max-w-[720px] px-4 sm:px-6 pt-8 sm:pt-10 pb-6 sm:pb-8 flex flex-col gap-6">
        {/* Page header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">
              Wallets
            </h1>
            {walletAccounts.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {walletAccounts.length} connected account
                {walletAccounts.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <CreateWaasWalletDialog />
            <LinkWalletDialog />
          </div>
        </div>

        {walletAccounts.length === 0 && (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-border/60 shadow-sm flex items-center justify-center">
              <Wallet className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-foreground">
                No wallets connected
              </p>
              <p className="text-[13px] text-muted-foreground mt-1 max-w-[280px]">
                Create an embedded wallet or link an external wallet to get
                started.
              </p>
            </div>
          </div>
        )}

        {walletAccounts.map((walletAccount) => (
          <WalletAccountCard
            key={walletAccount.id}
            walletAccount={walletAccount}
          />
        ))}
      </div>
    </div>
  );
};

import {
  AlertCircle,
  ArrowRightLeft,
  CreditCard,
  Info,
  Wallet,
} from 'lucide-react';
import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { CoinbaseOnrampBuyDialog } from '../../components/funding/CoinbaseOnrampBuyDialog';
import { CoinbaseOnrampOrderDialog } from '../../components/funding/CoinbaseOnrampOrderDialog';
import { CryptoDotComPaymentDialog } from '../../components/funding/CryptoDotComPaymentDialog';
import { ExchangeAccountCard } from '../../components/funding/ExchangeAccountCard';
import { KrakenTransferDialog } from '../../components/funding/KrakenTransferDialog';
import { KrakenIcon } from '../../components/icons/thirdParty';
import { useCompleteSocialAuthRedirect } from '../../hooks/useCompleteSocialAuthRedirect';
import { useSocialAccounts } from '../../hooks/useSocialAccounts';

export const FundingRoute: FC = () => {
  const navigate = useNavigate();
  const socialAccounts = useSocialAccounts();

  const { isLoading: isCompletingSocialAuthRedirect, error } =
    useCompleteSocialAuthRedirect({
      onSuccess: () => {
        navigate('/funding', { replace: true });
      },
    });

  const krakenAccount = socialAccounts.find(
    (account) => account.provider === 'kraken'
  );

  return (
    <div className="min-h-screen bg-page mt-16 md:mt-0">
      <div className="mx-auto max-w-[720px] px-4 sm:px-6 pt-8 sm:pt-10 pb-6 sm:pb-8 flex flex-col gap-5">
        {/* Page header */}
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            Funding
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Exchange connections, transfers & onramp
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-destructive/20 bg-destructive/5">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
            <p className="text-xs text-destructive">
              Failed to complete exchange authentication
            </p>
          </div>
        )}

        {/* QA Setup Banner */}
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-border/60 bg-muted/30">
          <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-foreground">
              QA Setup Instructions
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              To test Kraken integration, enable <strong>Kraken OAuth</strong>{' '}
              in your Dynamic dashboard:{' '}
              <strong>Configurations → Social Sign-On → Enable Kraken</strong>
            </p>
          </div>
        </div>

        {/* Exchange Connections */}
        <div className="rounded-2xl bg-card border border-border/60 shadow-card">
          <div className="px-5 pt-4 pb-3 flex items-center gap-2.5">
            <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Exchange Connections
            </p>
          </div>
          <div className="px-3 pb-3">
            <div className="rounded-xl border border-border/40 overflow-hidden">
              <ExchangeAccountCard
                providerDetails={{
                  icon: <KrakenIcon className="w-4 h-4" />,
                  key: 'kraken',
                  name: 'Kraken',
                }}
                exchangeAccount={krakenAccount}
                isLoading={isCompletingSocialAuthRedirect}
              />
            </div>
          </div>
        </div>

        {/* Exchange Transfers */}
        <div className="rounded-2xl bg-card border border-border/60 shadow-card">
          <div className="px-5 pt-4 pb-3 flex items-center gap-2.5">
            <ArrowRightLeft className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Exchange Transfers
            </p>
          </div>
          <div className="px-5 pb-4">
            <div className="flex items-center gap-2 flex-wrap [&_button]:rounded-full [&_button]:h-7 [&_button]:px-3 [&_button]:text-xs [&_button]:font-medium [&_button]:shadow-none">
              <KrakenTransferDialog />
            </div>
          </div>
        </div>

        {/* Onramp */}
        <div className="rounded-2xl bg-card border border-border/60 shadow-card">
          <div className="px-5 pt-4 pb-3 flex items-center gap-2.5">
            <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Onramp
            </p>
          </div>
          <div className="px-5 pb-4">
            <div className="flex items-center gap-2 flex-wrap [&_button]:rounded-full [&_button]:h-7 [&_button]:px-3 [&_button]:text-xs [&_button]:font-medium [&_button]:shadow-none">
              <CoinbaseOnrampOrderDialog />
              <CoinbaseOnrampBuyDialog />
              <CryptoDotComPaymentDialog />
            </div>
          </div>
        </div>

        {/* External Wallets */}
        <div className="rounded-2xl bg-card border border-border/60 shadow-card">
          <div className="px-5 pt-4 pb-3 flex items-center gap-2.5">
            <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              External Wallets
            </p>
          </div>
          <div className="px-5 pb-5">
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

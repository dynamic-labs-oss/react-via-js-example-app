import {
  type SocialAccount,
  authenticateWithSocial,
  unlinkSocialAccount,
} from '@dynamic-labs-sdk/client';
import { CheckCircle2, Info } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '../../../../components/ui/button';

type ExchangeProviderDetails = {
  icon: React.ReactNode;
  key: 'kraken';
  name: string;
};

type ExchangeAccountCardProps = {
  exchangeAccount: SocialAccount | undefined;
  isLoading: boolean;
  providerDetails: ExchangeProviderDetails;
};

export const ExchangeAccountCard = ({
  providerDetails,
  exchangeAccount,
  isLoading,
}: ExchangeAccountCardProps) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await authenticateWithSocial({
        provider: providerDetails.key,
        redirectUrl: window.location.href,
      });
    } catch {
      toast.error(
        `Failed to connect to ${providerDetails.name}. Please ensure ${providerDetails.name} OAuth is enabled in your Dynamic environment settings.`,
        { duration: 6000 }
      );
      setIsConnecting(false);
    }
  };

  return (
    <div className="px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center flex-shrink-0 ring-1 ring-black/[0.06]">
          {providerDetails.icon}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            {providerDetails.name}
          </p>
          {exchangeAccount ? (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Connected</span>
              {exchangeAccount.accountId && (
                <>
                  <span className="text-border">·</span>
                  <span className="font-mono truncate">
                    ID: {exchangeAccount.accountId}
                  </span>
                </>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground">Not connected</p>
          )}
        </div>

        <div className="flex gap-2 [&_button]:rounded-full [&_button]:h-7 [&_button]:px-3 [&_button]:text-xs [&_button]:font-medium [&_button]:shadow-none">
          {exchangeAccount ? (
            <Button
              variant="ghost"
              disabled={isLoading}
              className="text-destructive hover:text-destructive hover:bg-destructive/5"
              onClick={() =>
                void unlinkSocialAccount({
                  verifiedCredentialId: exchangeAccount.verifiedCredentialId,
                })
              }
            >
              Disconnect
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleConnect}
              disabled={isLoading || isConnecting}
              loading={isConnecting}
            >
              Connect
            </Button>
          )}
        </div>
      </div>

      {!exchangeAccount && (
        <div className="mt-2.5 ml-11 flex items-start gap-2 px-3 py-2 rounded-lg bg-muted/30">
          <Info className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Enable {providerDetails.name} OAuth in your Dynamic dashboard under{' '}
            <strong>Configurations → Social Sign-On</strong> before connecting.
          </p>
        </div>
      )}

      {exchangeAccount && (
        <p className="mt-1.5 ml-11 text-[11px] text-muted-foreground/60 font-mono truncate">
          {exchangeAccount.verifiedCredentialId}
        </p>
      )}
    </div>
  );
};

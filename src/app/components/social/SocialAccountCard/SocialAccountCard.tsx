import {
  type SocialAccount,
  authenticateWithSocial,
  unlinkSocialAccount,
} from '@dynamic-labs-sdk/client';
import { UserCircle2 } from 'lucide-react';

import { Button } from '../../../../components/ui/button';
import type { SocialProviderDetails } from '../socialProvidersDetails';

type SocialAccountCardProps = {
  isLoading: boolean;
  providerDetails: SocialProviderDetails;
  socialAccount: SocialAccount | undefined;
};

export const SocialAccountCard = ({
  providerDetails,
  socialAccount,
  isLoading,
}: SocialAccountCardProps) => {
  return (
    <div className="px-4 py-3.5 hover:bg-muted/30 transition-colors">
      {/* Provider row */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center flex-shrink-0 ring-1 ring-black/[0.06]">
          <div className="w-4.5 h-4.5 flex items-center justify-center [&_svg]:w-4 [&_svg]:h-4">
            {providerDetails.icon}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            {providerDetails.name}
          </p>
          {socialAccount && (
            <p className="text-xs text-muted-foreground truncate">
              {socialAccount.displayName ??
                socialAccount.username ??
                socialAccount.emails[0] ??
                'Linked'}
            </p>
          )}
        </div>

        {socialAccount ? (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full h-7 px-3 text-xs font-medium border border-border/50 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/5 hover:border-destructive/20"
            disabled={isLoading}
            onClick={() =>
              void unlinkSocialAccount({
                verifiedCredentialId: socialAccount.verifiedCredentialId,
              })
            }
          >
            Unlink
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full h-7 px-3 text-xs font-medium"
            disabled={isLoading}
            onClick={() =>
              void authenticateWithSocial({
                provider: providerDetails.key,
                redirectUrl: window.location.href,
              })
            }
          >
            Link
          </Button>
        )}
      </div>

      {/* Linked account details */}
      {socialAccount && (
        <div className="mt-3 ml-11 flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            {socialAccount.photos.length > 0 ? (
              <img
                src={socialAccount.photos[0]}
                alt="avatar"
                className="w-7 h-7 rounded-full ring-1 ring-black/[0.06]"
              />
            ) : (
              <UserCircle2 className="w-7 h-7 text-muted-foreground/40" />
            )}
            <div className="min-w-0">
              {socialAccount.displayName && (
                <p className="text-xs font-medium text-foreground truncate">
                  {socialAccount.displayName}
                </p>
              )}
              {socialAccount.username && (
                <p className="text-[11px] text-muted-foreground truncate">
                  @{socialAccount.username}
                </p>
              )}
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground/60 space-y-0.5">
            {socialAccount.emails.length > 0 && (
              <p>Email: {socialAccount.emails.join(', ')}</p>
            )}
            <p className="font-mono">
              Credential: {socialAccount.verifiedCredentialId}
            </p>
            {socialAccount.accountId && (
              <p className="font-mono">Account: {socialAccount.accountId}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

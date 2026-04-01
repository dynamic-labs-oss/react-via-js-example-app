import { AlertCircle } from 'lucide-react';
import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { ErrorMessage } from '../../components/ErrorMessage';
import { SocialAccountCard } from '../../components/social/SocialAccountCard';
import { SOCIAL_PROVIDERS_DETAILS } from '../../components/social/socialProvidersDetails';
import { useCompleteSocialAuthRedirect } from '../../hooks/useCompleteSocialAuthRedirect';
import { useSocialAccounts } from '../../hooks/useSocialAccounts';

export const SocialRoute: FC = () => {
  const navigate = useNavigate();
  const socialAccounts = useSocialAccounts();

  const { isLoading: isCompletingSocialAuthRedirect, error } =
    useCompleteSocialAuthRedirect({
      onSuccess: () => {
        navigate('/social', { replace: true });
      },
    });

  const linkedCount = socialAccounts.length;

  return (
    <div className="min-h-screen bg-page mt-16 md:mt-0">
      <div className="mx-auto max-w-[720px] px-4 sm:px-6 pt-8 sm:pt-10 pb-6 sm:pb-8 flex flex-col gap-5">
        {/* Page header */}
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            Social
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {linkedCount > 0
              ? `${linkedCount} linked account${linkedCount !== 1 ? 's' : ''}`
              : 'No accounts linked'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5">
            <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
            <ErrorMessage
              error={error}
              defaultMessage="Failed to complete social authentication"
            />
          </div>
        )}

        {/* Providers card */}
        <div className="rounded-2xl bg-card border border-border/60 shadow-card">
          <div className="px-3 py-3">
            <div className="rounded-xl border border-border/40 overflow-hidden divide-y divide-border/30">
              {SOCIAL_PROVIDERS_DETAILS.map((providerDetails) => {
                const socialAccount = socialAccounts.find(
                  (account) => account.provider === providerDetails.key
                );
                return (
                  <SocialAccountCard
                    isLoading={isCompletingSocialAuthRedirect}
                    key={providerDetails.key}
                    providerDetails={providerDetails}
                    socialAccount={socialAccount}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

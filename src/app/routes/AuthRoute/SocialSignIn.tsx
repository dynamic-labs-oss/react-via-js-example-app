import type { SocialProvider } from '@dynamic-labs-sdk/client';
import { authenticateWithSocial } from '@dynamic-labs-sdk/client';
import { type FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { promptCaptchaIfRequired } from '../../../store/captcha';
import { SOCIAL_PROVIDERS_DETAILS } from '../../components/social/socialProvidersDetails';
import { onSignIn } from '../../functions/onSignIn/onSignIn';
import { useCompleteSocialAuthRedirect } from '../../hooks/useCompleteSocialAuthRedirect';

export const SocialSignIn: FC = () => {
  const navigate = useNavigate();

  const { isLoading: isCompletingSocialAuthRedirect } =
    useCompleteSocialAuthRedirect({
      onSuccess: () => {
        void onSignIn();

        navigate('/wallets', { replace: true });
      },
    });

  const handleSocialSignIn = useCallback(async (provider: SocialProvider) => {
    await promptCaptchaIfRequired();

    await authenticateWithSocial({
      provider,
      redirectUrl: window.location.href,
    });
  }, []);

  if (isCompletingSocialAuthRedirect) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-4">
        <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
        <p className="text-xs text-muted-foreground">Completing sign-in…</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {SOCIAL_PROVIDERS_DETAILS.map((providerDetails) => (
        <button
          key={providerDetails.key}
          onClick={() => void handleSocialSignIn(providerDetails.key)}
          className="w-12 h-12 rounded-xl border border-border hover:bg-muted/50 flex items-center justify-center transition-colors"
          title={`Sign in with ${providerDetails.name}`}
          type="button"
        >
          {providerDetails.icon}
        </button>
      ))}
    </div>
  );
};

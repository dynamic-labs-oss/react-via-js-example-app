import {
  completeSocialRedirect,
  detectSocialRedirectUrl,
} from '@dynamic-labs-sdk/client';
import { useQuery } from '@tanstack/react-query';

type UseCompleteSocialAuthRedirectParams = {
  onSuccess?: () => void;
};

export const useCompleteSocialAuthRedirect = ({
  onSuccess,
}: UseCompleteSocialAuthRedirectParams = {}) => {
  return useQuery({
    queryFn: async () => {
      const isReturning = await detectSocialRedirectUrl({
        url: new URL(window.location.href),
      });

      if (!isReturning) {
        return false;
      }

      await completeSocialRedirect({
        url: new URL(window.location.href),
      });

      onSuccess?.();

      return true;
    },
    queryKey: ['oauth-redirect'],
    retry: false,
    staleTime: 0,
  });
};

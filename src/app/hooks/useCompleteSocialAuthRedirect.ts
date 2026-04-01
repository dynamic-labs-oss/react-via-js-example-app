import {
  completeSocialAuthentication,
  detectOAuthRedirect,
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
      const isReturning = await detectOAuthRedirect({
        url: new URL(window.location.href),
      });

      if (!isReturning) {
        return false;
      }

      await completeSocialAuthentication({
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

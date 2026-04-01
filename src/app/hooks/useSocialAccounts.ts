import { getUserSocialAccounts } from '@dynamic-labs-sdk/client';

import { useClientState } from './useClientState';

export const useSocialAccounts = () =>
  useClientState('userChanged', (client) => getUserSocialAccounts(client));

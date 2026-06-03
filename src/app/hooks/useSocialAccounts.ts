import { useUserSocialAccounts } from '@dynamic-labs-sdk/react-hooks';

export const useSocialAccounts = () => useUserSocialAccounts().data ?? [];

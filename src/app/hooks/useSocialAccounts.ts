import { useGetUserSocialAccounts } from '@dynamic-labs-sdk/react-hooks';

export const useSocialAccounts = () => useGetUserSocialAccounts().data ?? [];

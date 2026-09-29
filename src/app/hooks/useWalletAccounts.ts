import { useGetWalletAccounts } from '@dynamic-labs-sdk/react-hooks';

export const useWalletAccounts = () => useGetWalletAccounts().data ?? [];

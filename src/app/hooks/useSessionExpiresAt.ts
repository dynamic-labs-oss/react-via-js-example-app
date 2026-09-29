import { useSessionExpiresAt as useSdkSessionExpiresAt } from '@dynamic-labs-sdk/react-hooks';

export const useSessionExpiresAt = () => useSdkSessionExpiresAt().data ?? null;

import { useUser as useSdkUser } from '@dynamic-labs-sdk/react-hooks';

export const useUser = () => useSdkUser().data ?? null;

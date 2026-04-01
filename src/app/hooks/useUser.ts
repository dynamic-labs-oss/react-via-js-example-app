import { useClientState } from './useClientState';

export const useUser = () => useClientState('userChanged', (client) => client.user);

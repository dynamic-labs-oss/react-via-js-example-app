import { useClientState } from './useClientState';

export const useSessionExpiresAt = () =>
  useClientState('userChanged', (client) => client.sessionExpiresAt);

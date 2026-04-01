import { useClientState } from './useClientState';

export const useInitStatus = () => useClientState('initStatusChanged', (client) => client.initStatus);

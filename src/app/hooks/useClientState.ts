import type { DynamicClient } from '@dynamic-labs-sdk/client';
import { onEvent } from '@dynamic-labs-sdk/client';
import { useRef, useSyncExternalStore } from 'react';

import { dynamicClient } from '../constants/dynamicClient';

export const useClientState = <T>(
  eventName: keyof DynamicEvents,
  getSnapshot: (client: DynamicClient) => T
): T => {
  const valueRef = useRef(getSnapshot(dynamicClient));

  return useSyncExternalStore(
    (onStoreChange: VoidFunction) =>
      onEvent({
        event: eventName,
        listener: () => {
          valueRef.current = getSnapshot(dynamicClient);

          onStoreChange();
        },
      }),
    () => valueRef.current,
    () => valueRef.current
  );
};

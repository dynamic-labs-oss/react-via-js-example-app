import {
  type OnEventParams,
  offEvent,
  onEvent,
} from '@dynamic-labs-sdk/client';
import { useEffect, useRef } from 'react';

export const useClientEvent = <E extends keyof DynamicEvents>({
  event,
  listener,
}: OnEventParams<E>) => {
  const callbackRef = useRef(listener);

  callbackRef.current = listener;

  useEffect(() => {
    const listener: typeof callbackRef.current = (...args: any[]) => {
      // @ts-expect-error - Ignore the type error because we are using the ref
      callbackRef.current(...args);
    };

    onEvent({ event, listener });

    return () => {
      offEvent({ event, listener });
    };
  }, [event]);
};

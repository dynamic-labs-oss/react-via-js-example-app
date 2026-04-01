export { createDeferredPromise } from '@dynamic-labs-sdk/client/core';

export type DeferredPromise<T> = {
  promise: Promise<T>;
  reject: (reason?: unknown) => void;
  resolve: (value: T) => void;
};

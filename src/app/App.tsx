import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DynamicProvider } from '@dynamic-labs-sdk/react-hooks';
import type { FC } from 'react';

import { Toaster } from '../components/ui/sonner';
import { Captcha } from './components/Captcha';
import { dynamicClient } from './constants/dynamicClient';
import { Router } from './Router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export const App: FC = () => {
  return (
    <DynamicProvider client={dynamicClient}>
      <QueryClientProvider client={queryClient}>
        <Router />

        <Captcha />

        <Toaster />
      </QueryClientProvider>
    </DynamicProvider>
  );
};

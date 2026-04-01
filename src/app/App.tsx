import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { FC } from 'react';

import { Toaster } from '../components/ui/sonner';
import { Captcha } from './components/Captcha';
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
    <QueryClientProvider client={queryClient}>
      <Router />

      <Captcha />

      <Toaster />
    </QueryClientProvider>
  );
};

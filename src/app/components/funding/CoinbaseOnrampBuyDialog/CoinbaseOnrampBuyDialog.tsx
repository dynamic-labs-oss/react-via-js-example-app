import type {
  CoinbaseOnrampGetBuyUrlRequest,
  CoinbaseOnrampGetBuyUrlResponse,
} from '@dynamic-labs-sdk/client';
import { getCoinbaseBuyUrl } from '@dynamic-labs-sdk/client';
import { useMutation } from '@tanstack/react-query';
import type { FC } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ErrorMessage } from '../../ErrorMessage';
import { CoinbaseOnrampBuyForm } from '../CoinbaseOnrampBuyForm';

export const CoinbaseOnrampBuyDialog: FC = () => {
  const [isOpen, _setIsOpen] = useState(false);

  const {
    error,
    mutate: onBuyWithCoinbase,
    data: buyUrlData,
    isPending,
    reset,
  } = useMutation<
    CoinbaseOnrampGetBuyUrlResponse,
    Error,
    CoinbaseOnrampGetBuyUrlRequest
  >({
    mutationFn: (args) => {
      return getCoinbaseBuyUrl(args);
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank', 'width=500,height=600');
        setIsOpen(false);
      }
    },
  });

  const setIsOpen = (isOpen: boolean) => {
    _setIsOpen(isOpen);

    if (!isOpen) {
      reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>Buy with Coinbase</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Buy with Coinbase</DialogTitle>

        <ErrorMessage error={error} />

        {!buyUrlData && (
          <CoinbaseOnrampBuyForm
            onCancel={() => setIsOpen(false)}
            onSubmit={onBuyWithCoinbase}
            isPending={isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

import type {
  CoinbaseCreateOnrampOrderRequest,
  CoinbaseOnrampOrderResponse,
} from '@dynamic-labs-sdk/client';
import {
  addCoinbaseOnrampOrderEventListener,
  createCoinbaseOnrampOrder,
} from '@dynamic-labs-sdk/client';
import { useMutation } from '@tanstack/react-query';
import type { FC } from 'react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ErrorMessage } from '../../ErrorMessage';
import { CoinbaseOnrampOrderForm } from '../CoinbaseOnrampOrderForm';

export const CoinbaseOnrampOrderDialog: FC = () => {
  const [isOpen, _setIsOpen] = useState(false);

  const removeEventListenerRef = useRef<VoidFunction>();

  const {
    error,
    mutate: onCreateCoinbaseOnrampOrder,
    data: coinbaseOnrampOrder,
    isPending,
    reset,
  } = useMutation<
    CoinbaseOnrampOrderResponse,
    Error,
    CoinbaseCreateOnrampOrderRequest
  >({
    mutationFn: (args) => {
      return createCoinbaseOnrampOrder(args);
    },
    onSuccess: () => {
      removeEventListenerRef.current = addCoinbaseOnrampOrderEventListener({
        listener: (event) => {
          if (event.eventName === 'onramp_api.cancel') {
            setIsOpen(false);
            return;
          }

          if (event.eventName === 'onramp_api.commit_success') {
            toast.success(
              'Payment authorized successfully. Waiting for transaction to complete...'
            );
            return;
          }

          if (event.eventName === 'onramp_api.commit_error') {
            resetOnrampFlow();
            toast.error(`Payment failed. ${event.data.errorMessage}`);
            return;
          }

          if (event.eventName === 'onramp_api.polling_success') {
            toast.success('Transaction completed successfully');
            setIsOpen(false);
            return;
          }

          if (event.eventName === 'onramp_api.polling_failed') {
            resetOnrampFlow();
            toast.error(`Transaction failed. ${event.data.errorMessage}`);
            return;
          }
        },
      });
    },
  });

  const resetOnrampFlow = () => {
    removeEventListenerRef.current?.();
    reset();
  };

  const setIsOpen = (isOpen: boolean) => {
    _setIsOpen(isOpen);

    if (!isOpen) {
      resetOnrampFlow();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>
          Create Coinbase Onramp Order
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Coinbase Onramp Order</DialogTitle>

        <ErrorMessage error={error} />

        {!coinbaseOnrampOrder?.paymentLink?.url && (
          <CoinbaseOnrampOrderForm
            onCancel={() => setIsOpen(false)}
            onSubmit={onCreateCoinbaseOnrampOrder}
            isPending={isPending}
          />
        )}

        {coinbaseOnrampOrder?.paymentLink?.url && (
          <div className="flex items-center justify-center">
            <iframe
              src={coinbaseOnrampOrder.paymentLink.url}
              width="100%"
              height="500px"
              title="Coinbase Onramp Order"
              allow="payment"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

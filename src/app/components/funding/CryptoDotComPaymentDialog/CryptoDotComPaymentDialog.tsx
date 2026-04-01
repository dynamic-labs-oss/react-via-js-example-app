import type {
  CryptoDotComPaymentCreateRequest,
  CryptoDotComPaymentResponse,
} from '@dynamic-labs-sdk/client';
import { createCryptoDotComPayment } from '@dynamic-labs-sdk/client';
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
import { CryptoDotComPaymentForm } from '../CryptoDotComPaymentForm';

export const CryptoDotComPaymentDialog: FC = () => {
  const [isOpen, _setIsOpen] = useState(false);

  const {
    error,
    mutate: onCreateCryptoDotComPayment,
    data: cryptoDotComPayment,
    isPending,
    reset,
  } = useMutation<
    CryptoDotComPaymentResponse,
    Error,
    CryptoDotComPaymentCreateRequest
  >({
    mutationFn: (args) => {
      return createCryptoDotComPayment(args);
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
        <Button onClick={() => setIsOpen(true)}>
          Create crypto.com Payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Create crypto.com Payment</DialogTitle>

        <ErrorMessage error={error} />

        {!cryptoDotComPayment && (
          <CryptoDotComPaymentForm
            onCancel={() => setIsOpen(false)}
            onSubmit={onCreateCryptoDotComPayment}
            isPending={isPending}
          />
        )}

        {cryptoDotComPayment?.paymentUrl && (
          <div className="flex items-center justify-center">
            <iframe
              src={cryptoDotComPayment.paymentUrl}
              width="100%"
              height="600px"
              title="Crypto.com Payment"
              allow="payment"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

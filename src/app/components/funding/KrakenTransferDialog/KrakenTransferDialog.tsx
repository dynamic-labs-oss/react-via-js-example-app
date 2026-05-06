import type {
  ExchangeTransferResponse,
  KrakenTransferRequest,
} from '@dynamic-labs-sdk/client';
import { createKrakenExchangeTransfer } from '@dynamic-labs-sdk/client';
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
import { KrakenTransferForm } from '../KrakenTransferForm';

export const KrakenTransferDialog: FC = () => {
  const [isOpen, _setIsOpen] = useState(false);

  const {
    error,
    mutate: onCreateKrakenTransfer,
    data: krakenTransfer,
    isPending,
    reset,
  } = useMutation<
    ExchangeTransferResponse,
    Error,
    KrakenTransferRequest
  >({
    mutationFn: (args) => {
      return createKrakenExchangeTransfer(args);
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
          Transfer from Kraken
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Transfer from Kraken</DialogTitle>

        <ErrorMessage error={error} />

        {!krakenTransfer && (
          <KrakenTransferForm
            onCancel={() => setIsOpen(false)}
            onSubmit={onCreateKrakenTransfer}
            isPending={isPending}
          />
        )}

        {krakenTransfer && (
          <div className="flex flex-col gap-4 p-4 bg-muted rounded-md">
            <div className="space-y-2">
              <p className="text-sm font-medium">Transfer Created</p>
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">ID:</span>{' '}
                  {krakenTransfer.id}
                </p>
                <p>
                  <span className="text-muted-foreground">Status:</span>{' '}
                  <span className="capitalize">{krakenTransfer.status}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Amount:</span>{' '}
                  {krakenTransfer.amount} {krakenTransfer.currency}
                </p>
                <p>
                  <span className="text-muted-foreground">Created:</span>{' '}
                  {krakenTransfer.createdAt ? new Date(krakenTransfer.createdAt).toLocaleString() : '—'}
                </p>
              </div>
            </div>
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

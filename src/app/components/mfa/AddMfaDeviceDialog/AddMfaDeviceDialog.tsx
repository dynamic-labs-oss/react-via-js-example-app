import {
  authenticateTotpMfaDevice,
  isPendingRecoveryCodesAcknowledgment,
} from '@dynamic-labs-sdk/client';
import { useMutation } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { type FC, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ErrorMessage } from '../../ErrorMessage';
import { OTPConfirmationView } from '../../OTPConfirmationView';
import { RecoveryCodesView } from '../RecoveryCodesView';
import { ScanQrCodeView } from '../ScanQrCodeView';

export const AddMfaDeviceDialog: FC<{ onAdd: () => void }> = ({ onAdd }) => {
  const [isOpen, _setIsOpen] = useState(false);
  const [viewState, setViewState] = useState<
    | {
        type: 'qr-code';
      }
    | {
        deviceId: string;
        type: 'totp';
      }
    | {
        type: 'recovery-codes';
      }
  >({
    type: 'qr-code',
  });

  const { mutate: handleTotpConfirmation, error } = useMutation({
    mutationFn: async ({
      otp,
      deviceId,
    }: {
      deviceId: string;
      otp: string;
    }) => {
      await authenticateTotpMfaDevice({
        code: otp,
        deviceId,
      });

      onAdd();

      if (isPendingRecoveryCodesAcknowledgment()) {
        setViewState({
          type: 'recovery-codes',
        });
      } else {
        setIsOpen(false);
      }
    },
  });

  const setIsOpen = (isOpen: boolean) => {
    _setIsOpen(isOpen);
    if (isOpen) {
      setViewState({
        type: 'qr-code',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="rounded-full h-7 px-3 text-xs font-medium shadow-none"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Device
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <ErrorMessage error={error} />

        {viewState.type === 'qr-code' && (
          <ScanQrCodeView
            onContinue={(deviceId: string) => {
              setViewState({
                deviceId,
                type: 'totp',
              });
            }}
          />
        )}

        {viewState.type === 'totp' && (
          <OTPConfirmationView
            onSubmit={async (otp: string) => {
              await handleTotpConfirmation({
                deviceId: viewState.deviceId,
                otp,
              });
            }}
            onCancel={() =>
              setViewState({
                type: 'qr-code',
              })
            }
          />
        )}

        {viewState.type === 'recovery-codes' && (
          <RecoveryCodesView
            onContinue={() => {
              setIsOpen(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

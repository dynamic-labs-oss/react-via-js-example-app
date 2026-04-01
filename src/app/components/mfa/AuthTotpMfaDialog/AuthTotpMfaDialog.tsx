import { authenticateTotpMfaDevice } from '@dynamic-labs-sdk/client';
import { type FC, useState } from 'react';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { getErrorMessage } from '../../../functions/getErrorMessage';
import { OTPConfirmationView } from '../../OTPConfirmationView';

type AuthTotpMfaDialogProps = {
  deviceId: string;
  dialogTrigger: React.ReactNode;
  onCancel?: () => void;
  onSuccess: (mfaToken: string | undefined) => void;
};

export const AuthTotpMfaDialog: FC<AuthTotpMfaDialogProps> = ({
  deviceId,
  onCancel,
  onSuccess,
  dialogTrigger,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string>();

  const handleTotpConfirmation = async (otp: string, deviceId: string) => {
    try {
      const result = await authenticateTotpMfaDevice({
        code: otp,
        createMfaTokenOptions: {
          singleUse: true,
        },
        deviceId,
      });

      onSuccess(result.mfaToken);
      setIsOpen(false);
    } catch (error) {
      setError(getErrorMessage({ error }));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onCancel?.();
        }
        setIsOpen(open);
      }}
    >
      <DialogTrigger asChild>{dialogTrigger}</DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        {error && <div className="text-xs text-destructive">{error}</div>}

        <OTPConfirmationView
          onSubmit={async (otp: string) => {
            await handleTotpConfirmation(otp, deviceId);
          }}
          onCancel={() => {
            onCancel?.();
            setIsOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

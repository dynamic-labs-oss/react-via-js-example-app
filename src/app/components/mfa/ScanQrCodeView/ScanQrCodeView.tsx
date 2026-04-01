import { registerTotpMfaDevice } from '@dynamic-labs-sdk/client';
import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';

import { Button } from '../../../../components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { QrCode } from '../../QrCode';

export const ScanQrCodeView: FC<{
  onContinue: (deviceId: string) => void;
}> = ({ onContinue }) => {
  const { data } = useQuery({
    queryFn: () => registerTotpMfaDevice(),
    queryKey: ['register-totp-mfa-device'],
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Secure your account</DialogTitle>

        <DialogDescription>Setup a new sign-in method in your authenticator app.</DialogDescription>
      </DialogHeader>

      <QrCode value={data?.uri ?? ''} />

      <Button onClick={() => data?.id && onContinue(data.id)} disabled={!data?.id}>Continue</Button>
    </>
  );
};
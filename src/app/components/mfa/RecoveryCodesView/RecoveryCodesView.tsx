import {
  acknowledgeRecoveryCodes,
  getMfaRecoveryCodes,
} from '@dynamic-labs-sdk/client';
import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { useState } from 'react';

import { Button } from '../../../../components/ui/button';
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Label } from '../../../../components/ui/label';
import { Switch } from '../../../../components/ui/switch';

export const RecoveryCodesView: FC<{ onContinue: () => void }> = ({
  onContinue,
}) => {
  const { data } = useQuery({
    queryFn: () => getMfaRecoveryCodes(),
    queryKey: ['get-mfa-recovery-codes'],
  });

  const [ack, setAck] = useState(false);

  const handleContinue = async () => {
    await acknowledgeRecoveryCodes();

    onContinue();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Back up your codes</DialogTitle>

        <DialogDescription>
          Backup codes help recover your account if you lose access to your
          device. Each code can be used only 1 time.
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-4 my-4">
        {data?.recoveryCodes?.map((code) => (
          <div
            key={code}
            className="p-3 bg-muted/50 rounded-lg text-center font-mono text-sm text-foreground"
          >
            {code}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <Label htmlFor="acknowledge" className="text-muted-foreground">
          I've safely stored a copy of my backup codes
        </Label>
        <Switch
          id="acknowledge"
          checked={ack}
          onCheckedChange={setAck}
        />
      </div>

      <Button onClick={handleContinue} disabled={!ack}>
        Complete
      </Button>
    </>
  );
};

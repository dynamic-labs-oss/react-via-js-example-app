import { type MFADevice, deleteMfaDevice } from '@dynamic-labs-sdk/client';
import { useMutation } from '@tanstack/react-query';
import { type FC, useState } from 'react';

import { Button } from '../../../../components/ui/button';
import { ErrorMessage } from '../../ErrorMessage';
import { AuthTotpMfaDialog } from '../AuthTotpMfaDialog';

export const MfaDeviceCard: FC<{ device: MFADevice; onDelete: () => void }> = ({
  device,
  onDelete,
}) => {
  const [mfaToken, setMfaToken] = useState<string | undefined>();

  const { mutate: onDeleteAuthSuccess, error } = useMutation({
    mutationFn: async (mfaToken: string | undefined) => {
      if (!mfaToken) {
        throw new Error('No MFA token found');
      }

      if (!device.id) {
        throw new Error('Missing device ID');
      }

      await deleteMfaDevice({ deviceId: device.id, mfaAuthToken: mfaToken });
      onDelete();
    },
  });

  const onAuthSuccess = async (mfaToken: string | undefined) => {
    setMfaToken(mfaToken);
  };

  if (!device.id) {
    return null;
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center flex-shrink-0 ring-1 ring-black/[0.06]">
          <span className="text-xs font-semibold text-muted-foreground">
            {device.type === 'totp' ? 'T' : 'M'}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {device.alias || device.type?.toUpperCase() || 'MFA Device'}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            {device.createdAt && <span>{formatDate(device.createdAt)}</span>}
            {device.verified && (
              <>
                <span className="text-border">·</span>
                <span className="text-emerald-600">Verified</span>
              </>
            )}
            {device._default && (
              <>
                <span className="text-border">·</span>
                <span>Default</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 [&_button]:rounded-full [&_button]:h-7 [&_button]:px-3 [&_button]:text-xs [&_button]:font-medium [&_button]:shadow-none [&_button]:border [&_button]:border-border/50">
          <AuthTotpMfaDialog
            deviceId={device.id}
            onSuccess={onDeleteAuthSuccess}
            dialogTrigger={
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground/50 hover:text-destructive hover:bg-destructive/5 hover:border-destructive/20"
              >
                Delete
              </Button>
            }
          />

          <AuthTotpMfaDialog
            onCancel={() => setMfaToken(undefined)}
            deviceId={device.id}
            onSuccess={onAuthSuccess}
            dialogTrigger={
              <Button variant="ghost" size="sm">
                Authenticate
              </Button>
            }
          />
        </div>
      </div>

      {mfaToken && (
        <div className="mt-2.5 ml-11">
          <p className="text-[11px] text-muted-foreground mb-1">MFA Token</p>
          <code className="text-[11px] font-mono bg-muted/30 px-2 py-1 rounded text-foreground break-all">
            {mfaToken}
          </code>
        </div>
      )}

      {error && (
        <div className="mt-2.5 ml-11">
          <ErrorMessage error={error} />
        </div>
      )}
    </div>
  );
};

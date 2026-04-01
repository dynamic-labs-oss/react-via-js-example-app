import {
  type DeviceRegistrationResponse,
  parseUserAgent,
  revokeRegisteredDevice,
} from '@dynamic-labs-sdk/client';
import { useMutation } from '@tanstack/react-query';
import { Smartphone } from 'lucide-react';
import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import { ErrorMessage } from '../ErrorMessage';

export const RegisteredDeviceCard: FC<{
  device: DeviceRegistrationResponse;
  onDelete: () => void;
}> = ({ device, onDelete }) => {
  const { mutate: handleDelete, error } = useMutation({
    mutationFn: async () => {
      await revokeRegisteredDevice({ deviceRegistrationId: device.id });
      onDelete();
    },
  });

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  const deviceName = device.userAgent
    ? parseUserAgent({ userAgent: device.userAgent })?.displayText ?? null
    : null;

  const truncatedId =
    device.id.length > 12
      ? `${device.id.slice(0, 6)}...${device.id.slice(-6)}`
      : device.id;

  return (
    <div className="px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center flex-shrink-0 ring-1 ring-black/[0.06]">
          <Smartphone className="w-4 h-4 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-foreground truncate">
              {deviceName}
            </p>
            {device.isCurrentDevice && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary ring-1 ring-inset ring-primary/20">
                Current
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{truncatedId}</span>
            {device.createdAt && (
              <span>
                {formatDate(new Date(device.createdAt).toISOString())}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 [&_button]:rounded-full [&_button]:h-7 [&_button]:px-3 [&_button]:text-xs [&_button]:font-medium [&_button]:shadow-none [&_button]:border [&_button]:border-border/50">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground/50 hover:text-destructive hover:bg-destructive/5 hover:border-destructive/20"
            onClick={() => handleDelete()}
          >
            Delete
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-2.5 ml-11">
          <ErrorMessage error={error} />
        </div>
      )}
    </div>
  );
};
